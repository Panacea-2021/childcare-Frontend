'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  CheckCheck,
  Clock3,
  StickyNote,
  Undo2,
  X,
} from 'lucide-react';
import { StudentAvatar } from '@/components/parent-communication/shared/StudentAvatar';
import {
  formatNoteDate,
  formatNoteTime,
  NOTE_CATEGORY_META,
} from '@/components/parent-communication/notes/noteCategory';
import type { ParentNote } from '@/types/note';

interface NotesViewModalProps {
  note: ParentNote | null;
  allNotes: ParentNote[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function NotesViewModal({
  note,
  allNotes,
  onClose,
  onMarkRead,
  onArchive,
  onRestore,
}: NotesViewModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const open = Boolean(note);

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

  const previous = useMemo(() => {
    if (!note) return [];
    return allNotes
      .filter(
        (n) =>
          n.studentName === note.studentName &&
          n.id !== note.id &&
          n.timestamp < note.timestamp,
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [allNotes, note]);

  const meta = note ? NOTE_CATEGORY_META[note.category] : null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && note && meta ? (
        <motion.div
          className="notes-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="notes-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="notes-dialog-header">
              <div className="notes-dialog-title-block">
                <span className="notes-dialog-icon" aria-hidden>
                  <StickyNote size={20} />
                </span>
                <div>
                  <h2 id={titleId}>View Parent Note</h2>
                  <p>Read-only note submitted from the parent portal.</p>
                </div>
              </div>
              <button
                type="button"
                className="notes-dialog-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="notes-dialog-body">
              <section className="notes-dialog-section">
                <div className="notes-view-profile">
                  <StudentAvatar
                    name={note.studentName}
                    initials={note.studentInitials}
                    color={note.studentPhotoColor}
                    size="lg"
                  />
                  <div className="notes-view-profile-copy">
                    <h3>{note.studentName}</h3>
                    <p>{note.room}</p>
                    <span
                      className="notes-category-badge"
                      style={{ background: meta.badgeBg, color: meta.badgeColor }}
                    >
                      {note.category}
                    </span>
                  </div>
                  <span className={`notes-read-chip ${note.isRead ? 'is-read' : 'is-unread'}`}>
                    {note.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </section>

              <section className="notes-dialog-section">
                <div className="ui-grid-2">
                  <div className="ui-field">
                    <label className="ui-label">Parent name</label>
                    <input className="ui-input" value={note.parentName} readOnly />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Relationship</label>
                    <input className="ui-input" value={note.relationship} readOnly />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Date</label>
                    <input className="ui-input" value={formatNoteDate(note.date)} readOnly />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Time</label>
                    <input className="ui-input" value={formatNoteTime(note.time)} readOnly />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Student</label>
                    <input className="ui-input" value={note.studentName} readOnly />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Room</label>
                    <input className="ui-input" value={note.room} readOnly />
                  </div>
                </div>
              </section>

              <section className="notes-dialog-section">
                <div className="ui-field" style={{ marginBottom: 0 }}>
                  <label className="ui-label">Complete note</label>
                  <textarea
                    className="ui-textarea notes-view-textarea"
                    value={note.content}
                    readOnly
                    rows={4}
                  />
                </div>
              </section>

              <section className="notes-dialog-section">
                <h4 className="notes-dialog-section-title">
                  <Clock3 size={15} aria-hidden /> Previous notes
                </h4>
                {previous.length === 0 ? (
                  <p className="notes-view-muted">No earlier notes for this student.</p>
                ) : (
                  <ul className="notes-timeline">
                    {previous.map((item) => {
                      const itemMeta = NOTE_CATEGORY_META[item.category];
                      return (
                        <li key={item.id}>
                          <span
                            className="notes-timeline-dot"
                            style={{ background: itemMeta.border }}
                            aria-hidden
                          />
                          <div>
                            <div className="notes-timeline-meta">
                              <strong>{item.category}</strong>
                              <span>
                                {formatNoteDate(item.date)} · {formatNoteTime(item.time)}
                              </span>
                            </div>
                            <p>{item.content}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="notes-dialog-section notes-view-remarks">
                <h4 className="notes-dialog-section-title">Admin internal remarks</h4>
                <p className="notes-view-muted">
                  {note.adminRemarks || 'No internal remarks recorded for this note.'}
                </p>
              </section>
            </div>

            <footer className="notes-dialog-footer">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                Close
              </button>
              {note.isArchived ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  onClick={() => onRestore?.(note.id)}
                >
                  <Undo2 size={15} />
                  Restore to Inbox
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="ui-btn ui-btn-secondary"
                    onClick={() => onArchive(note.id)}
                  >
                    <Archive size={15} />
                    Archive
                  </button>
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => onMarkRead(note.id)}
                    disabled={note.isRead}
                  >
                    <CheckCheck size={15} />
                    {note.isRead ? 'Already Read' : 'Mark as Read'}
                  </button>
                </>
              )}
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
