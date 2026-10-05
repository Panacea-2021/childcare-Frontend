'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloatingPosition } from '@/components/modules/center-management/ui/useFloatingPosition';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  /** YYYY-MM or YYYY-MM-DD (day ignored). Empty string allowed. */
  value: string;
  /** Emits YYYY-MM-01 */
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Disable months strictly before this YYYY-MM / YYYY-MM-DD */
  minValue?: string;
};

function parseMonth(value: string) {
  if (!value) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const [y, m] = value.split('-').map(Number);
  return { year: y || new Date().getFullYear(), month: Math.max(0, (m || 1) - 1) };
}

function toMonthStart(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

function formatMonth(value: string) {
  if (!value) return '';
  const { year, month } = parseMonth(value);
  return `${MONTHS[month]} ${year}`;
}

/** Month-only field picker for Fee Plan period (Monthly+ frequencies). */
export function FeePlanMonthField({
  value,
  onChange,
  placeholder = 'Select month',
  className = '',
  disabled = false,
  minValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseMonth(value);
  const minParsed = minValue ? parseMonth(minValue) : null;
  const [viewYear, setViewYear] = useState(parsed.year);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align: 'start',
    minWidth: 280,
    maxHeight: 360,
  });

  useEffect(() => {
    if (open) setViewYear(parseMonth(value).year);
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

  return (
    <div className={`sa-day-picker cfp-month-field ${className}`} ref={triggerRef}>
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
        <span className="sa-day-trigger-label">{value ? formatMonth(value) : placeholder}</span>
        <CalendarDays size={16} />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className="sa-day-panel cfp-month-panel"
                  style={{ top: pos.top, left: pos.left, width: Math.max(280, pos.width) }}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="sa-day-head">
                    <button type="button" onClick={() => setViewYear((y) => y - 1)} aria-label="Previous year">
                      <ChevronLeft size={14} />
                      <ChevronLeft size={14} style={{ marginLeft: -8 }} />
                    </button>
                    <strong>{viewYear}</strong>
                    <button type="button" onClick={() => setViewYear((y) => y + 1)} aria-label="Next year">
                      <ChevronRight size={14} />
                      <ChevronRight size={14} style={{ marginLeft: -8 }} />
                    </button>
                  </div>
                  <div className="cfp-month-grid">
                    {MONTHS.map((m, idx) => {
                      const active = Boolean(value) && parsed.year === viewYear && parsed.month === idx;
                      const blocked = Boolean(
                        minParsed &&
                          (viewYear < minParsed.year ||
                            (viewYear === minParsed.year && idx < minParsed.month)),
                      );
                      return (
                        <button
                          key={m}
                          type="button"
                          className={`${active ? 'is-active' : ''}${blocked ? ' is-blocked' : ''}`}
                          disabled={blocked}
                          onClick={() => {
                            if (blocked) return;
                            onChange(toMonthStart(viewYear, idx));
                            setOpen(false);
                          }}
                        >
                          {m}
                        </button>
                      );
                    })}
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
