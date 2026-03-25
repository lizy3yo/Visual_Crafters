'use client';

import { useEffect, useState, useCallback } from 'react';
import { Eye, Clock, X, FileText, InboxIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClientRequest {
  _id:           string;
  fullName:      string;
  contact:       string;
  email:         string;
  service:       string;
  deadline:      string;
  description:   string;
  templateTitle?: string;
  templatePrice?: number;
  fileUrl?:       string;
  status:         string;
  createdAt:      string;
}

const STATUS_STYLES: Record<string, string> = {
  'Pending':     'bg-amber-50   text-amber-600  border border-amber-200',
  'In Progress': 'bg-sky-50     text-sky-600    border border-sky-200',
  'Completed':   'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Cancelled':   'bg-red-50     text-red-500    border border-red-200',
};

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const COLUMNS  = ['Client', 'Service', 'Template', 'Deadline', 'Status', 'Actions'];

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ request, onClose, onStatusChange }: {
  request:        ClientRequest;
  onClose:        () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleStatus(status: string) {
    setUpdating(true);
    await onStatusChange(request._id, status);
    setUpdating(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{request.fullName}&apos;s Request</h2>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(request.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
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
              <p className="text-sm font-semibold text-gray-800">
                {request.templatePrice != null ? `₱${request.templatePrice.toLocaleString()}` : '—'}
              </p>
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
              <a
                href={request.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
              >
                <FileText size={13} /> View File
              </a>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  disabled={updating || request.status === s}
                  onClick={() => handleStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                    request.status === s
                      ? STATUS_STYLES[s]
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClientRequestsPage() {
  const { toast }   = useToast();
  const { confirm } = useConfirm();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<ClientRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res  = await fetch('/api/client-requests', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setRequests(data.requests ?? []);
    } catch {
      toast('Failed to load requests.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load + SSE
  useEffect(() => {
    fetchRequests();

    const es = new EventSource('/api/client-requests/sse', { withCredentials: true });

    es.addEventListener('request:created', (e: MessageEvent) => {
      const r: ClientRequest = JSON.parse(e.data);
      setRequests(prev => [r, ...prev]);
      toast(`New request from ${r.fullName}`, 'info');
    });

    es.addEventListener('request:updated', (e: MessageEvent) => {
      const r: ClientRequest = JSON.parse(e.data);
      setRequests(prev => prev.map(x => x._id === r._id ? r : x));
      // Update selected modal if open
      setSelected(prev => prev?._id === r._id ? r : prev);
    });

    es.onerror = () => es.close();
    return () => es.close();
  }, [fetchRequests, toast]);

  async function handleStatusChange(id: string, status: string) {
    const ok = await confirm({
      title:        `Set status to "${status}"?`,
      description:  'This will update the request status and notify the team.',
      confirmLabel: 'Update',
      danger:       status === 'Cancelled',
    });
    if (!ok) return;

    try {
      const res  = await fetch('/api/client-requests', {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? 'Failed to update status.', 'error'); return; }

      // Update state immediately from response — don't wait for SSE
      const updated: ClientRequest = data.request;
      setRequests(prev => prev.map(x => x._id === updated._id ? updated : x));
      setSelected(prev => prev?._id === updated._id ? updated : prev);

      toast(`Status updated to "${status}".`, 'success');
    } catch {
      toast('Something went wrong.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Client Requests</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage and track all incoming client requests.</p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {COLUMNS.map(col => (
                  <th key={col} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {COLUMNS.map(c => (
                      <td key={c} className="px-5 py-4">
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-16 text-center">
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
                requests.map(row => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{row.fullName}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.service}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{row.templateTitle ?? '—'}</td>
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
                        <button
                          aria-label="Update status"
                          onClick={() => setSelected(row)}
                          className="text-gray-400 hover:text-sky-500 transition-colors"
                        >
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">{requests.length} request{requests.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {selected && (
        <ViewModal
          request={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
