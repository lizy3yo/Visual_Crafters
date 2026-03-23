'use client';

import { useState } from 'react';
import { Eye, Clock, QrCode, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Request {
  client:      string;
  service:     string;
  template:    string;
  budget:      string;
  deadline:    string;
  status:      string;
  description: string;
}

// ── Static mock data (replace with real fetches without touching logic) ───────
const REQUESTS: Request[] = [
  {
    client:      'Maria Santos',
    service:     'Logo Design',
    template:    'Modern Tech Logo',
    budget:      '₱1,000 – ₱3,000',
    deadline:    'Mar 15, 2026',
    status:      'Pending',
    description: "Need a modern logo for my tech startup called 'InnovatePH'.",
  },
  {
    client:      'John Reyes',
    service:     'Social Media Pack',
    template:    '—',
    budget:      '₱500 – ₱1,000',
    deadline:    'Mar 10, 2026',
    status:      'In Progress',
    description: 'Looking for a cohesive social media kit for Instagram and Facebook.',
  },
  {
    client:      'Ana Cruz',
    service:     'Presentation Design',
    template:    'Corporate Presentation',
    budget:      '₱3,000 – ₱5,000',
    deadline:    'Mar 5, 2026',
    status:      'Completed',
    description: 'Corporate pitch deck for investor meeting — 20 slides.',
  },
  {
    client:      'Carlos Tan',
    service:     'Marketing Materials',
    template:    '—',
    budget:      'Below ₱500',
    deadline:    'Mar 20, 2026',
    status:      'Pending',
    description: 'Simple flyer for a local product launch event.',
  },
];

const STATUS_STYLES: Record<string, string> = {
  Pending:      'bg-amber-50   text-amber-600  border border-amber-200',
  'In Progress':'bg-sky-50     text-sky-600    border border-sky-200',
  Completed:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

const COLUMNS = ['Client', 'Service', 'Template', 'Budget', 'Deadline', 'Status', 'Actions'];

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ request, onClose }: { request: Request; onClose: () => void }) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          {request.client}&apos;s Request
        </h2>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Service</p>
            <p className="text-sm font-semibold text-gray-800">{request.service}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Template</p>
            <p className="text-sm font-semibold text-gray-800">{request.template}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Budget</p>
            <p className="text-sm font-semibold text-gray-800">{request.budget}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
            <p className="text-sm font-semibold text-gray-800">{request.deadline}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Description */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{request.description}</p>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[request.status]}`}>
          {request.status}
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClientRequestsPage() {
  const [selected, setSelected] = useState<Request | null>(null);

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Client Requests</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage and track all incoming client requests.</p>
      </div>

      {/* Table card */}
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
              {REQUESTS.map((row) => (
                <tr key={row.client} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.service}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.template}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.budget}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.deadline}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="View request"
                        onClick={() => setSelected(row)}
                        className="text-gray-400 hover:text-violet-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button aria-label="Update status" className="text-gray-400 hover:text-sky-500 transition-colors">
                        <Clock size={16} />
                      </button>
                      <button aria-label="View QR" className="text-gray-400 hover:text-gray-700 transition-colors">
                        <QrCode size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">{REQUESTS.length} requests</p>
        </div>
      </div>

      {/* View modal */}
      {selected && (
        <ViewModal request={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
