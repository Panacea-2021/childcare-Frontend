'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LazyMotion, MotionConfig, AnimatePresence, domAnimation, m } from 'framer-motion';
import { CalendarDays, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Holiday } from './types';
import {
  availableYears,
  formatHolidayRange,
  holidayDayCount,
  holidayEmoji,
  parseISODate,
} from './mockData';

type Props = {
  holidays: Holiday[];
  onAdd: () => void;
  onEdit: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
};

export function HolidayCalendarTab({ holidays, onAdd, onEdit, onDelete }: Props) {
  const years = useMemo(() => availableYears(holidays), [holidays]);
  const [year, setYear] = useState(2026);
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!yearOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!yearRef.current?.contains(e.target as Node)) setYearOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [yearOpen]);

  const filtered = useMemo(
    () =>
      holidays.filter((h) => {
        const y1 = parseISODate(h.startDate).getFullYear();
        const y2 = parseISODate(h.endDate || h.startDate).getFullYear();
        return y1 === year || y2 === year;
      }),
    [holidays, year],
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="sh-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sh-toolbar">
            <div className="sh-year-wrap" ref={yearRef}>
              <button
                type="button"
                className="sh-year-btn"
                aria-haspopup="listbox"
                aria-expanded={yearOpen}
                onClick={() => setYearOpen((v) => !v)}
              >
                <CalendarDays size={16} aria-hidden />
                <span>{year}</span>
                <ChevronDown size={14} aria-hidden className={yearOpen ? 'is-open' : ''} />
              </button>
              <AnimatePresence>
                {yearOpen ? (
                  <m.ul
                    className="sh-year-menu"
                    role="listbox"
                    aria-label="Select year"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    {years.map((y) => (
                      <li key={y}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={y === year}
                          className={y === year ? 'is-active' : ''}
                          onClick={() => {
                            setYear(y);
                            setYearOpen(false);
                          }}
                        >
                          {y}
                        </button>
                      </li>
                    ))}
                  </m.ul>
                ) : null}
              </AnimatePresence>
            </div>

            <m.button
              type="button"
              className="cal-btn-add sh-cta"
              onClick={onAdd}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Add holiday"
            >
              <span className="cal-btn-save-shine" aria-hidden />
              <Plus size={16} aria-hidden />
              Add Holiday
            </m.button>
          </div>

          {filtered.length === 0 ? (
            <EmptyHolidays onCreate={onAdd} />
          ) : (
            <div className="sh-table-card">
              <div className="sh-table-scroll">
                <table className="sh-table">
                  <thead>
                    <tr>
                      <th>Holidays</th>
                      <th>Date range</th>
                      <th>Number of days</th>
                      <th className="sh-th-actions">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h, i) => (
                      <m.tr
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.28 }}
                        className="sh-row"
                      >
                        <td>
                          <span className="sh-hol-name">
                            <span aria-hidden>{holidayEmoji(h.name)}</span>
                            {h.name}
                          </span>
                        </td>
                        <td>
                          <span className="sh-badge sh-badge-range">
                            {formatHolidayRange(h.startDate, h.endDate)}
                          </span>
                        </td>
                        <td>
                          <span className="sh-badge sh-badge-days">
                            {holidayDayCount(h.startDate, h.endDate)}
                          </span>
                        </td>
                        <td>
                          <div className="sh-row-actions">
                            <m.button
                              type="button"
                              className="sh-icon-btn sh-icon-edit"
                              aria-label={`Edit ${h.name}`}
                              title="Edit"
                              onClick={() => onEdit(h)}
                              whileHover={{ scale: 1.08, rotate: -6 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Pencil size={14} />
                            </m.button>
                            <m.button
                              type="button"
                              className="sh-icon-btn sh-icon-del"
                              aria-label={`Delete ${h.name}`}
                              title="Delete"
                              onClick={() => onDelete(h.id)}
                              whileHover={{ scale: 1.08, rotate: 6 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 size={14} />
                            </m.button>
                          </div>
                        </td>
                      </m.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}

function EmptyHolidays({ onCreate }: { onCreate: () => void }) {
  return (
    <m.div
      className="sh-empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
    >
      <div className="sh-empty-art" aria-hidden>
        <svg width="120" height="88" viewBox="0 0 120 88" fill="none">
          <circle cx="92" cy="18" r="12" fill="#FDE68A" opacity="0.9" />
          <ellipse cx="60" cy="72" rx="36" ry="8" fill="rgba(125,211,252,0.35)" />
          <path d="M36 70c8-14 18-20 24-20s16 6 24 20H36Z" fill="#FDE68A" />
          <path d="M60 34v28" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M60 34c-4 8-10 10-14 8 6-2 10-6 14-8 4 2 8 6 14 8-4 2-10 0-14-8Z"
            fill="#10B981"
          />
          <path
            d="M18 28c6-4 12-2 14 2"
            stroke="rgba(93,95,239,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M100 40 112 34"
            stroke="rgba(93,95,239,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3>No holidays added yet.</h3>
      <p>Create your first holiday to brighten the staff calendar.</p>
      <m.button
        type="button"
        className="cal-btn-add"
        onClick={onCreate}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={16} aria-hidden />
        Create First Holiday
      </m.button>
    </m.div>
  );
}
