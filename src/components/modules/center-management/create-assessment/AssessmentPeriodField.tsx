'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import {
  DateRangeCalendar,
  formatDateLabel,
} from '@/components/modules/billing-accounting/DateRangeCalendar';
import '@/components/modules/billing-accounting/billing-invoices.css';

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  className?: string;
};

/** Single assessment-period control — opens one dual-month range calendar. */
export function AssessmentPeriodField({ from, to, onChange, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ start: from, end: to });
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({ start: from, end: to });
  }, [open, from, to]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 560), Math.min(640, window.innerWidth - 24));
      let left = r.left;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
      if (left < 12) left = 12;
      const preferredTop = r.bottom + 8;
      const maxH = Math.min(560, window.innerHeight - 24);
      const top =
        preferredTop + maxH > window.innerHeight - 12
          ? Math.max(12, r.top - maxH - 8)
          : preferredTop;
      setPos({ top, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
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

  const fromLabel = from ? formatDateLabel(from) : 'Start date';
  const toLabel = to ? formatDateLabel(to) : 'End date';

  return (
    <div className={`ca-period-field ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`ca-period-trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Assessment period date range"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`ca-period-pill${!from ? ' is-ph' : ''}`}>
          <em>{fromLabel}</em>
          <CalendarDays size={16} aria-hidden />
        </span>
        <span className="ca-period-join" aria-hidden />
        <span className={`ca-period-pill${!to ? ' is-ph' : ''}`}>
          <em>{toLabel}</em>
          <CalendarDays size={16} aria-hidden />
        </span>
      </button>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open && pos ? (
                <motion.div
                  ref={panelRef}
                  className="bi-custom-date-panel ca-period-panel"
                  style={{ top: pos.top, left: pos.left, width: pos.width }}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  role="dialog"
                  aria-label="Custom date range"
                >
                  <div className="bi-custom-date-head">
                    <div>
                      <strong>Custom date range</strong>
                      <p>Pick a start date, then an end date</p>
                    </div>
                    <button type="button" className="bi-link-btn" onClick={() => setOpen(false)}>
                      Close
                    </button>
                  </div>
                  <DateRangeCalendar
                    key={`${open}-${from}-${to}`}
                    start={draft.start}
                    end={draft.end}
                    onChange={setDraft}
                    onClear={() => setDraft({ start: '', end: '' })}
                    onDone={() => {
                      if (!draft.start || !draft.end) return;
                      onChange({ from: draft.start, to: draft.end });
                      setOpen(false);
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
