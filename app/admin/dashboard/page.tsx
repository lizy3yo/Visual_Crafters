'use client';

import {
  Users,
  FolderOpen,
  LayoutTemplate,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';

// ── Static mock data (replace with real fetches without touching logic) ──────
const STATS = [
  {
    label: 'Total Clients',
    value: '128',
    change: '+12%',
    positive: true,
    icon: Users,
    color: 'bg-violet-100 text-violet-600',
  },
  {
    label: 'Active Projects',
    value: '23',
    change: '+5%',
    positive: true,
    icon: FolderOpen,
    color: 'bg-sky-100 text-sky-600',
  },
  {
    label: 'Total Templates',
    value: '47',
    change: '0%',
    positive: true,
    icon: LayoutTemplate,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'Total Revenue',
    value: '₱145,000',
    change: '+18%',
    positive: true,
    icon: DollarSign,
    color: 'bg-amber-100 text-amber-600',
  },
];

const INCOME_DATA = [
  { month: 'Jan', value: 10000 },
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 14000 },
  { month: 'Apr', value: 22000 },
  { month: 'May', value: 28000 },
  { month: 'Jun', value: 24000 },
];

const RECENT_REQUESTS = [
  { name: 'Maria Santos',  project: 'Logo Design',       status: 'Pending'     },
  { name: 'John Reyes',    project: 'Social Media Pack', status: 'In Progress' },
  { name: 'Ana Cruz',      project: 'Presentation',      status: 'Completed'   },
  { name: 'Carlos Tan',    project: 'Marketing Flyer',   status: 'Pending'     },
  { name: 'Lisa Garcia',   project: 'Infographic',       status: 'In Progress' },
];

const STATUS_STYLES: Record<string, string> = {
  Pending:      'bg-amber-50  text-amber-600  border border-amber-200',
  'In Progress':'bg-sky-50    text-sky-600    border border-sky-200',
  Completed:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

// ── SVG bar chart ─────────────────────────────────────────────────────────────
const MAX_VAL   = Math.max(...INCOME_DATA.map(d => d.value));
const CHART_H   = 160;
const BAR_W     = 32;
const GAP       = 20;
const CHART_W   = INCOME_DATA.length * (BAR_W + GAP) - GAP;

function IncomeChart() {
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_W + 40} ${CHART_H + 40}`}
        className="w-full min-w-[320px]"
        aria-label="Income overview bar chart"
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = CHART_H - ratio * CHART_H;
          return (
            <g key={ratio}>
              <line
                x1={30} y1={y} x2={CHART_W + 30} y2={y}
                stroke="#e5e7eb" strokeWidth={1}
              />
              <text
                x={26} y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#9ca3af"
              >
                {((ratio * MAX_VAL) / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {INCOME_DATA.map((d, i) => {
          const barH = (d.value / MAX_VAL) * CHART_H;
          const x    = 30 + i * (BAR_W + GAP);
          const y    = CHART_H - barH;
          return (
            <g key={d.month}>
              {/* Bar background */}
              <rect
                x={x} y={0} width={BAR_W} height={CHART_H}
                rx={4} fill="#f3f4f6"
              />
              {/* Bar fill */}
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                rx={4}
                fill="url(#barGrad)"
              />
              {/* Month label */}
              <text
                x={x + BAR_W / 2} y={CHART_H + 16}
                textAnchor="middle"
                fontSize={10}
                fill="#9ca3af"
              >
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, value, change, positive, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl bg-white border border-gray-200 p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${color}`}>
                <Icon size={18} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  positive
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Requests */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Income chart — takes 3/5 on large screens */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Income Overview</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly revenue — 2025</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
              <TrendingUp size={12} />
              <span>+18% this month</span>
            </div>
          </div>
          <IncomeChart />
        </div>

        {/* Recent requests — takes 2/5 on large screens */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Requests</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              <span>Live</span>
            </div>
          </div>

          <ul className="flex-1 divide-y divide-gray-100">
            {RECENT_REQUESTS.map(({ name, project, status }) => (
              <li key={name} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{project}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
