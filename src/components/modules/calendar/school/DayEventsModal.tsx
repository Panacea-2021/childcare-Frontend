'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';
import type { SchoolEvent } from './types';
import { formatDisplayDate, formatTimeRange, toISODate } from './mockData';
import { CategoryBadge, EventCover } from './EventCover';

type Props = {
  open: boolean;
  date: Date | null;
  events: SchoolEvent[];
  onClose: () => void;
  onSelect: (event: SchoolEvent) => void;
};

export function DayEventsModal({ open, date, events, onClose, onSelect }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !date) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open ? (
            <m.div
              className="cal-dialog-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            >
              <m.div
                className="cal-dialog sc-day-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="cal-dialog-header">
                  <div className="cal-dialog-title-block">
                    <span className="cal-dialog-emoji" aria-hidden>
                      📅
                    </span>
                    <div>
                      <h2 id={titleId}>{formatDisplayDate(toISODate(date))}</h2>
                      <p>
                        {events.length} event{events.length === 1 ? '' : 's'} on this day
                      </p>
                    </div>
                  </div>
                  <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                  </button>
                </header>
                <div className="cal-dialog-body">
                  <ul className="sc-day-event-list">
                    {events.map((ev) => (
                      <li key={ev.id}>
                        <button
                          type="button"
                          className="sc-day-event-item"
                          onClick={() => {
                            onClose();
                            onSelect(ev);
                          }}
                        >
                          <EventCover event={ev} size="md" />
                          <span className="sc-day-event-copy">
                            <span className="sc-day-event-name">{ev.name}</span>
                            <span className="sc-day-event-meta">
                              <CategoryBadge category={ev.category} />
                              <span>{formatTimeRange(ev.startTime, ev.endTime)}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}
