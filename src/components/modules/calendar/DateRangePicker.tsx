'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  formatRangeLabel,
  monthBadge,
  parseISODate,
  startOfWeek,
  toISODate,
} from './mockData';

type Props = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
};

type PopPos = { top: number; left: number; width: number };

export function DateRangePicker({ weekStart, onWeekChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(weekStart));
  const [dir, setDir] = useState(0);
  const [pos, setPos] = useState<PopPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();
  const weekEnd = addDays(weekStart, 6);
  const rangeStartIso = toISODate(weekStart);
  const rangeEndIso = toISODate(weekEnd);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setViewMonth(new Date(weekStart));
  }, [weekStart]);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popWidth = Math.min(340, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - popWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popWidth - 12));
    const spaceBelow = window.innerHeight - rect.bottom;
    const preferBelow = spaceBelow > 360 || spaceBelow > rect.top;
    const top = preferBelow ? rect.bottom + 10 : Math.max(12, rect.top - 10 - 360);
    setPos({ top, left, width: popWidth });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') onWeekChange(addDays(weekStart, -7));
      if (e.key === 'ArrowRight') onWeekChange(addDays(weekStart, 7));
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onWeekChange, weekStart]);

  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [viewMonth]);

  const todayIso = toISODate(new Date());
  const monthKey = `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`;

  const shiftMonth = (delta: number) => {
    setDir(delta);
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  };

  const picker =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={popRef}
            id={popId}
            role="dialog"
            aria-label="Select week"
            className="cal-picker-pop cal-picker-pop-portal"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <div className="cal-picker-head">
              <button type="button" className="cal-icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                <ChevronLeft size={16} />
              </button>
              <div className="cal-picker-month-wrap">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.strong
                    key={monthKey}
                    custom={dir}
                    initial={{ opacity: 0, x: dir >= 0 ? 16 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir >= 0 ? -16 : 16 }}
                    transition={{ duration: 0.22 }}
                  >
                    {monthBadge(viewMonth)}
                  </motion.strong>
                </AnimatePresence>
              </div>
              <button type="button" className="cal-icon-btn" aria-label="Next month" onClick={() => shiftMonth(1)}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="cal-picker-grid" aria-hidden>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="cal-picker-dow">
                  {d}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={monthKey}
                className="cal-picker-grid"
                role="grid"
                aria-label="Calendar dates"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {cells.map((day) => {
                  const iso = toISODate(day);
                  const inMonth = day.getMonth() === viewMonth.getMonth();
                  const inRange = iso >= rangeStartIso && iso <= rangeEndIso;
                  const isStart = iso === rangeStartIso;
                  const isEnd = iso === rangeEndIso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      role="gridcell"
                      className={[
                        'cal-picker-day',
                        iso === todayIso ? 'is-today' : '',
                        inRange ? 'is-in-range' : '',
                        isStart ? 'is-range-start' : '',
                        isEnd ? 'is-range-end' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!inMonth}
                      aria-label={iso}
                      aria-selected={inRange}
                      onClick={() => {
                        onWeekChange(startOfWeek(parseISODate(iso)));
                        setOpen(false);
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
            <p className="cal-picker-hint">Select any day to jump to that week · ← → to navigate</p>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className="cal-picker-wrap" ref={wrapRef}>
      <div className="cal-date-nav">
        <motion.button
          type="button"
          className="cal-icon-btn"
          aria-label="Previous week"
          onClick={() => onWeekChange(addDays(weekStart, -7))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={18} />
        </motion.button>
        <button
          ref={triggerRef}
          type="button"
          className="cal-date-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{formatRangeLabel(weekStart, weekEnd)}</span>
          <CalendarDays size={16} aria-hidden />
        </button>
        <motion.button
          type="button"
          className="cal-icon-btn"
          aria-label="Next week"
          onClick={() => onWeekChange(addDays(weekStart, 7))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>
      {picker}
    </div>
  );
}
