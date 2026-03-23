'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface QueueEntry {
  position: number;
  client:   string;
  service:  string;
  time:     string;
  serving:  boolean;
}

// ── Static mock data (replace with real fetches without touching logic) ───────
const QUEUE: QueueEntry[] = [
  { position: 1, client: 'Maria Santos', service: 'Logo Design',      time: '9:00 AM',  serving: true  },
  { position: 2, client: 'John Reyes',   service: 'Social Media Pack', time: '9:30 AM',  serving: false },
  { position: 3, client: 'Ana Cruz',     service: 'Presentation',      time: '10:00 AM', serving: false },
  { position: 4, client: 'Carlos Tan',   service: 'Marketing Flyer',   time: '10:30 AM', serving: false },
  { position: 5, client: 'Lisa Garcia',  service: 'Infographic',       time: '11:00 AM', serving: false },
];

// ── Calendar helpers ──────────────────────────────────────────────────────────
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function monthName(month: number) {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWk = getFirstDayOfWeek(year, month);
  // trailing days from previous month
  const prevDays = getDaysInMonth(year, month - 1);

  const cells: { day: number; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = firstDayOfWk - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, type: 'prev' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'curr' });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' });
  }

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const isToday = (day: number, type: string) =>
    type === 'curr' &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 select-none">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Calendar</h2>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {monthName(month)} {year}
        </span>
        <button onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          const isCurr    = cell.type === 'curr';
          const todayCell = isToday(cell.day, cell.type);
          const selCell   = isCurr && cell.day === selected;

          return (
            <button
              key={i}
              disabled={!isCurr}
              onClick={() => isCurr && setSelected(cell.day)}
              className={`
                mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors
                ${!isCurr ? 'text-gray-300 cursor-default' : ''}
                ${isCurr && !todayCell && !selCell ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${todayCell && !selCell ? 'bg-sky-500 text-white font-semibold' : ''}
                ${selCell && !todayCell ? 'border border-sky-400 text-sky-600 font-semibold' : ''}
                ${selCell && todayCell  ? 'bg-sky-500 text-white font-semibold' : ''}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Reservations &amp; Queue</h1>
        <p className="mt-0.5 text-sm text-gray-500">View scheduled appointments and the current service queue.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Calendar — 2/5 */}
        <div className="lg:col-span-2">
          <MiniCalendar />
        </div>

        {/* Queue list — 3/5 */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-gray-200 shadow-sm p-5">

          {/* Queue header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Queue List</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
              <Users size={12} />
              {QUEUE.length} in queue
            </span>
          </div>

          {/* Queue entries */}
          <ul className="space-y-2">
            {QUEUE.map((entry) => (
              <li
                key={entry.position}
                className={`
                  flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors
                  ${entry.serving
                    ? 'bg-sky-50 border border-sky-200'
                    : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {/* Position badge */}
                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold
                    ${entry.serving ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {entry.position}
                </div>

                {/* Client info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.serving ? 'text-sky-700' : 'text-gray-800'}`}>
                    {entry.client}
                  </p>
                  <p className={`text-xs truncate ${entry.serving ? 'text-sky-500' : 'text-gray-500'}`}>
                    {entry.service}
                  </p>
                </div>

                {/* Time + serving badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium ${entry.serving ? 'text-sky-600' : 'text-gray-400'}`}>
                    {entry.time}
                  </span>
                  {entry.serving && (
                    <span className="text-[10px] font-semibold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                      Now Serving
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
