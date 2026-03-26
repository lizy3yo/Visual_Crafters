'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_H  = 52;
const VISIBLE = 5;
const PAD     = Math.floor(VISIBLE / 2); // 2 rows above/below center
const REPS    = 101;
const BRAND   = '#1f4db8';

const HOUR_ENTRIES: { label: string; meridiem: 'AM' | 'PM' }[] = [
  { label: '12', meridiem: 'AM' },
  { label: '1',  meridiem: 'AM' },
  { label: '2',  meridiem: 'AM' },
  { label: '3',  meridiem: 'AM' },
  { label: '4',  meridiem: 'AM' },
  { label: '5',  meridiem: 'AM' },
  { label: '6',  meridiem: 'AM' },
  { label: '7',  meridiem: 'AM' },
  { label: '8',  meridiem: 'AM' },
  { label: '9',  meridiem: 'AM' },
  { label: '10', meridiem: 'AM' },
  { label: '11', meridiem: 'AM' },
  { label: '12', meridiem: 'PM' },
  { label: '1',  meridiem: 'PM' },
  { label: '2',  meridiem: 'PM' },
  { label: '3',  meridiem: 'PM' },
  { label: '4',  meridiem: 'PM' },
  { label: '5',  meridiem: 'PM' },
  { label: '6',  meridiem: 'PM' },
  { label: '7',  meridiem: 'PM' },
  { label: '8',  meridiem: 'PM' },
  { label: '9',  meridiem: 'PM' },
  { label: '10', meridiem: 'PM' },
  { label: '11', meridiem: 'PM' },
];

const MINUTES  = ['00','01','02','03','04','05','06','07','08','09',
 '10','11','12','13','14','15','16','17','18','19',
 '20','21','22','23','24','25','26','27','28','29',
 '30','31','32','33','34','35','36','37','38','39',
 '40','41','42','43','44','45','46','47','48','49',
 '50','51','52','53','54','55','56','57','58','59'];
const MERIDIEM = ['AM', 'PM'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parse(v: string) {
  if (!v) return { hourIdx: 0, minuteIdx: 0, meridiemIdx: 0 };
  const m = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return { hourIdx: 0, minuteIdx: 0, meridiemIdx: 0 };
  const hour = String(Number(m[1]));
  const mer  = m[3].toUpperCase() as 'AM' | 'PM';
  const hi   = HOUR_ENTRIES.findIndex(h => h.label === hour && h.meridiem === mer);
  const mi   = MINUTES.indexOf(m[2]);
  return { hourIdx: hi >= 0 ? hi : 0, minuteIdx: mi >= 0 ? mi : 0, meridiemIdx: mer === 'AM' ? 0 : 1 };
}

// scrollTop that puts absIdx in the CENTER row
function topFor(absIdx: number) { return Math.max(0, (absIdx - PAD) * ITEM_H); }

// absIdx of center row for a given scrollTop
function centerOf(scrollTop: number) { return Math.round(scrollTop / ITEM_H) + PAD; }

// ─── Infinite Wheel Column ────────────────────────────────────────────────────

interface ColumnProps {
  items:       string[];
  selectedIdx: number;
  onSelect:    (i: number) => void;
  label:       string;
}

function InfiniteWheelColumn({ items, selectedIdx, onSelect, label }: ColumnProps) {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIdx    = useRef(selectedIdx);
  // ── Mouse drag state ────────────────────────────────────────────────────
  const dragging   = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  const N       = items.length;
  const total   = REPS * N;
  const midBase = Math.floor(REPS / 2) * N;
  const drumH   = VISIBLE * ITEM_H;

  // ── Initial scroll position ───────────────────────────────────────────────
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = topFor(midBase + selectedIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── External index change ─────────────────────────────────────────────────
  useEffect(() => {
    if (selectedIdx === prevIdx.current) return;
    prevIdx.current = selectedIdx;
    if (overlayRef.current) overlayRef.current.textContent = items[selectedIdx];
    if (!scrollRef.current) return;
    const cur    = centerOf(scrollRef.current.scrollTop);
    const curMod = ((cur % N) + N) % N;
    let delta = selectedIdx - curMod;
    if (delta >  N / 2) delta -= N;
    if (delta < -N / 2) delta += N;
    scrollRef.current.scrollTo({ top: topFor(cur + delta), behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  // ── Shared snap-and-commit ────────────────────────────────────────────────
  const snapAndCommit = () => {
    if (!scrollRef.current) return;
    const c   = centerOf(scrollRef.current.scrollTop);
    const idx = ((c % N) + N) % N;
    if (c < N * 20 || c > total - N * 20) {
      scrollRef.current.scrollTop = topFor(midBase + idx);
    } else {
      scrollRef.current.scrollTo({ top: topFor(c), behavior: 'smooth' });
    }
    prevIdx.current = idx;
    onSelect(idx);
  };

  // ── Scroll handler (wheel / touch) ────────────────────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cur    = centerOf(scrollRef.current.scrollTop);
    const visIdx = ((cur % N) + N) % N;
    if (overlayRef.current) overlayRef.current.textContent = items[visIdx];
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(snapAndCommit, 80);
  };

  // ── Mouse drag handlers ───────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStartY.current = e.clientY;
    dragStartScroll.current = scrollRef.current?.scrollTop ?? 0;
    e.preventDefault(); // prevent text selection
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !scrollRef.current) return;
    const dy = e.clientY - dragStartY.current;
    scrollRef.current.scrollTop = dragStartScroll.current - dy;
    // live overlay update
    const cur    = centerOf(scrollRef.current.scrollTop);
    const visIdx = ((cur % N) + N) % N;
    if (overlayRef.current) overlayRef.current.textContent = items[visIdx];
  };

  const onMouseUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    snapAndCommit();
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, cursor: 'grab' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* column label */}
      <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a9fd4', marginBottom: 6 }}>
        {label}
      </span>

      <div style={{ position: 'relative', width: '100%', height: drumH }}>
        {/* top fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PAD * ITEM_H, background: 'linear-gradient(to bottom,rgba(255,255,255,1),rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 10 }} />
        {/* bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: PAD * ITEM_H, background: 'linear-gradient(to top,rgba(255,255,255,1),rgba(255,255,255,0))', pointerEvents: 'none', zIndex: 10 }} />

        {/* selection band */}
        <div style={{
          position: 'absolute', left: 4, right: 4, top: PAD * ITEM_H, height: ITEM_H,
          borderRadius: 12, background: 'rgba(31,77,184,0.07)',
          borderTop: '1.5px solid rgba(31,77,184,0.18)', borderBottom: '1.5px solid rgba(31,77,184,0.18)',
          pointerEvents: 'none', zIndex: 9,
        }} />

        {/* selected-item overlay — updated via DOM ref, zero re-renders */}
        <div style={{ position: 'absolute', top: PAD * ITEM_H, height: ITEM_H, left: 0, right: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span ref={overlayRef} style={{ fontSize: '1.45rem', fontWeight: 700, color: BRAND, userSelect: 'none', letterSpacing: '-0.02em' }}>
            {items[selectedIdx]}
          </span>
        </div>

        {/* scrollable drum — all rows uniform gray */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          style={{ height: drumH, overflowY: 'auto', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' } as React.CSSProperties}
          className="[&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                const targetTop = topFor(i);
                scrollRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
                if (overlayRef.current) overlayRef.current.textContent = items[i % N];
                const trueIdx = i % N;
                prevIdx.current = trueIdx;
                onSelect(trueIdx);
              }}
              style={{ height: ITEM_H, scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 400, color: '#b0bec5', userSelect: 'none' }}>
                {items[i % N]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Colon separator ──────────────────────────────────────────────────────────

function Colon() {
  return (
    <div style={{ height: VISIBLE * ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 22, fontSize: '1.2rem', fontWeight: 700, color: '#d1d5db', flexShrink: 0 }}>
      :
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { value: string; onChange: (v: string) => void; error?: boolean; }

export default function TimePicker({ value, onChange, error }: Props) {
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  const initial = parse(value ?? '');
  const [hourIdx,   setHourIdx]   = useState(initial.hourIdx);
  const [minuteIdx, setMinuteIdx] = useState(initial.minuteIdx);
  const [merIdx,    setMerIdx]    = useState(initial.meridiemIdx);

  // Live preview labels (kept in sync without needing derived state)
  const [prevH, setPrevH] = useState(HOUR_ENTRIES[initial.hourIdx].label);
  const [prevM, setPrevM] = useState(MINUTES[initial.minuteIdx]);
  const [prevP, setPrevP] = useState(MERIDIEM[initial.meridiemIdx]);

  // inline-edit state for separate segments (hour, minute, meridiem)
  const [editingSegment, setEditingSegment] = useState<null | 'hour' | 'minute' | 'meridiem'>(null);
  const [modalHourInput, setModalHourInput] = useState(prevH);
  const [modalMinuteInput, setModalMinuteInput] = useState(prevM);
  const [modalMerInput, setModalMerInput] = useState(prevP);

  useEffect(() => {
    setModalHourInput(prevH);
    setModalMinuteInput(prevM);
    setModalMerInput(prevP);
  }, [prevH, prevM, prevP]);

  function formatTime(hIdx: number, mIdx: number, merIdx: number) {
    return `${HOUR_ENTRIES[hIdx].label}:${MINUTES[mIdx]} ${MERIDIEM[merIdx]}`;
  }

  useEffect(() => { setMounted(true); }, []);

  const handleHourChange = (i: number) => {
    setHourIdx(i);
    setPrevH(HOUR_ENTRIES[i].label);
  };

  const handleMerChange = (i: number) => {
    setMerIdx(i);
    setPrevP(MERIDIEM[i]);
  };

  const handleMinuteChange = (i: number) => {
    setMinuteIdx(i);
    setPrevM(MINUTES[i]);
  };

  const handleConfirm = () => {
    const h = HOUR_ENTRIES[hourIdx];
    onChange(`${h.label}:${MINUTES[minuteIdx]} ${MERIDIEM[merIdx]}`);
    setOpen(false);
  };

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '8px 12px',
          border: `1.5px solid ${error ? '#f87171' : '#e5e7eb'}`,
          borderRadius: 10, background: '#f9fafb',
          fontSize: '0.875rem', color: value ? '#111827' : '#9ca3af',
          textAlign: 'left', cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'inherit',
        }}
      >
        <span>{value || 'Select time…'}</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#7a9fd4" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Portal picker — floats above everything including the modal ── */}
      {mounted && open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

          {/* card */}
          <div style={{ position: 'relative', background: '#fff', borderRadius: 28, padding: '28px 24px 22px', width: 320, boxShadow: '0 24px 80px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.06)' }}>

            {/* live preview header */}
            <div style={{ marginBottom: 4, textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a9fd4', marginBottom: 6 }}>
                Select Time Slot
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Hour */}
                  {editingSegment !== 'hour' ? (
                    <button type="button" onClick={() => setEditingSegment('hour')} style={{ fontSize: '2rem', fontWeight: 800, background: 'transparent', border: 'none', padding: 0, cursor: 'text' }}>
                      {prevH}
                    </button>
                  ) : (
                    <input
                      autoFocus
                      inputMode="numeric"
                      value={modalHourInput}
                      onChange={(e) => setModalHourInput(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        const candidate = `${modalHourInput}:${modalMinuteInput} ${modalMerInput}`;
                        const p = parse(candidate);
                        const formatted = formatTime(p.hourIdx, p.minuteIdx, p.meridiemIdx);
                        setHourIdx(p.hourIdx);
                        setPrevH(HOUR_ENTRIES[p.hourIdx].label);
                        setModalHourInput(HOUR_ENTRIES[p.hourIdx].label);
                        setEditingSegment(null);
                        onChange(formatted);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setModalHourInput(prevH); setEditingSegment(null); } }}
                      style={{ fontSize: '2rem', fontWeight: 800, width: 48, textAlign: 'center', border: 'none', outline: 'none', fontFamily: 'inherit' }}
                    />
                  )}

                  <span style={{ color: '#e5e7eb', fontSize: '2rem' }}>:</span>

                  {/* Minute */}
                  {editingSegment !== 'minute' ? (
                    <button type="button" onClick={() => setEditingSegment('minute')} style={{ fontSize: '2rem', fontWeight: 800, background: 'transparent', border: 'none', padding: 0, cursor: 'text' }}>
                      {prevM}
                    </button>
                  ) : (
                    <input
                      autoFocus
                      inputMode="numeric"
                      value={modalMinuteInput}
                      onChange={(e) => setModalMinuteInput(e.target.value.replace(/[^0-9]/g, '').slice(0,2))}
                      onBlur={() => {
                        let mm = modalMinuteInput.padStart(2, '0');
                        if (!/^[0-5][0-9]$/.test(mm)) mm = MINUTES[0];
                        const candidate = `${modalHourInput}:${mm} ${modalMerInput}`;
                        const p = parse(candidate);
                        setMinuteIdx(p.minuteIdx);
                        setPrevM(MINUTES[p.minuteIdx]);
                        setModalMinuteInput(MINUTES[p.minuteIdx]);
                        setEditingSegment(null);
                        const formatted = formatTime(p.hourIdx, p.minuteIdx, p.meridiemIdx);
                        onChange(formatted);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setModalMinuteInput(prevM); setEditingSegment(null); } }}
                      style={{ fontSize: '2rem', fontWeight: 800, width: 56, textAlign: 'center', border: 'none', outline: 'none', fontFamily: 'inherit' }}
                    />
                  )}
                </div>

                {/* AM/PM */}
                {editingSegment !== 'meridiem' ? (
                  <button type="button" onClick={() => {
                    // toggle immediately
                    const newMer = prevP === 'AM' ? 'PM' : 'AM';
                    const candidate = `${prevH}:${prevM} ${newMer}`;
                    const p = parse(candidate);
                    setMerIdx(p.meridiemIdx);
                    setPrevP(newMer);
                    setModalMerInput(newMer);
                    onChange(formatTime(p.hourIdx, p.minuteIdx, p.meridiemIdx));
                  }} style={{ fontSize: '1.6rem', fontWeight: 800, color: BRAND, background: 'transparent', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    {prevP}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => { setMerIdx(0); setPrevP('AM'); setModalMerInput('AM'); setEditingSegment(null); onChange(formatTime(hourIdx, minuteIdx, 0)); }} style={{ padding: '6px 10px', borderRadius: 8 }}>AM</button>
                    <button type="button" onClick={() => { setMerIdx(1); setPrevP('PM'); setModalMerInput('PM'); setEditingSegment(null); onChange(formatTime(hourIdx, minuteIdx, 1)); }} style={{ padding: '6px 10px', borderRadius: 8 }}>PM</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

            {/* drum columns */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <InfiniteWheelColumn items={HOUR_ENTRIES.map(h => h.label)} selectedIdx={hourIdx} onSelect={handleHourChange} label="Hour" />
              <Colon />
              <InfiniteWheelColumn items={MINUTES} selectedIdx={minuteIdx} onSelect={handleMinuteChange} label="Min" />
              <div style={{ width: 12, flexShrink: 0 }} />
              <InfiniteWheelColumn items={MERIDIEM} selectedIdx={merIdx} onSelect={handleMerChange} label="AM/PM" />
            </div>

            {/* actions */}
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} style={{ flex: 2, padding: '11px 0', borderRadius: 14, border: 'none', background: `linear-gradient(135deg,#3b6fd4,${BRAND})`, color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(31,77,184,0.35)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
