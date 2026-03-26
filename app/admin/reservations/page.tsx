'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, X, Trash2, FileText, InboxIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import TimePicker from '@/components/ui/TimePicker';
import StatusBadge from '@/components/ui/StatusBadge';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Reservation {
  _id:        string;
  clientName: string;
  contact:    string;
  email:      string;
  service:    string;
  date:       string;
  timeSlot:   string;
  notes?:     string;
  status:     'Scheduled' | 'Serving' | 'Done' | 'Cancelled';
}

function DayModal({ date, onClose, reservations, requests }: { date: string; onClose: () => void; reservations: Reservation[]; requests: any[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Events on {new Date(date + 'T00:00:00').toLocaleDateString()}</h2>
            <p className="text-xs text-gray-400">Reservations and client requests for this date</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Reservations</h3>
            {reservations.length === 0 ? (
              <p className="text-xs text-gray-400">No reservations.</p>
            ) : (
              <ul className="space-y-2">
                {reservations.map(r => (
                  <li key={r._id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{r.clientName}</div>
                        <div className="text-xs text-gray-500">{r.service} • {r.timeSlot}</div>
                      </div>
                      <div className="shrink-0"><StatusBadge status={r.status} /></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Client Requests</h3>
            {requests.length === 0 ? (
              <p className="text-xs text-gray-400">No client requests.</p>
            ) : (
              <ul className="space-y-2">
                {requests.map(q => (
                  <li key={q._id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{q.fullName}</div>
                        <div className="text-xs text-gray-500">{q.service} • {q.templateTitle ?? '—'}</div>
                      </div>
                      <div className="shrink-0"><StatusBadge status={q.status} /></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Scheduled: 'bg-gray-50  border-gray-100',
  Serving:   'bg-sky-50   border-sky-200',
  Done:      'bg-emerald-50 border-emerald-200',
  Cancelled: 'bg-red-50   border-red-200',
};
const STATUS_TEXT: Record<string, string> = {
  Scheduled: 'text-gray-800',
  Serving:   'text-sky-700',
  Done:      'text-emerald-700',
  Cancelled: 'text-red-600',
};
const BADGE_STYLES: Record<string, string> = {
  Scheduled: 'bg-gray-200  text-gray-500',
  Serving:   'bg-sky-500   text-white',
  Done:      'bg-emerald-500 text-white',
  Cancelled: 'bg-red-400   text-white',
};

const SERVICES = [
  'Logo Design',
  'Branding & Marketing Materials',
  'Presentations & Infographics',
  'Customized Design Request',
  'Other',
];

const TIME_SLOTS = [
  '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
  '3:00 PM','3:30 PM','4:00 PM','4:30 PM',
];

// ── Calendar helpers ──────────────────────────────────────────────────────────
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function monthName(m: number) { return new Date(2000, m, 1).toLocaleString('default', { month: 'long' }); }

// ── Add Reservation Modal ─────────────────────────────────────────────────────
function AddModal({ selectedDate, onClose, onSaved, initial }: {
  selectedDate: string;
  onClose:  () => void;
  onSaved:  (r: Reservation) => void;
  initial?: Partial<Record<string, string>>;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? '',
    contact:    initial?.contact ?? '',
    email:      initial?.email ?? '',
    service:    initial?.service ?? '',
    date:       initial?.date ?? selectedDate,
    timeSlot:   initial?.timeSlot ?? '',
    notes:      initial?.notes ?? '',
  });

  useEffect(() => {
    // If initial changes (e.g., converting a request), update the form values
    setForm(prev => ({
      ...prev,
      clientName: initial?.clientName ?? prev.clientName,
      contact:    initial?.contact ?? prev.contact,
      email:      initial?.email ?? prev.email,
      service:    initial?.service ?? prev.service,
      date:       initial?.date ?? prev.date,
      timeSlot:   initial?.timeSlot ?? prev.timeSlot,
      notes:      initial?.notes ?? prev.notes,
    }));
  }, [initial, selectedDate]);
  const [errors,     setErrors]     = useState({} as Record<string, string>);
  const [submitting, setSubmitting] = useState(false);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.clientName.trim()) e.clientName = 'Client name is required.';
    if (!form.contact.trim())    e.contact    = 'Contact is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.service)           e.service    = 'Service is required.';
    if (!form.date)              e.date       = 'Date is required.';
    if (!form.timeSlot)          e.timeSlot   = 'Time slot is required.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res  = await fetch('/api/admin/reservations', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 401) { toast('Your session has expired. Please log in again.', 'error'); return; }
      if (!res.ok) { toast(data.error ?? 'Failed to save.', 'error'); return; }
      toast('Reservation added.', 'success');
      onSaved(data.reservation);
      onClose();
    } catch { toast('Something went wrong.', 'error'); }
    finally { setSubmitting(false); }
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f4db8] focus:border-transparent transition ${errors[field] ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Add Reservation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="add-res-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name *</label>
                <input type="text" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Full name" className={inputCls('clientName')} />
                {errors.clientName && <p className="mt-1 text-xs text-red-500">{errors.clientName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact *</label>
                <input type="tel" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="09XX XXX XXXX" className={inputCls('contact')} />
                {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@example.com" className={inputCls('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service *</label>
              <select value={form.service} onChange={e => set('service', e.target.value)} className={inputCls('service')}>
                <option value="" disabled>Select a service</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  min={toYMD(new Date())} className={inputCls('date')} />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Time Slot *</label>
                <TimePicker
                  value={form.timeSlot}
                  onChange={v => set('timeSlot', v)}
                  error={!!errors.timeSlot}
                />
                {errors.timeSlot && <p className="mt-1 text-xs text-red-500">{errors.timeSlot}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes <span className="font-normal text-gray-400">(Optional)</span></label>
              <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Any additional notes..." className={`${inputCls('notes')} resize-none`} />
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 space-y-2 shrink-0">
          <button type="submit" form="add-res-form" disabled={submitting}
            className="w-full rounded-xl bg-[#1f4db8] hover:bg-[#0f1d89] disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors">
            {submitting ? 'Saving…' : 'Add Reservation'}
          </button>
          <button type="button" onClick={onClose} disabled={submitting}
            className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2.5 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Requests Modal (shows client-submitted requests) ──────────────────────
function RequestsModal({ onClose, onConvert }: { onClose: () => void; onConvert: (req: any) => void }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState([] as any[]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/client-requests', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setRequests(data.requests ?? []);
    } catch (e) {
      toast('Failed to load client requests.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRequests();
    const es = new EventSource('/api/client-requests/sse', { withCredentials: true });
    es.addEventListener('request:created', (e: MessageEvent) => {
      const r = JSON.parse(e.data);
      setRequests(prev => [r, ...prev]);
      toast(`New request from ${r.fullName}`, 'info');
    });
    es.addEventListener('request:updated', (e: MessageEvent) => {
      const r = JSON.parse(e.data);
      setRequests(prev => prev.map(x => x._id === r._id ? r : x));
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Client Requests</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">Close</button>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">No client requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map(r => (
                <li key={r._id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{r.fullName}</div>
                    <div className="text-xs text-gray-500">{r.service} • {new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{r.email} • {r.contact}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ activeDates, activeCounts, activeResMap, activeReqMap, selectedDate, onSelect }: {
  activeDates:  string[];
  activeCounts?: Record<string, number>;
  activeResMap?: Record<string, Reservation[]>;
  activeReqMap?: Record<string, any[]>;
  selectedDate: string;
  onSelect:     (d: string) => void;
}) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [hover, setHover] = useState<string | null>(null);

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWk = getFirstDayOfWeek(year, month);
  const prevDays     = getDaysInMonth(year, month - 1);

  const cells: { day: number; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = firstDayOfWk - 1; i >= 0; i--) cells.push({ day: prevDays - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++)       cells.push({ day: d, type: 'curr' });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)         cells.push({ day: d, type: 'next' });

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function next() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  function cellDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 select-none">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Calendar</h2>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Previous month"><ChevronLeft size={15} /></button>
        <span className="text-sm font-medium text-gray-700">{monthName(month)} {year}</span>
        <button onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Next month"><ChevronRight size={15} /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
              const isCurr   = cell.type === 'curr';
              const dateStr  = isCurr ? cellDate(cell.day) : '';
          const isToday  = isCurr && dateStr === toYMD(today);
          const isSel    = isCurr && dateStr === selectedDate;
              const hasEvent = isCurr && activeDates.includes(dateStr);
              const count = isCurr && activeCounts ? (activeCounts[dateStr] ?? 0) : 0;
              const resItems = isCurr && activeResMap ? (activeResMap[dateStr] ?? []) : [];
              const reqItems = isCurr && activeReqMap ? (activeReqMap[dateStr] ?? []) : [];
              const previewItems = [...resItems.map(r => ({ type: 'res', payload: r })), ...reqItems.map(q => ({ type: 'req', payload: q }))];

          return (
            <button key={i}
              disabled={!isCurr}
              onClick={() => isCurr && onSelect(dateStr)}
              onMouseEnter={() => isCurr && setHover(dateStr)}
              onMouseLeave={() => setHover(prev => prev === dateStr ? null : prev)}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors
                ${!isCurr ? 'text-gray-300 cursor-default' : ''}
                ${isCurr && !isToday && !isSel ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${isToday && !isSel ? 'bg-sky-500 text-white font-semibold' : ''}
                ${isSel && !isToday ? 'border border-sky-400 text-sky-600 font-semibold' : ''}
                ${isSel && isToday  ? 'bg-sky-500 text-white font-semibold' : ''}
              `}
            >
              {cell.day}
              {hasEvent && count <= 1 && (
                <span className={isSel ? "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm" : "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400"} />
              )}
              {hasEvent && count > 1 && (
                <span className={isSel ? "absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-white text-sky-600 text-[10px] leading-4 w-5 h-5 rounded-full flex items-center justify-center font-semibold border border-sky-200" : "absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-sky-500 text-white text-[10px] leading-4 w-5 h-5 rounded-full flex items-center justify-center font-semibold"}>{count}</span>
              )}

              {hover === dateStr && previewItems.length > 0 && (
                <div className="absolute z-50 top-9 left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-200 rounded-md shadow-lg text-xs text-gray-700 p-2">
                  <div className="font-medium text-sm mb-1">{monthName(month)} {dateStr.split('-')[2]}</div>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {previewItems.slice(0, 5).map((it, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="text-[11px] text-gray-500 w-8">
                          {it.type === 'res' ? (it.payload.timeSlot ?? '') : (new Date(it.payload.createdAt).toLocaleTimeString())}
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium text-gray-800 truncate">{it.type === 'res' ? it.payload.clientName : it.payload.fullName}</div>
                          <div className="text-[11px] text-gray-500 truncate">{it.type === 'res' ? it.payload.service : it.payload.service}</div>
                        </div>
                      </div>
                    ))}
                    {previewItems.length > 5 && <div className="text-[11px] text-gray-400">+{previewItems.length - 5} more</div>}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
// ── Request View Modal (reuse from client requests) ---------------------------
function RequestViewModal({ request, onClose, onStatusChange }: {
  request: any;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleStatus(status: string) {
    setUpdating(true);
    await onStatusChange(request._id, status);
    setUpdating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{request.fullName}&apos;s Request</h2>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(request.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Service</p>
              <p className="text-sm font-semibold text-gray-800">{request.service}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Template</p>
              <p className="text-sm font-semibold text-gray-800">{request.templateTitle ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Price</p>
              <p className="text-sm font-semibold text-gray-800">{request.templatePrice != null ? `₱${request.templatePrice.toLocaleString()}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
              <p className="text-sm font-semibold text-gray-800">{request.deadline}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{request.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Contact</p>
              <p className="text-sm font-semibold text-gray-800">{request.contact}</p>
            </div>
          </div>

          {request.description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{request.description}</p>
            </div>
          )}

          {request.fileUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Reference File</p>
              <a href={request.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                <FileText size={13} /> View File
              </a>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {['Pending','In Progress','Completed','Cancelled'].map(s => (
                <button key={s} disabled={updating || request.status === s} onClick={() => handleStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${request.status === s ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ReservationsPage() {
  const { toast }   = useToast();
  const { confirm } = useConfirm();

  const today = toYMD(new Date());
  const [selectedDate,  setSelectedDate]  = useState(today);
  const [reservations,  setReservations]  = useState([] as Reservation[]);
  const [activeDates,   setActiveDates]   = useState([] as string[]);
  const [loading,       setLoading]       = useState(true);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [addInitial, setAddInitial] = useState(undefined as Partial<Record<string,string>> | undefined);
  const [clientRequests, setClientRequests] = useState([] as any[]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null as any | null);
  const [statusFilter, setStatusFilter] = useState('all' as 'all' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled');

  const fetchAll = useCallback(async () => {
    try {
      // client-side cache (stale-while-revalidate): use sessionStorage for short TTL
      const cacheKey = 'reservations:all:cache';
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = Date.now() - (cached.ts ?? 0);
        if (age < 15_000 && cached.payload) {
          setReservations(cached.payload.reservations ?? []);
          setActiveDates(cached.payload.dates ?? []);
          setLoading(false);
        }
      }

      const res  = await fetch('/api/admin/reservations', { credentials: 'include' });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (res.ok) {
        setReservations(data.reservations ?? []);
        setActiveDates(data.dates ?? []);
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), payload: data })); } catch {}
      } else {
        toast(data.error ?? 'Failed to load reservations.', 'error');
      }
    } catch { toast('Failed to load reservations.', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    fetchAll();

    const es = new EventSource('/api/admin/reservations/sse', { withCredentials: true });

    es.addEventListener('reservation:created', (e: MessageEvent) => {
      const r: Reservation = JSON.parse(e.data);
      setReservations(prev => [...prev, r].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)));
      setActiveDates(prev => prev.includes(r.date) ? prev : [...prev, r.date]);
      toast(`New reservation: ${r.clientName}`, 'info');
    });

    es.addEventListener('reservation:updated', (e: MessageEvent) => {
      const r: Reservation = JSON.parse(e.data);
      setReservations(prev => prev.map(x => x._id === r._id ? r : x));
    });

    es.addEventListener('reservation:deleted', (e: MessageEvent) => {
      const { id } = JSON.parse(e.data);
      setReservations(prev => prev.filter(x => x._id !== id));
    });

    es.onerror = () => es.close();
    return () => es.close();
  }, [fetchAll, toast]);

  // Fetch client requests for admin queue and subscribe to SSE
  useEffect(() => {
    let es: EventSource | null = null;
    const cacheKey = 'clientRequests:all:cache';

    const fetchRequests = async () => {
      try {
        // client-side short cache
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            const age = Date.now() - (cached.ts ?? 0);
            if (age < 15_000 && cached.payload) {
              setClientRequests(cached.payload.requests ?? []);
              // merge deadlines into activeDates
              const deadlines = (cached.payload.requests ?? [])
                .map((r: any) => { try { return toYMD(new Date(r.deadline)); } catch { return null; } })
                .filter(Boolean);
              setActiveDates(prev => Array.from(new Set([...prev, ...deadlines])));
              setRequestsLoading(false);
            }
          } catch {}
        }

        const res = await fetch('/api/client-requests', { credentials: 'include' });
        const data = await res.json();
        if (res.status === 401) {
          toast('Your session has expired. Please log in again.', 'error');
          return;
        }
        if (res.ok) {
          setClientRequests(data.requests ?? []);
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), payload: { requests: data.requests ?? [] } })); } catch {}
          const deadlines = (data.requests ?? [])
            .map((r: any) => { try { return toYMD(new Date(r.deadline)); } catch { return null; } })
            .filter(Boolean);
          setActiveDates(prev => Array.from(new Set([...prev, ...deadlines])));
        } else {
          toast(data.error ?? 'Failed to load client requests.', 'error');
        }
      } catch (e) { toast('Failed to load client requests.', 'error'); }
      finally { setRequestsLoading(false); }
    };

    fetchRequests();
    try {
      es = new EventSource('/api/client-requests/sse', { withCredentials: true });
      es.addEventListener('request:created', (e: MessageEvent) => {
        const r = JSON.parse(e.data);
        setClientRequests(prev => [r, ...prev]);
        try {
          const d = toYMD(new Date(r.deadline));
          setActiveDates(prev => prev.includes(d) ? prev : [...prev, d]);
        } catch {}
        toast(`New request from ${r.fullName}`, 'info');
      });
      es.addEventListener('request:updated', (e: MessageEvent) => {
        const r = JSON.parse(e.data);
        setClientRequests(prev => prev.map(x => x._id === r._id ? r : x));
      });
      es.onerror = () => es && es.close();
    } catch (err) {
      console.error('[Reservations] SSE client-requests error', err);
    }

    return () => { if (es) es.close(); };
  }, [toast]);

  // -- request view / status update (admin)
  async function handleRequestStatusChange(id: string, status: string) {
    const ok = await confirm({
      title: `Set status to "${status}"?`,
      description: 'This will update the request status.',
      confirmLabel: 'Update',
      danger: status === 'Cancelled',
    });
    if (!ok) return;

    try {
      const res = await fetch('/api/client-requests', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) { toast(data.error ?? 'Failed to update.', 'error'); return; }
      const updated = data.request;
      setClientRequests(prev => prev.map(x => x._id === updated._id ? updated : x));
      setSelectedRequest((prev: any) => prev?._id === updated._id ? updated : prev);
      toast(`Status set to "${status}".`, 'success');
    } catch { toast('Something went wrong.', 'error'); }
  }

  // Filter by selected date
  const queue = reservations
    .filter(r => r.date === selectedDate)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  async function handleStatusChange(id: string, status: string) {
    const ok = await confirm({
      title:        `Set to "${status}"?`,
      description:  'This will update the reservation status.',
      confirmLabel: 'Update',
      danger:       status === 'Cancelled',
    });
    if (!ok) return;

    try {
      const res  = await fetch('/api/admin/reservations', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) { toast(data.error ?? 'Failed to update.', 'error'); return; }
      const updated: Reservation = data.reservation;
      setReservations(prev => prev.map(x => x._id === updated._id ? updated : x));
      toast(`Status set to "${status}".`, 'success');
    } catch { toast('Something went wrong.', 'error'); }
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({
      title:        `Remove ${name}'s reservation?`,
      description:  'This action cannot be undone.',
      confirmLabel: 'Remove',
      danger:       true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/reservations?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.status === 401) {
        toast('Your session has expired. Please log in again.', 'error');
        return;
      }
      if (!res.ok) { toast(data.error ?? 'Failed to delete.', 'error'); return; }
      setReservations(prev => prev.filter(x => x._id !== id));
      toast('Reservation removed.', 'success');
    } catch (e) { toast('Something went wrong.', 'error'); }
  }

  const requestCount = clientRequests.length;

  const activeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of clientRequests) {
      try {
        const d = toYMD(new Date(r.deadline));
        m[d] = (m[d] || 0) + 1;
      } catch {}
    }
    return m;
  }, [clientRequests]);

  const [showDayModal, setShowDayModal] = useState(false);

  const resMap = useMemo(() => {
    const m: Record<string, Reservation[]> = {};
    for (const r of reservations) {
      m[r.date] = m[r.date] ?? [];
      m[r.date].push(r);
    }
    return m;
  }, [reservations]);

  const reqMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const q of clientRequests) {
      try {
        const d = toYMD(new Date(q.deadline));
        m[d] = m[d] ?? [];
        m[d].push(q);
      } catch {}
    }
    return m;
  }, [clientRequests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Reservations &amp; Queue</h1>
          <p className="mt-0.5 text-sm text-gray-500">View scheduled appointments and the current service queue.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Calendar */}
        <div className="lg:col-span-2">
          <MiniCalendar
            activeDates={activeDates}
            activeCounts={activeCounts}
            activeResMap={resMap}
            activeReqMap={reqMap}
            selectedDate={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setShowDayModal(true); }}
          />
        </div>

        {/* Queue list */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Queue List
              <span className="ml-2 text-xs font-normal text-gray-400">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
              <Users size={12} />
              {requestCount} in queue
            </span>
          </div>

          {loading || requestsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                {(['all','Pending','In Progress','Completed','Cancelled'] as const).map(s => (
                  <button key={s}
                    onClick={() => setStatusFilter(s as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${statusFilter === s ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">

                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {clientRequests.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100">
                        <InboxIcon size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No requests yet</p>
                    </div>
                  ) : clientRequests
                    .slice()
                    .filter(r => statusFilter === 'all' ? true : r.status === statusFilter)
                    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
                    .map(row => (
                      <div key={row._id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedRequest(row)} role="button">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{row.fullName}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{row.service}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{row.deadline}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                    ))
                  }
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Client','Service','Template','Deadline','Status'].map(col => (
                          <th key={col} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {clientRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100">
                                <InboxIcon size={22} className="text-gray-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-500">No requests yet</p>
                              <p className="text-xs text-gray-400">Client requests will appear here once submitted.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        clientRequests
                          .slice()
                          .filter(r => statusFilter === 'all' ? true : r.status === statusFilter)
                          .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
                          .map(row => (
                            <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{row.fullName}</td>
                              <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.service}</td>
                              <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.templateTitle ?? '—'}</td>
                              <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.deadline}</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <StatusBadge status={row.status} />
                              </td>
                            </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400">{clientRequests.filter(r => statusFilter === 'all' ? true : r.status === statusFilter).length} request{clientRequests.filter(r => statusFilter === 'all' ? true : r.status === statusFilter).length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRequestsModal && (
        <RequestsModal
          onClose={() => setShowRequestsModal(false)}
          onConvert={() => {}}
        />
      )}

      {selectedRequest && (
        <RequestViewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleRequestStatusChange}
        />
      )}
    </div>
  );
}
