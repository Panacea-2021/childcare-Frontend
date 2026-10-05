'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloatingPosition } from '@/components/modules/center-management/ui/useFloatingPosition';

export type DateSelectionMode = 'day' | 'week' | 'biweek';

type Props = {
  value: string; // YYYY-MM-DD — range start for week/biweek
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
  /** day = single date; week = Sun–Sat; biweek = 14 days Sun–Sat */
  selectionMode?: DateSelectionMode;
  /** Disable selecting dates/ranges that start before this key */
  minDate?: string;
  /** Shade/block all days up to and including this key (e.g. end of start week) */
  blockedUntil?: string;
  disabled?: boolean;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseDateKey(key: string) {
  if (!key) return new Date();
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDateDays(key: string, days: number) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function weekStartKey(key: string) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() - d.getDay());
  return toDateKey(d);
}

export function snapSelectionStart(key: string, mode: DateSelectionMode) {
  if (mode === 'day') return key;
  return weekStartKey(key);
}

export function selectionSpanDays(mode: DateSelectionMode) {
  if (mode === 'biweek') return 13;
  if (mode === 'week') return 6;
  return 0;
}

export function selectionRange(startKey: string, mode: DateSelectionMode) {
  const start = snapSelectionStart(startKey, mode);
  const end = addDateDays(start, selectionSpanDays(mode));
  return { start, end };
}

function formatShort(key: string) {
  const d = parseDateKey(key);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function formatSelectionLabel(value: string, mode: DateSelectionMode) {
  if (!value) return '';
  if (mode === 'day') return formatShort(value);
  const { start, end } = selectionRange(value, mode);
  return `${formatShort(start)} - ${formatShort(end)}`;
}

function isoWeekNumber(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function DayDatePicker({
  value,
  onChange,
  className = '',
  placeholder = 'Select date',
  selectionMode = 'day',
  minDate,
  blockedUntil,
  disabled = false,
}: Props) {
  const showWeekNumbers = selectionMode === 'week' || selectionMode === 'biweek';
  const [open, setOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState('');
  const selected = parseDateKey(value || toDateKey(new Date()));
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align: 'start',
    minWidth: showWeekNumbers ? 340 : 300,
    maxHeight: 440,
  });

  useEffect(() => {
    if (open) {
      const d = parseDateKey(value || toDateKey(new Date()));
      setView({ year: d.getFullYear(), month: d.getMonth() });
      setHoverKey('');
    }
  }, [open, value]);

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

  const activeRange = useMemo(() => {
    if (!value) return null;
    return selectionRange(value, selectionMode);
  }, [value, selectionMode]);

  const hoverRange = useMemo(() => {
    if (!hoverKey) return null;
    return selectionRange(hoverKey, selectionMode);
  }, [hoverKey, selectionMode]);

  const isDisabledKey = (key: string) => {
    const start = snapSelectionStart(key, selectionMode);
    if (minDate && start < minDate) return true;
    if (blockedUntil && start <= blockedUntil) return true;
    if (minDate && selectionMode === 'day' && key < minDate) return true;
    if (blockedUntil && selectionMode === 'day' && key <= blockedUntil) return true;
    return false;
  };

  const inRange = (key: string, range: { start: string; end: string } | null) =>
    Boolean(range && key >= range.start && key <= range.end);

  const rows = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const prevDays = new Date(view.year, view.month, 0).getDate();
    const list: {
      key: string;
      day: number;
      inMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isInSelection: boolean;
      isInHover: boolean;
      isBlocked: boolean;
      isDisabled: boolean;
    }[] = [];
    const todayKey = toDateKey(new Date());

    const push = (d: Date, inMonth: boolean) => {
      const key = toDateKey(d);
      list.push({
        key,
        day: d.getDate(),
        inMonth,
        isToday: key === todayKey,
        isSelected: Boolean(activeRange && key === activeRange.start),
        isInSelection: inRange(key, activeRange),
        isInHover: inRange(key, hoverRange),
        isBlocked: Boolean(blockedUntil && key <= blockedUntil),
        isDisabled: isDisabledKey(key),
      });
    };

    for (let i = startPad - 1; i >= 0; i--) {
      push(new Date(view.year, view.month - 1, prevDays - i), false);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      push(new Date(view.year, view.month, day), true);
    }
    while (list.length % 7 !== 0) {
      const day = list.length - (startPad + daysInMonth) + 1;
      push(new Date(view.year, view.month + 1, day), false);
    }

    const chunks: (typeof list)[] = [];
    for (let i = 0; i < list.length; i += 7) chunks.push(list.slice(i, i + 7));
    return chunks.map((cells) => {
      const rowStart = cells[0].key;
      const rowActive =
        Boolean(activeRange) &&
        rowStart >= (activeRange?.start || '') &&
        rowStart <= (activeRange?.end || '');
      return {
        week: isoWeekNumber(parseDateKey(cells[0].key)),
        cells,
        isActiveWeek: rowActive && showWeekNumbers,
        isDisabledRow: cells.every((c) => c.isDisabled),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, value, selectionMode, activeRange, hoverRange, blockedUntil, minDate, showWeekNumbers]);

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const shiftYear = (delta: number) => {
    setView((v) => ({ year: v.year + delta, month: v.month }));
  };

  const pick = (key: string) => {
    if (isDisabledKey(key)) return;
    onChange(snapSelectionStart(key, selectionMode));
    setOpen(false);
  };

  const renderDayBtn = (c: (typeof rows)[number]['cells'][number]) => (
    <button
      key={c.key + String(c.inMonth)}
      type="button"
      disabled={c.isDisabled}
      className={[
        c.inMonth ? '' : 'is-muted',
        c.isToday ? 'is-today' : '',
        c.isInSelection ? 'is-in-range' : '',
        c.isInHover && !c.isDisabled ? 'is-hover-range' : '',
        c.isSelected || (c.isInSelection && c.key === activeRange?.end) ? 'is-selected' : '',
        c.isBlocked ? 'is-blocked' : '',
        c.isDisabled ? 'is-disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setHoverKey(c.key)}
      onMouseLeave={() => setHoverKey('')}
      onClick={() => pick(c.key)}
    >
      {c.day}
    </button>
  );

  return (
    <div className={`sa-day-picker ${className}`} ref={triggerRef}>
      <button
        type="button"
        className={`sa-day-trigger${open ? ' is-open' : ''}${!value ? ' is-placeholder' : ''}`}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        disabled={disabled}
        style={disabled ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
      >
        <span className="sa-day-trigger-label">
          {value ? formatSelectionLabel(value, selectionMode) : placeholder}
        </span>
        <CalendarDays size={16} />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className={`sa-day-panel${showWeekNumbers ? ' has-weeks' : ''}`}
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: Math.max(showWeekNumbers ? 340 : 300, pos.width),
                  }}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="sa-day-head">
                    <div className="sa-day-nav">
                      <button type="button" onClick={() => shiftYear(-1)} aria-label="Previous year">
                        <ChevronLeft size={14} />
                        <ChevronLeft size={14} style={{ marginLeft: -8 }} />
                      </button>
                      <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                    <strong>{monthLabel}</strong>
                    <div className="sa-day-nav">
                      <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
                        <ChevronRight size={16} />
                      </button>
                      <button type="button" onClick={() => shiftYear(1)} aria-label="Next year">
                        <ChevronRight size={14} />
                        <ChevronRight size={14} style={{ marginLeft: -8 }} />
                      </button>
                    </div>
                  </div>
                  <div className={`sa-day-week${showWeekNumbers ? ' has-weeks' : ''}`}>
                    {showWeekNumbers ? <span className="sa-week-gutter" /> : null}
                    {WEEKDAYS.map((w) => (
                      <span key={w}>{w}</span>
                    ))}
                  </div>
                  {showWeekNumbers ? (
                    <div className="sa-day-grid has-weeks">
                      {rows.map((row) => (
                        <div
                          key={`${row.week}-${row.cells[0].key}`}
                          className={`sa-day-row${row.isActiveWeek ? ' is-week-on' : ''}${
                            row.isDisabledRow ? ' is-disabled-row' : ''
                          }`}
                        >
                          <span className="sa-week-num">{row.week}</span>
                          {row.cells.map(renderDayBtn)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sa-day-grid">{rows.flatMap((row) => row.cells.map(renderDayBtn))}</div>
                  )}
                  <div className="sa-day-foot">
                    <button type="button" onClick={() => setOpen(false)}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="is-accent"
                      onClick={() => pick(toDateKey(new Date()))}
                    >
                      Today
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
