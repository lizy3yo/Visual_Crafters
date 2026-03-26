'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  Users, FolderOpen, LayoutTemplate, DollarSign,
  TrendingUp, Clock, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface IncomePoint  { month: string; value: number; }
interface RecentRequest {
  _id:       string;
  fullName:  string;
  service:   string;
  status:    string;
  createdAt: string;
}

interface DashboardStats {
  totalClients:   number;
  activeProjects: number;
  totalTemplates: number;
  totalRevenue:   number;
  revenueChange:  number;
}

interface DashboardData {
  stats:          DashboardStats;
  incomeChart:    IncomePoint[];
  recentRequests: RecentRequest[];
  year:           number;
}

interface State {
  data:    DashboardData | null;
  loading: boolean;
  error:   string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK';  data: DashboardData }
  | { type: 'FETCH_ERR'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_OK':    return { loading: false, error: null, data: action.data };
    case 'FETCH_ERR':   return { ...state, loading: false, error: action.error };
    default: return state;
  }
}

// ── Status badge styles ───────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Pending:      'bg-amber-50  text-amber-600  border border-amber-200',
  'In Progress':'bg-sky-50    text-sky-600    border border-sky-200',
  Completed:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Cancelled:    'bg-red-50    text-red-600    border border-red-200',
};

// ── SVG bar chart ─────────────────────────────────────────────────────────────
const CHART_H = 160;
const BAR_W   = 32;
const GAP     = 20;

function IncomeChart({ data, year }: { data: IncomePoint[]; year: number }) {
  const maxVal   = Math.max(...data.map(d => d.value), 1);
  const chartW   = data.length * (BAR_W + GAP) - GAP;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartW + 40} ${CHART_H + 40}`}
        className="w-full min-w-[320px]"
        aria-label="Income overview bar chart"
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = CHART_H - ratio * CHART_H;
          return (
            <g key={ratio}>
              <line x1={30} y1={y} x2={chartW + 30} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={26} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                {((ratio * maxVal) / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = maxVal > 0 ? (d.value / maxVal) * CHART_H : 0;
          const x    = 30 + i * (BAR_W + GAP);
          const y    = CHART_H - barH;
          return (
            <g key={d.month}>
              <rect x={x} y={0} width={BAR_W} height={CHART_H} rx={4} fill="#f3f4f6" />
              <rect x={x} y={y} width={BAR_W} height={barH}    rx={4} fill="url(#barGrad)" />
              <text x={x + BAR_W / 2} y={CHART_H + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {d.month}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c6af7" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ── Skeleton bar chart placeholder ───────────────────────────────────────────
function SkeletonChart() {
  const HEIGHTS = [0.4, 0.7, 0.55, 0.85, 0.6, 0.9, 0.5, 0.75, 0.45, 0.65, 0.3, 0.8];
  const chartW  = HEIGHTS.length * (BAR_W + GAP) - GAP;
  return (
    <div className="overflow-x-auto animate-pulse">
      <svg viewBox={`0 0 ${chartW + 40} ${CHART_H + 40}`} className="w-full min-w-[320px]">
        {HEIGHTS.map((h, i) => {
          const barH = h * CHART_H;
          const x    = 30 + i * (BAR_W + GAP);
          return (
            <g key={i}>
              <rect x={x} y={0}            width={BAR_W} height={CHART_H} rx={4} fill="#f3f4f6" />
              <rect x={x} y={CHART_H - barH} width={BAR_W} height={barH}    rx={4} fill="#e5e7eb" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtAmt(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₱${(n / 1_000).toFixed(0)}k`;
  return `₱${n.toLocaleString()}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { toast }         = useToast();
  const [state, dispatch] = useReducer(reducer, { data: null, loading: true, error: null });
  const sseRef            = useRef<EventSource | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) dispatch({ type: 'FETCH_START' });
    try {
      const res  = await fetch('/api/admin/dashboard', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load dashboard.');
      dispatch({ type: 'FETCH_OK', data });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERR', error: err.message });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── SSE — re-fetch whenever any mutation fires dashboard:refresh ──────────
  useEffect(() => {
    const es = new EventSource('/api/admin/dashboard/sse', { withCredentials: true });
    sseRef.current = es;
    es.addEventListener('dashboard:refresh', () => {
      fetchData(true); // silent refresh — no loading flicker
    });
    return () => { es.close(); sseRef.current = null; };
  }, [fetchData]);

  const { data, loading, error } = state;

  // ── Stat card definitions ─────────────────────────────────────────────────
  const revenueChange = data?.stats.revenueChange ?? 0;
  const STAT_CARDS = [
    {
      label:    'Total Clients',
      value:    data ? String(data.stats.totalClients)   : null,
      change:   null,
      positive: true,
      icon:     Users,
      color:    'bg-violet-100 text-violet-600',
    },
    {
      label:    'Active Projects',
      value:    data ? String(data.stats.activeProjects)  : null,
      change:   null,
      positive: true,
      icon:     FolderOpen,
      color:    'bg-sky-100 text-sky-600',
    },
    {
      label:    'Total Templates',
      value:    data ? String(data.stats.totalTemplates)  : null,
      change:   null,
      positive: true,
      icon:     LayoutTemplate,
      color:    'bg-emerald-100 text-emerald-600',
    },
    {
      label:    'Total Revenue',
      value:    data ? fmtAmt(data.stats.totalRevenue) : null,
      change:   revenueChange !== 0 ? `${revenueChange > 0 ? '+' : ''}${revenueChange}%` : '0%',
      positive: revenueChange >= 0,
      icon:     DollarSign,
      color:    'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-0.5 text-sm text-gray-500">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-1.5 text-xs font-medium underline hover:no-underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ label, value, change, positive, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl bg-white border border-gray-200 p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${color}`}>
                <Icon size={18} />
              </div>
              {change !== null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  positive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                }`}>
                  {change}
                </span>
              )}
            </div>
            <div>
              {loading || value === null
                ? <div className="h-7 w-20 rounded bg-gray-100 animate-pulse" />
                : <p className="text-2xl font-bold text-gray-900">{value}</p>
              }
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Requests */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Income chart — 3/5 on large screens */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Income Overview</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly revenue — {data?.year ?? new Date().getFullYear()}
              </p>
            </div>
            {data && revenueChange !== 0 && (
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                revenueChange >= 0
                  ? 'text-emerald-600 bg-emerald-100'
                  : 'text-red-500 bg-red-100'
              }`}>
                <TrendingUp size={12} />
                <span>{revenueChange > 0 ? '+' : ''}{revenueChange}% this month</span>
              </div>
            )}
          </div>
          {loading || !data
            ? <SkeletonChart />
            : <IncomeChart data={data.incomeChart} year={data.year} />
          }
        </div>

        {/* Recent requests — 2/5 on large screens */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Requests</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              <span>Live</span>
            </div>
          </div>

          <ul className="flex-1 divide-y divide-gray-100">
            {loading && [1, 2, 3, 4, 5].map(i => (
              <li key={i} className="flex items-center justify-between py-3 gap-3 animate-pulse">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="h-3 rounded bg-gray-100 w-3/4" />
                  <div className="h-2.5 rounded bg-gray-100 w-1/2" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-100 shrink-0" />
              </li>
            ))}

            {!loading && data && data.recentRequests.length === 0 && (
              <li className="py-8 text-center text-sm text-gray-400">No requests yet.</li>
            )}

            {!loading && data && data.recentRequests.map(req => (
              <li key={req._id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{req.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{req.service}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  STATUS_STYLES[req.status] ?? 'bg-gray-100 text-gray-500'
                }`}>
                  {req.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
