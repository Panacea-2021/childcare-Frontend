'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloatingPosition } from './useFloatingPosition';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  value: { year: number; month: number }; // month 0-11
  onChange: (next: { year: number; month: number }) => void;
  className?: string;
};

export function MonthPicker({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.year);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align: 'end',
    minWidth: 260,
    maxHeight: 360,
  });

  useEffect(() => {
    if (open) setViewYear(value.year);
  }, [open, value.year]);

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

  const label = `${MONTHS[value.month]} ${value.year}`;

  return (
    <div className={`cm-month-picker ${className}`} ref={triggerRef}>
      <button
        type="button"
        className={`cm-month-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <CalendarDays size={15} />
        <span>{label}</span>
        <ChevronRight
          size={14}
          style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }}
        />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className="cm-month-panel"
                  style={{ top: pos.top, left: pos.left, width: Math.max(260, pos.width) }}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="cm-month-year">
                    <button type="button" onClick={() => setViewYear((y) => y - 1)} aria-label="Previous year">
                      <ChevronLeft size={16} />
                    </button>
                    <strong>{viewYear}</strong>
                    <button type="button" onClick={() => setViewYear((y) => y + 1)} aria-label="Next year">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="cm-month-grid">
                    {MONTHS.map((m, idx) => {
                      const active = value.year === viewYear && value.month === idx;
                      return (
                        <button
                          key={m}
                          type="button"
                          className={active ? 'is-active' : ''}
                          onClick={() => {
                            onChange({ year: viewYear, month: idx });
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

export function formatMonthLabel(value: { year: number; month: number }) {
  return `${MONTHS[value.month]} ${value.year}`;
}
