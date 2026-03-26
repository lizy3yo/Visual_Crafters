'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  DollarSign, Plus, QrCode, Banknote, TrendingUp,
  Pencil, Trash2, X, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useToast }   from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { ITransaction, PaymentMethod } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Summary { daily: number; weekly: number; monthly: number; }

interface State {
  transactions: ITransaction[];
  summary:      Summary;
  loading:      boolean;
  error:        string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; transactions: ITransaction[]; summary: Summary }
  | { type: 'FETCH_ERR'; error: string }
  | { type: 'UPSERT'; transaction: ITransaction }
  | { type: 'REMOVE'; id: string };

function calcSummary(txns: ITransaction[]): Summary {
  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yyyymm   = todayStr.slice(0, 7);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const weekDates: string[] = [];
  for (let d = new Date(weekStart); d <= now; d.setDate(d.getDate() + 1))
    weekDates.push(d.toISOString().slice(0, 10));

  return {
    daily:   txns.filter(t => t.date === todayStr).reduce((s, t) => s + t.amount, 0),
    weekly:  txns.filter(t => weekDates.includes(t.date)).reduce((s, t) => s + t.amount, 0),
    monthly: txns.filter(t => t.date.startsWith(yyyymm)).reduce((s, t) => s + t.amount, 0),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_OK':
      return { loading: false, error: null, transactions: action.transactions, summary: action.summary };
    case 'FETCH_ERR':
      return { ...state, loading: false, error: action.error };
    case 'UPSERT': {
      const exists = state.transactions.some(t => t._id === action.transaction._id);
      const txns   = exists
        ? state.transactions.map(t => t._id === action.transaction._id ? action.transaction : t)
        : [action.transaction, ...state.transactions];
      return { ...state, transactions: txns, summary: calcSummary(txns) };
    }
    case 'REMOVE': {
      const txns = state.transactions.filter(t => t._id !== action.id);
      return { ...state, transactions: txns, summary: calcSummary(txns) };
    }
    default: return state;
  }
}

// ── Payment badge styles ───────────────────────────────────────────────────────
const PAYMENT_STYLES: Record<PaymentMethod, string> = {
  QR:   'bg-violet-50 text-violet-600 border border-violet-200',
  Cash: 'bg-gray-100  text-gray-600   border border-gray-200',
};

// ── Formatters ─────────────────────────────────────────────────────────────────
function formatAmt(n: number) { return `₱${n.toLocaleString()}`; }
function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── TransactionModal ──────────────────────────────────────────────────────────
interface TemplateOption { _id: string; title: string; price: number; category: string; }

interface ModalProps {
  initial?: ITransaction;
  onClose:  () => void;
  onSaved:  (t: ITransaction) => void;
}

const EMPTY_FORM = {
  client:   '',
  service:  '',
  template: '',
  payment:  'QR' as PaymentMethod,
  amount:   '',
  date:     new Date().toISOString().slice(0, 10),
  notes:    '',
};

function TransactionModal({ initial, onClose, onSaved }: ModalProps) {
  const { toast } = useToast();
  const [form, setForm]     = useState(
    initial
      ? { ...initial, amount: String(initial.amount), notes: initial.notes ?? '' }
      : EMPTY_FORM,
  );
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [categories,  setCategories]  = useState<string[]>([]);
  const [templates,   setTemplates]   = useState<TemplateOption[]>([]);
  const [tmplLoading, setTmplLoading] = useState(true);

  // Fetch categories + published templates in parallel on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/templates/categories', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/templates',            { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([catData, tmplData]) => {
        setCategories(catData.categories ?? []);
        const published = (tmplData.templates ?? []).filter((t: any) => t.status === 'published');
        setTemplates(published);
      })
      .catch(() => { /* dropdowns stay empty — user can still type */ })
      .finally(() => setTmplLoading(false));
  }, []);

  function handleServiceChange(category: string) {
    // Reset template whenever the category changes
    setForm(f => ({ ...f, service: category, template: '', amount: f.amount }));
  }

  function handleTemplateChange(title: string) {
    const match = templates.find(t => t.title === title);
    setForm(f => ({
      ...f,
      template: title,
      // Always reflect the template's price in the Amount field
      ...(match ? { amount: String(match.price) } : {}),
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.client.trim())   e.client  = 'Client name is required.';
    if (!form.service.trim())  e.service = 'Service is required.';
    if (!form.payment)         e.payment = 'Payment method is required.';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0)
      e.amount = 'Enter a valid amount.';
    if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date))
      e.date = 'Enter a valid date.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const url    = initial ? `/api/admin/transactions/${initial._id}` : '/api/admin/transactions';
      const method = initial ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
      toast(initial ? 'Transaction updated.' : 'Transaction added.', 'success');
      onSaved(data.transaction);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function field(key: string, label: string, node: React.ReactNode) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        {node}
        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
      </div>
    );
  }

  const inp = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('client', 'Client Name',
              <input className={inp} value={form.client} placeholder="e.g. Maria Santos"
                onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
            )}

            {/* Service — driven by the same categories as the template manager */}
            {field('service', 'Service / Category',
              <select
                className={`${inp} ${!form.service ? 'text-gray-400' : ''}`}
                value={form.service}
                onChange={e => handleServiceChange(e.target.value)}
                disabled={tmplLoading}
              >
                <option value="" disabled>
                  {tmplLoading ? 'Loading categories…' : 'Select a category'}
                </option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* Template — filtered to the selected category */}
            {field('template', 'Template',
              <select
                className={`${inp} ${!form.template ? 'text-gray-400' : ''}`}
                value={form.template}
                onChange={e => handleTemplateChange(e.target.value)}
                disabled={tmplLoading || !form.service}
              >
                <option value="">
                  {!form.service
                    ? 'Select a category first'
                    : tmplLoading
                      ? 'Loading…'
                      : 'None'}
                </option>
                {templates
                  .filter(t => t.category === form.service)
                  .map(t => (
                    <option key={t._id} value={t.title}>{t.title}</option>
                  ))}
              </select>
            )}

            {field('payment', 'Payment Method',
              <select className={inp} value={form.payment}
                onChange={e => setForm(f => ({ ...f, payment: e.target.value as PaymentMethod }))}>
                <option value="QR">QR</option>
                <option value="Cash">Cash</option>
              </select>
            )}
            {field('amount', 'Amount (₱)',
              <input className={inp} type="number" min="0" step="0.01" value={form.amount}
                placeholder="0"
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            )}
            {field('date', 'Date',
              <input className={inp} type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            )}
          </div>

          {field('notes', 'Notes (optional)',
            <textarea className={`${inp} resize-none h-20`} value={form.notes}
              placeholder="Any additional details…"
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const COLUMNS = ['Client', 'Service', 'Template', 'Payment', 'Amount', 'Date', ''];

export default function TransactionsPage() {
  const { toast }   = useToast();
  const { confirm } = useConfirm();

  const [state, dispatch] = useReducer(reducer, {
    transactions: [],
    summary:      { daily: 0, weekly: 0, monthly: 0 },
    loading:      true,
    error:        null,
  });

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<ITransaction | undefined>();
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // ── Fetch all transactions ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res  = await fetch('/api/admin/transactions', { credentials: 'include' });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to load.');
      dispatch({ type: 'FETCH_OK', transactions: data.transactions, summary: data.summary });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERR', error: err.message });
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── SSE subscription ────────────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource('/api/admin/transactions/sse', { withCredentials: true });
    sseRef.current = es;

    es.addEventListener('transaction:created', (e) => {
      const t: ITransaction = JSON.parse(e.data);
      dispatch({ type: 'UPSERT', transaction: t });
    });
    es.addEventListener('transaction:updated', (e) => {
      const t: ITransaction = JSON.parse(e.data);
      dispatch({ type: 'UPSERT', transaction: t });
    });
    es.addEventListener('transaction:deleted', (e) => {
      const { id } = JSON.parse(e.data);
      dispatch({ type: 'REMOVE', id });
    });
    es.onerror = () => {
      // EventSource auto-reconnects; nothing to handle here
    };

    return () => { es.close(); sseRef.current = null; };
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  function openAdd()               { setEditTarget(undefined); setModalOpen(true); }
  function openEdit(t: ITransaction) { setEditTarget(t); setModalOpen(true); }

  function handleSaved(t: ITransaction) {
    dispatch({ type: 'UPSERT', transaction: t });
    setModalOpen(false);
  }

  async function handleDelete(t: ITransaction) {
    const ok = await confirm({
      title:        'Delete transaction?',
      description:  `This will permanently remove the ₱${t.amount.toLocaleString()} transaction from ${t.client}.`,
      confirmLabel: 'Delete',
      danger:       true,
    });
    if (!ok) return;

    setDeletingId(t._id);
    try {
      const res  = await fetch(`/api/admin/transactions/${t._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete.');
      dispatch({ type: 'REMOVE', id: t._id });
      toast('Transaction deleted.', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render helpers ──────────────────────────────────────────────────────────
  const { transactions, summary, loading, error } = state;

  const SUMMARY_CARDS = [
    { label: 'Daily Income',   value: summary.daily,   change: null },
    { label: 'Weekly Income',  value: summary.weekly,  change: null },
    { label: 'Monthly Income', value: summary.monthly, change: null },
  ];

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track all payments and income records.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUMMARY_CARDS.map(({ label, value, change }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg p-2.5 bg-sky-100 text-sky-600">
                <DollarSign size={18} />
              </div>
              {change && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                  <TrendingUp size={11} />
                  {change}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '—' : formatAmt(value)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            <AlertCircle size={15} />
            <span className="flex-1">{error}</span>
            <button onClick={fetchData} className="flex items-center gap-1.5 text-xs font-medium underline hover:no-underline">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {COLUMNS.map((col, i) => (
                  <th
                    key={i}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap last:w-16"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {COLUMNS.map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 rounded bg-gray-100 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-gray-400">
                    No transactions found. Click <strong>Add Transaction</strong> to get started.
                  </td>
                </tr>
              )}

              {!loading && transactions.map(row => (
                <tr key={row._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.service}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.template || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[row.payment]}`}>
                      {row.payment === 'QR' ? <QrCode size={11} /> : <Banknote size={11} />}
                      {row.payment}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-semibold text-sky-600">
                    {formatAmt(row.amount)}
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(row.date)}</td>

                  {/* Row actions */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(row)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        title="Delete"
                        disabled={deletingId === row._id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === row._id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            {loading ? 'Loading…' : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <TransactionModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

    </div>
  );
}
