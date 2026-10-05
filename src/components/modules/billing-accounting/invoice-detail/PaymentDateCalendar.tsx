'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { easeOutCubic } from './animations';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatPretty(key: string) {
  if (!key) return 'Select a date';
  const d = parseKey(key);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type Props = {
  value: string;
  onChange: (next: string) => void;
};

/** Premium inline month calendar for Record Payment. */
export function PaymentDateCalendar({ value, onChange }: Props) {
  const selected = value ? parseKey(value) : new Date();
  const [view, setView] = useState({
    year: selected.getFullYear(),
    month: selected.getMonth(),
  });
  const todayKey = toKey(new Date());

  const label = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const prevDays = new Date(view.year, view.month, 0).getDate();
    const list: { key: string; day: number; inMonth: boolean }[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const day = prevDays - i;
      list.push({ key: toKey(new Date(view.year, view.month - 1, day)), day, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      list.push({ key: toKey(new Date(view.year, view.month, day)), day, inMonth: true });
    }
    while (list.length % 7 !== 0) {
      const day = list.length - (startPad + daysInMonth) + 1;
      list.push({ key: toKey(new Date(view.year, view.month + 1, day)), day, inMonth: false });
    }
    return list;
  }, [view.year, view.month]);

  const shift = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <div className="ivd-pay-cal">
      <div className="ivd-pay-cal-selected">
        <span>Selected</span>
        <strong>{formatPretty(value)}</strong>
      </div>

      <div className="ivd-pay-cal-head">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <AnimatePresence mode="wait">
          <motion.em
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: easeOutCubic }}
          >
            {label}
          </motion.em>
        </AnimatePresence>
        <button type="button" onClick={() => shift(1)} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="ivd-pay-cal-week">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${view.year}-${view.month}`}
          className="ivd-pay-cal-grid"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: easeOutCubic }}
        >
          {cells.map((c) => {
            const isSelected = c.key === value;
            const isToday = c.key === todayKey;
            return (
              <button
                key={c.key}
                type="button"
                className={[
                  !c.inMonth ? 'is-muted' : '',
                  isSelected ? 'is-selected' : '',
                  isToday && !isSelected ? 'is-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onChange(c.key)}
              >
                <span>{c.day}</span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="ivd-pay-cal-foot">
        <button type="button" onClick={() => onChange(todayKey)}>
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const d = new Date();
            setView({ year: d.getFullYear(), month: d.getMonth() });
          }}
        >
          This month
        </button>
      </div>
    </div>
  );
}
