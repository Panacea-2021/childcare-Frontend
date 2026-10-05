'use client';

import { CalendarDays } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentCalendarEvent } from './types';
import { CATEGORY_TONE } from './types';
import { formatDisplayDate, formatTimeRange, toISODate } from './mockData';

type Props = {
  open: boolean;
  date: Date | null;
  events: ParentCalendarEvent[];
  onClose: () => void;
  onSelect: (event: ParentCalendarEvent) => void;
};

export function ParentDayEventsModal({ open, date, events, onClose, onSelect }: Props) {
  const title = date ? formatDisplayDate(toISODate(date)) : 'Day events';

  return (
    <Modal
      open={open && Boolean(date)}
      title={title}
      subtitle={`${events.length} event${events.length === 1 ? '' : 's'} on this day`}
      onClose={onClose}
      icon={<CalendarDays size={18} />}
      footer={
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Close
        </button>
      }
    >
      <ul className="pc-day-modal-list">
        {events.map((ev) => {
          const tone = CATEGORY_TONE[ev.category];
          return (
            <li key={ev.id}>
              <button
                type="button"
                className={`pc-day-modal-item pc-day-modal-item--${tone}`}
                onClick={() => {
                  onClose();
                  onSelect(ev);
                }}
              >
                <span className={`pc-list-dot pc-list-dot--${tone}`} aria-hidden />
                <span className="pc-day-modal-copy">
                  <span className="pc-day-modal-name">{ev.title}</span>
                  <span className="pc-day-modal-meta">
                    <span className={`pc-cat-badge pc-cat-badge--${tone}`}>{ev.category}</span>
                    <span>{formatTimeRange(ev.startTime, ev.endTime)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
