'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateLabel(key: string) {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    const key = toDateKey(d);
    list.push({
      key,
      day,
      inMonth,
      isStart: key === start,
      isEnd: Boolean(end && !previewing && key === end),
      inRange: Boolean(lo && hi && key >= lo && key <= hi),
      isPreviewEdge: Boolean(previewing && hover && key === hover && key !== start),
    });
  };

  for (let i = startPad - 1; i >= 0; i--) {
    push(new Date(year, month - 1, prevDays - i), prevDays - i, false);
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

type Props = {
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
  onDone?: () => void;
  onClear?: () => void;
  className?: string;
};

/** Dual-month range calendar with hover preview. */
export function DateRangeCalendar({ start, end, onChange, onDone, onClear, className = '' }: Props) {
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [hoverKey, setHoverKey] = useState('');
  const [picking, setPicking] = useState<'start' | 'end'>(start && !end ? 'end' : 'start');
  const seed = start || end || toDateKey(new Date());
  const [y, m] = seed.split('-').map(Number);
  const [view, setView] = useState({ year: y, month: (m || 1) - 1 });

  const previewing = picking === 'end' && Boolean(draftStart) && !draftEnd;
  const rightYear = view.month === 11 ? view.year + 1 : view.year;
  const rightMonth = view.month === 11 ? 0 : view.month + 1;

  const leftCells = useMemo(
    () => monthCells(view.year, view.month, draftStart, draftEnd, hoverKey, previewing),
    [view.year, view.month, draftStart, draftEnd, hoverKey, previewing],
  );
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
      onChange({ start: key, end: '' });
      return;
    }
    const s = key < draftStart ? key : draftStart;
    const e = key < draftStart ? draftStart : key;
    setDraftStart(s);
    setDraftEnd(e);
    onChange({ start: s, end: e });
    setPicking('start');
    setHoverKey('');
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

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
    <div className={`bi-range-calendar ${className}`}>
      <div className="bi-range-steps" aria-hidden>
        <span className={`bi-range-step${picking === 'start' || !draftStart ? ' is-active' : ''}${draftStart ? ' is-done' : ''}`}>
          <i>1</i> Start
        </span>
        <span className="bi-range-steps-line" />
        <span className={`bi-range-step${picking === 'end' ? ' is-active' : ''}${draftEnd ? ' is-done' : ''}`}>
          <i>2</i> End
        </span>
      </div>
      <div className="bi-range-summary">
        <div className={`bi-range-chip${picking === 'start' ? ' is-active' : ''}`}>
          <small>Start</small>
          <strong>{draftStart ? formatDateLabel(draftStart) : 'Select date'}</strong>
        </div>
        <span className="bi-range-summary-arrow" aria-hidden>
          →
        </span>
        <div className={`bi-range-chip${picking === 'end' ? ' is-active' : ''}`}>
          <small>End</small>
          <strong>{draftEnd ? formatDateLabel(draftEnd) : hoverKey && draftStart ? '…' : 'Select date'}</strong>
        </div>
      </div>
      <div className="bi-range-head">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <span>
          Select {picking === 'start' ? 'start date' : 'end date'}
        </span>
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
            setDraftStart('');
            setDraftEnd('');
            setHoverKey('');
            setPicking('start');
            onChange({ start: '', end: '' });
            onClear?.();
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="is-accent"
          disabled={!draftStart || !draftEnd}
          onClick={() => onDone?.()}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
