'use client';

import { CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentCalendarEvent } from './types';
import { CATEGORY_TONE } from './types';
import { formatDisplayDate, formatTimeRange } from './mockData';
import { ParentCategoryIcon } from './ParentCategoryIcon';

type Props = {
  open: boolean;
  event: ParentCalendarEvent | null;
  studentName?: string | null;
  onClose: () => void;
};

export function ParentEventDetailModal({ open, event, studentName, onClose }: Props) {
  if (!event) {
    return (
      <Modal open={false} title="Event Details" onClose={onClose}>
        {null}
      </Modal>
    );
  }

  const tone = CATEGORY_TONE[event.category];

  return (
    <Modal
      open={open}
      title="Event Details"
      subtitle="School calendar event"
      onClose={onClose}
      icon={<CalendarDays size={18} />}
      className="pc-detail-modal"
      iconClose
      footer={
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={`pc-detail pc-detail--${tone}`}>
        <div className="pc-detail-head">
          <span className={`pc-cat-badge pc-cat-badge--${tone}`}>
            <ParentCategoryIcon category={event.category} size={11} />
            {event.category}
          </span>
          <h3 className="pc-detail-title">{event.title}</h3>
          <p className="pc-detail-desc">{event.description}</p>
        </div>

        <div className="pc-detail-grid">
          <div className="pc-detail-item">
            <CalendarDays size={16} aria-hidden />
            <div>
              <span className="pc-detail-label">Date</span>
              <span className="pc-detail-value">{formatDisplayDate(event.date)}</span>
            </div>
          </div>
          <div className="pc-detail-item">
            <Clock3 size={16} aria-hidden />
            <div>
              <span className="pc-detail-label">Time</span>
              <span className="pc-detail-value">
                {formatTimeRange(event.startTime, event.endTime)}
              </span>
            </div>
          </div>
          {event.room ? (
            <div className="pc-detail-item">
              <MapPin size={16} aria-hidden />
              <div>
                <span className="pc-detail-label">Room</span>
                <span className="pc-detail-value">{event.room}</span>
              </div>
            </div>
          ) : null}
          {studentName ? (
            <div className="pc-detail-item">
              <UserRound size={16} aria-hidden />
              <div>
                <span className="pc-detail-label">Student</span>
                <span className="pc-detail-value">{studentName}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
