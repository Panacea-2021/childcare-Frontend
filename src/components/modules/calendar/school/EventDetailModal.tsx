'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  Clock3,
  MessageSquare,
  Paperclip,
  Users,
  X,
} from 'lucide-react';
import type { SchoolEvent } from './types';
import { formatDisplayDate, formatTimeRange } from './mockData';
import { CategoryBadge, EventCover } from './EventCover';

type Props = {
  open: boolean;
  event: SchoolEvent | null;
  onClose: () => void;
  onEdit?: (event: SchoolEvent) => void;
};

export function EventDetailModal({ open, event, onClose, onEdit }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && event ? (
            <m.div
              className="cal-dialog-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            >
              <m.div
                className="cal-dialog sc-dialog sc-detail-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="cal-dialog-header">
                  <div className="cal-dialog-title-block">
                    <span className="cal-dialog-emoji" aria-hidden>
                      👁
                    </span>
                    <div>
                      <h2 id={titleId}>Event Details</h2>
                      <p>Read-only view of this school event</p>
                    </div>
                  </div>
                  <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                  </button>
                </header>

                <div className="cal-dialog-body">
                  <div className="sc-detail-cover-wrap">
                    <EventCover event={event} size="hero" />
                    <div className="sc-detail-cover-badge">
                      <CategoryBadge category={event.category} />
                    </div>
                  </div>

                  <m.div
                    className="cal-form-section"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="cal-form-section-body sc-detail-body">
                      <h3 className="sc-detail-title">{event.name}</h3>
                      <p className="sc-detail-desc">{event.description || 'No description provided.'}</p>

                      <div className="sc-detail-grid">
                        <div className="sc-detail-item">
                          <CalendarDays size={16} aria-hidden />
                          <div>
                            <span className="sc-detail-label">Date</span>
                            <span className="sc-detail-value">
                              {formatDisplayDate(event.startDate)}
                              {event.endDate !== event.startDate
                                ? ` – ${formatDisplayDate(event.endDate)}`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="sc-detail-item">
                          <Clock3 size={16} aria-hidden />
                          <div>
                            <span className="sc-detail-label">Time</span>
                            <span className="sc-detail-value">
                              {formatTimeRange(event.startTime, event.endTime)}
                            </span>
                          </div>
                        </div>
                        <div className="sc-detail-item cal-span-2">
                          <Users size={16} aria-hidden />
                          <div>
                            <span className="sc-detail-label">Applicable Classrooms</span>
                            <div className="sc-chip-row">
                              {event.classrooms.map((c) => (
                                <span key={c} className="sc-room-chip">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sc-detail-settings">
                        <h4>
                          <Bell size={15} aria-hidden /> Notification Settings
                        </h4>
                        <ul>
                          <li className={event.staffOnly ? 'is-on' : ''}>
                            Staff Only — {event.staffOnly ? 'Enabled' : 'Disabled'}
                          </li>
                          <li className={event.notifyStaff ? 'is-on' : ''}>
                            Notify Staff — {event.notifyStaff ? 'On' : 'Off'}
                          </li>
                          <li className={event.notifyParents ? 'is-on' : ''}>
                            Notify Parents — {event.notifyParents ? 'On' : 'Off'}
                          </li>
                          <li className={event.disableComments ? 'is-on' : ''}>
                            <MessageSquare size={13} aria-hidden /> Comments —{' '}
                            {event.disableComments ? 'Disabled' : 'Enabled'}
                          </li>
                        </ul>
                      </div>

                      <div className="sc-detail-files">
                        <h4>
                          <Paperclip size={15} aria-hidden /> Attached Files
                        </h4>
                        {event.attachments.length ? (
                          <ul className="sc-file-list">
                            {event.attachments.map((file) => (
                              <li key={file.id} className="sc-file-card">
                                <span className={`sc-file-type sc-file-type--${file.type}`} aria-hidden>
                                  {file.type.slice(0, 3).toUpperCase()}
                                </span>
                                <span className="sc-file-meta">
                                  <span className="sc-file-name">{file.name}</span>
                                  <span className="sc-file-size">{file.sizeLabel}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="sc-muted">No files attached.</p>
                        )}
                      </div>
                    </div>
                  </m.div>
                </div>

                <footer className="cal-dialog-footer">
                  <button type="button" className="cal-btn-ghost" onClick={onClose}>
                    Close
                  </button>
                  {onEdit ? (
                    <button
                      type="button"
                      className="cal-btn-save"
                      onClick={() => {
                        onClose();
                        onEdit(event);
                      }}
                    >
                      <span className="cal-btn-save-shine" aria-hidden />
                      Edit Event
                    </button>
                  ) : null}
                </footer>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}
