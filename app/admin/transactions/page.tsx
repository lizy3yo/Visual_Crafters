'use client';

import { DollarSign, Plus, QrCode, Banknote, TrendingUp } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Transaction {
  client:   string;
  service:  string;
  template: string;
  payment:  'QR' | 'Cash';
  amount:   number;
  date:     string;
}

// ── Static mock data (replace with real fetches without touching logic) ───────
const SUMMARY = [
  { label: 'Daily Income',   value: '₱2,500',   change: null,   icon: DollarSign, color: 'bg-sky-100 text-sky-600'     },
  { label: 'Weekly Income',  value: '₱7,100',   change: null,   icon: DollarSign, color: 'bg-sky-100 text-sky-600'     },
  { label: 'Monthly Income', value: '₱145,000', change: '+18%', icon: DollarSign, color: 'bg-sky-100 text-sky-600'     },
];

const TRANSACTIONS: Transaction[] = [
  { client: 'Maria Santos', service: 'Logo Design',       template: 'Modern Tech Logo',      payment: 'QR',   amount: 2500, date: 'Mar 1, 2026'  },
  { client: 'John Reyes',   service: 'Social Media Pack', template: '—',                     payment: 'Cash', amount: 800,  date: 'Feb 28, 2026' },
  { client: 'Ana Cruz',     service: 'Presentation',      template: 'Corporate Presentation', payment: 'QR',   amount: 3500, date: 'Feb 27, 2026' },
  { client: 'Carlos Tan',   service: 'Marketing Flyer',   template: 'Marketing Flyer',        payment: 'Cash', amount: 300,  date: 'Feb 26, 2026' },
];

const COLUMNS = ['Client', 'Service', 'Template', 'Payment', 'Amount', 'Date'];

const PAYMENT_STYLES: Record<string, string> = {
  QR:   'bg-violet-50 text-violet-600 border border-violet-200',
  Cash: 'bg-gray-100  text-gray-600   border border-gray-200',
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track all payments and income records.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 transition-colors shadow-sm">
          <Plus size={15} />
          Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUMMARY.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${color}`}>
                <Icon size={18} />
              </div>
              {change && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                  <TrendingUp size={11} />
                  {change}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TRANSACTIONS.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.service}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.template}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[row.payment]}`}>
                      {row.payment === 'QR'
                        ? <QrCode size={11} />
                        : <Banknote size={11} />
                      }
                      {row.payment}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-semibold text-sky-600">
                    ₱{row.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">{TRANSACTIONS.length} transactions</p>
        </div>
      </div>

    </div>
  );
}
