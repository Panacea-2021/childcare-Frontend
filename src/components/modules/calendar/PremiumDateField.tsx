'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDays, monthBadge, startOfWeek, toISODate, parseISODate } from './mockData';

type Props = {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder: string;
  icon?: ReactNode;
  error?: string;
  className?: string;
  /** Show a clear (×) control when a date is selected */
  clearable?: boolean;
};

function formatDisplay(iso: string) {
  if (!iso) return '';
  const d = parseISODate(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function PremiumDateField({
  id,
  value,
  onChange,
  placeholder,
  icon,
  error,
  className = '',
  clearable = false,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? parseISODate(value) : new Date()));
  const [dir, setDir] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (value) setViewMonth(parseISODate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = 320;
      const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
      const below = window.innerHeight - r.bottom;
      const top = below > 340 || below > r.top ? r.bottom + 8 : Math.max(12, r.top - 348);
      setPos({ top, left });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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

  const pop =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={popRef}
            className="cal-prem-datepop"
            style={{ top: pos.top, left: pos.left }}
            role="dialog"
            aria-label={placeholder}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <div className="cal-picker-head">
              <button type="button" className="cal-icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                <ChevronLeft size={16} />
              </button>
              <div className="cal-picker-month-wrap">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.strong
                    key={monthKey}
                    initial={{ opacity: 0, x: dir >= 0 ? 14 : -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir >= 0 ? -14 : 14 }}
                    transition={{ duration: 0.2 }}
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {cells.map((day) => {
                  const iso = toISODate(day);
                  const inMonth = day.getMonth() === viewMonth.getMonth();
                  const selected = iso === value;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={[
                        'cal-picker-day',
                        iso === todayIso ? 'is-today' : '',
                        selected ? 'is-range-start' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!inMonth}
                      onClick={() => {
                        onChange(iso);
                        setOpen(false);
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className={`cal-prem-field ${className}`} ref={wrapRef}>
      <div
        className={`cal-prem-trigger ${open ? 'is-open' : ''} ${value ? 'has-value' : ''} ${error ? 'has-error' : ''}`}
      >
        <button
          id={fieldId}
          type="button"
          className="cal-prem-trigger-main"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="cal-prem-ico" aria-hidden>
            {icon ?? <CalendarDays size={16} />}
          </span>
          <span className={`cal-prem-value ${value ? '' : 'is-placeholder'}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </button>
        {clearable && value ? (
          <button
            type="button"
            className="cal-prem-clear"
            aria-label="Clear date"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <button
            type="button"
            className="cal-prem-trailing-btn"
            aria-label={placeholder}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <CalendarDays size={15} className="cal-prem-trailing" aria-hidden />
          </button>
        )}
      </div>
      {error ? <p className="cal-field-error">{error}</p> : null}
      {pop}
    </div>
  );
}
