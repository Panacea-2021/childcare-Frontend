'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloatingPosition } from '@/components/modules/center-management/ui/useFloatingPosition';

type Props = {
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
  className?: string;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseKey(key: string) {
  if (!key) return new Date();
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatLabel(key: string) {
  if (!key) return '';
  const d = parseKey(key);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function rangeBounds(a: string, b: string) {
  if (!a || !b) return { lo: a || b, hi: a || b };
  return a <= b ? { lo: a, hi: b } : { lo: b, hi: a };
}

function monthCells(
  year: number,
  month: number,
  start: string,
  end: string,
  hover: string,
  previewing: boolean,
) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const previewEnd = previewing && start && hover ? hover : end;
  const { lo, hi } = rangeBounds(start, previewEnd);

  const list: {
    key: string;
    day: number;
    inMonth: boolean;
    isStart: boolean;
    isEnd: boolean;
    inRange: boolean;
    isPreviewEdge: boolean;
  }[] = [];

  const push = (d: Date, day: number, inMonth: boolean) => {
    const key = toKey(d);
    const inRange = Boolean(lo && hi && key >= lo && key <= hi);
    list.push({
      key,
      day,
      inMonth,
      isStart: key === start,
      isEnd: Boolean(end && !previewing && key === end),
      inRange,
      isPreviewEdge: Boolean(previewing && hover && key === hover && key !== start),
    });
  };

  for (let i = startPad - 1; i >= 0; i--) {
    const day = prevDays - i;
    push(new Date(year, month - 1, day), day, false);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    push(new Date(year, month, day), day, true);
  }
  while (list.length % 7 !== 0) {
    const day = list.length - (startPad + daysInMonth) + 1;
    push(new Date(year, month + 1, day), day, false);
  }
  return list;
}

/** Combined Start → End billing period picker (blank until selected). */
export function BillingPeriodRangePicker({ start, end, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<'start' | 'end'>('start');
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [hoverKey, setHoverKey] = useState('');
  const base = parseKey(start || end || toKey(new Date()));
  const [view, setView] = useState({ year: base.getFullYear(), month: base.getMonth() });

  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align: 'start',
    minWidth: 560,
    maxHeight: 440,
  });

  useEffect(() => {
    if (!open) return;
    setDraftStart(start);
    setDraftEnd(end);
    setHoverKey('');
    setPicking(start && !end ? 'end' : 'start');
    const d = parseKey(start || end || toKey(new Date()));
    setView({ year: d.getFullYear(), month: d.getMonth() });
  }, [open, start, end]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || contentRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open]);

  const previewing = picking === 'end' && Boolean(draftStart) && !draftEnd;
  const leftCells = useMemo(
    () => monthCells(view.year, view.month, draftStart, draftEnd, hoverKey, previewing),
    [view.year, view.month, draftStart, draftEnd, hoverKey, previewing],
  );
  const rightYear = view.month === 11 ? view.year + 1 : view.year;
  const rightMonth = view.month === 11 ? 0 : view.month + 1;
  const rightCells = useMemo(
    () => monthCells(rightYear, rightMonth, draftStart, draftEnd, hoverKey, previewing),
    [rightYear, rightMonth, draftStart, draftEnd, hoverKey, previewing],
  );

  const leftLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const rightLabel = new Date(rightYear, rightMonth, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const pick = (key: string) => {
    if (picking === 'start' || (draftStart && draftEnd)) {
      setDraftStart(key);
      setDraftEnd('');
      setHoverKey('');
      setPicking('end');
      return;
    }
    const s = key < draftStart ? key : draftStart;
    const e = key < draftStart ? draftStart : key;
    setDraftStart(s);
    setDraftEnd(e);
    onChange({ start: s, end: e });
    setOpen(false);
    setPicking('start');
    setHoverKey('');
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const displayStart = start ? formatLabel(start) : 'Start date';
  const displayEnd = end ? formatLabel(end) : 'End date';

  const renderMonth = (label: string, cells: ReturnType<typeof monthCells>) => (
    <div className="bi-range-month">
      <div className="bi-range-month-title">{label}</div>
      <div className="bi-range-week">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="bi-range-grid" onMouseLeave={() => previewing && setHoverKey('')}>
        {cells.map((c) => (
          <button
            key={`${label}-${c.key}-${c.inMonth}`}
            type="button"
            className={[
              !c.inMonth ? 'is-muted' : '',
              c.inRange ? 'is-range' : '',
              c.isStart ? 'is-edge is-start' : '',
              c.isEnd ? 'is-edge is-end' : '',
              c.isPreviewEdge ? 'is-edge is-preview' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onMouseEnter={() => {
              if (previewing) setHoverKey(c.key);
            }}
            onClick={() => pick(c.key)}
          >
            <span>{c.day}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bi-range ${className}`} ref={triggerRef}>
      <button
        type="button"
        className={`bi-range-trigger${open ? ' is-open' : ''}${!start && !end ? ' is-empty' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`bi-range-part${!start ? ' is-ph' : ''}`}>{displayStart}</span>
        <span className="bi-range-arrow" aria-hidden>
          →
        </span>
        <span className={`bi-range-part${!end ? ' is-ph' : ''}`}>{displayEnd}</span>
        <CalendarDays size={16} className="bi-range-cal" aria-hidden />
      </button>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className="bi-range-panel"
                  style={{ top: pos.top, left: pos.left, width: Math.max(560, pos.width) }}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="bi-range-head">
                    <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                      <ChevronLeft size={16} />
                    </button>
                    <span>Select {picking === 'start' ? 'start date' : 'end date'}</span>
                    <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="bi-range-cols">
                    {renderMonth(leftLabel, leftCells)}
                    {renderMonth(rightLabel, rightCells)}
                  </div>
                  <div className="bi-range-foot">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ start: '', end: '' });
                        setDraftStart('');
                        setDraftEnd('');
                        setHoverKey('');
                        setPicking('start');
                      }}
                    >
                      Clear
                    </button>
                    <button type="button" className="is-accent" onClick={() => setOpen(false)}>
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
