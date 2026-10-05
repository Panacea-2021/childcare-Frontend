'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';
import type { ParentCalendarEvent } from './types';
import { CATEGORY_TONE } from './types';
import { formatDisplayDate, formatTimeRange, toISODate } from './mockData';
import { ParentCategoryIcon } from './ParentCategoryIcon';

type Props = {
  open: boolean;
  date: Date | null;
  events: ParentCalendarEvent[];
  anchor: DOMRect | null;
  onClose: () => void;
  onSelect: (event: ParentCalendarEvent) => void;
};

type Pos = { top: number; left: number; width: number };

function computePos(anchor: DOMRect | null): Pos {
  const width = Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 24 : 320);
  if (typeof window === 'undefined') {
    return { top: 80, left: 16, width };
  }

  if (!anchor) {
    return {
      top: Math.max(16, window.innerHeight / 2 - 140),
      left: Math.max(12, (window.innerWidth - width) / 2),
      width,
    };
  }

  let left = anchor.left;
  if (left + width > window.innerWidth - 12) {
    left = window.innerWidth - width - 12;
  }
  left = Math.max(12, left);

  const preferBelow = anchor.bottom + 8;
  const top =
    preferBelow + 280 > window.innerHeight - 12
      ? Math.max(12, anchor.top - 12 - 280)
      : preferBelow;

  return { top, left, width };
}

export function ParentDayEventsPopover({
  open,
  date,
  events,
  anchor,
  onClose,
  onSelect,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, width: 320 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    setPos(computePos(anchor));
  }, [open, anchor, events.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onReposition = () => setPos(computePos(anchor));
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, onClose, anchor]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const nextTop =
      rect.bottom > window.innerHeight - 12
        ? Math.max(12, window.innerHeight - rect.height - 12)
        : pos.top;
    const nextLeft =
      rect.right > window.innerWidth - 12
        ? Math.max(12, window.innerWidth - rect.width - 12)
        : pos.left;
    if (nextTop !== pos.top || nextLeft !== pos.left) {
      setPos((p) => ({ ...p, top: nextTop, left: nextLeft }));
    }
    // Clamp once after open / content change — avoid looping on pos itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, events.length, anchor]);

  if (!mounted) return null;

  const title = date ? formatDisplayDate(toISODate(date)) : 'Day events';

  return createPortal(
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && date ? (
            <>
              <m.div
                className="pc-popover-backdrop"
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
              />
              <m.div
                ref={panelRef}
                className="pc-day-popover"
                role="dialog"
                aria-modal="true"
                aria-label={`${title}, ${events.length} events`}
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <header className="pc-day-popover-head">
                  <div>
                    <h3>{title}</h3>
                    <p>
                      {events.length} event{events.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="pc-day-popover-close"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </header>
                <ul className="pc-day-popover-list">
                  {events.map((ev) => {
                    const tone = CATEGORY_TONE[ev.category];
                    return (
                      <li key={ev.id}>
                        <button
                          type="button"
                          className={`pc-day-popover-item pc-day-popover-item--${tone}`}
                          onClick={() => {
                            onClose();
                            onSelect(ev);
                          }}
                        >
                          <ParentCategoryIcon category={ev.category} size={13} />
                          <span className="pc-day-popover-copy">
                            <span className="pc-day-popover-name">{ev.title}</span>
                            <span className="pc-day-popover-meta">
                              <span className={`pc-cat-badge pc-cat-badge--${tone}`}>
                                {ev.category}
                              </span>
                              <span>{formatTimeRange(ev.startTime, ev.endTime)}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </m.div>
            </>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}
