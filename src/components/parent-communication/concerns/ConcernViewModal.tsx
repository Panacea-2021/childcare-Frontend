'use client';

import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, GitBranch, StickyNote, X } from 'lucide-react';
import { applyConcernStatus } from '@/components/parent-communication/concerns/concernTimeline';
import type { ConcernStatus, ParentConcern } from '@/types/concern';

interface ConcernViewModalProps {
  concern: ParentConcern | null;
  /** false = parent note only; true = status timeline */
  focusTimeline?: boolean;
  onClose: () => void;
  onUpdate: (concern: ParentConcern) => void;
}

export function ConcernViewModal({
  concern,
  focusTimeline = false,
  onClose,
  onUpdate,
}: ConcernViewModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const open = Boolean(concern);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const setStatus = (status: ConcernStatus) => {
    if (!concern) return;
    onUpdate(applyConcernStatus(concern, status));
  };

  return createPortal(
    <AnimatePresence>
      {open && concern ? (
        <motion.div
          className="concerns-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className={`concerns-dialog ${focusTimeline ? 'concerns-dialog-timeline' : 'concerns-dialog-note'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="concerns-dialog-header">
              <div className="concerns-dialog-title-block">
                <span className="concerns-dialog-icon" aria-hidden>
                  {focusTimeline ? <GitBranch size={20} /> : <StickyNote size={20} />}
                </span>
                <div>
                  <h2 id={titleId}>
                    {focusTimeline ? 'Status Timeline' : 'Parent Concern'}
                  </h2>
                  <p>
                    {focusTimeline
                      ? 'Status updates reflect Open, In Progress, and Resolved only.'
                      : 'Note submitted by the parent.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="concerns-dialog-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="concerns-dialog-body">
              {!focusTimeline ? (
                <section className="concerns-dialog-section concerns-note-only">
                  <span className="concerns-note-kicker" aria-hidden>
                    <AlertTriangle size={14} />
                    Parent note
                  </span>
                  <h3 className="concerns-note-title">{concern.title}</h3>
                  <p className="concerns-note-body">{concern.description}</p>
                </section>
              ) : (
                <section className="concerns-dialog-section concerns-timeline-panel" aria-label="Status timeline">
                  <div className="ui-field concerns-timeline-status-field">
                    <label className="ui-label" htmlFor="concern-status-timeline">
                      Current status
                    </label>
                    <select
                      id="concern-status-timeline"
                      className="ui-select"
                      value={concern.status}
                      onChange={(e) => setStatus(e.target.value as ConcernStatus)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <ol className="concerns-status-timeline">
                    {concern.timeline.map((event, index) => (
                      <li
                        key={event.step}
                        className={`${event.completed ? 'is-complete' : 'is-pending'} is-clickable`}
                      >
                        {index < concern.timeline.length - 1 ? (
                          <span className="concerns-timeline-line" aria-hidden />
                        ) : null}
                        <button
                          type="button"
                          className="concerns-timeline-step-btn"
                          onClick={() => setStatus(event.step)}
                          aria-label={`Set status to ${event.step}`}
                        >
                          <motion.span
                            className="concerns-timeline-node"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.06 }}
                            aria-hidden
                          >
                            {event.completed ? <Check size={12} strokeWidth={3} /> : null}
                          </motion.span>
                          <div className="concerns-timeline-copy">
                            <strong>{event.step}</strong>
                            <p>{event.label}</p>
                            {event.at ? (
                              <span className="concerns-timeline-at">{event.at}</span>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            <footer className="concerns-dialog-footer">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                Close
              </button>
              {focusTimeline && concern.status !== 'Resolved' ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  onClick={() => setStatus('Resolved')}
                >
                  <Check size={15} />
                  Mark Resolved
                </button>
              ) : null}
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
