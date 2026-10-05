'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { extractYoutubeId, formatLessonDate } from './store';
import type { Lesson } from './types';

type Props = {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onEdit?: () => void;
};

export function LessonViewModal({ open, lesson, onClose, onEdit }: Props) {
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

  const ytId = lesson ? extractYoutubeId(lesson.youtubeUrl) : null;
  const duration =
    lesson?.duration === 'Custom' || lesson?.customDuration
      ? lesson.customDuration || lesson.duration
      : lesson?.duration;

  return createPortal(
    <AnimatePresence>
      {open && lesson ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog les-dialog"
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
                  <h2 id={titleId}>{lesson.title}</h2>
                  <p>
                    {lesson.lessonSet} · {lesson.roomName} · {lesson.ageBand}
                  </p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <div className="les-view-meta">
                <span className={`les-status les-status-${lesson.status.toLowerCase()}`}>
                  {lesson.status}
                </span>
                <span>Duration: {duration}</span>
                <span>Created by {lesson.createdBy}</span>
                <span>{formatLessonDate(lesson.createdAt)}</span>
              </div>

              {lesson.developmentAreas.length > 0 ? (
                <div className="les-view-chips">
                  {lesson.developmentAreas.map((a) => (
                    <span key={a} className="les-chip">
                      {a}
                    </span>
                  ))}
                </div>
              ) : null}

              {lesson.labels.length > 0 ? (
                <div className="les-view-chips">
                  {lesson.labels.map((l) => (
                    <span key={l.id} className="les-chip">
                      <i className="les-color-dot" style={{ background: l.color }} aria-hidden />
                      {l.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <article
                className="les-view-body"
                dangerouslySetInnerHTML={{
                  __html: lesson.descriptionHtml || '<p>No description provided.</p>',
                }}
              />

              {ytId ? (
                <div className="les-yt-preview">
                  <iframe
                    title="YouTube video"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              {lesson.attachments.length > 0 ? (
                <ul className="les-upload-list">
                  {lesson.attachments.map((a) => (
                    <li key={a.id} className="les-upload-item">
                      <div className="les-upload-meta">
                        <strong>{a.name}</strong>
                        <span>
                          {a.type} · {a.size}
                        </span>
                      </div>
                      <a href={a.url} download={a.name} className="les-icon-btn" aria-label={`Download ${a.name}`}>
                        <Download size={15} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Close
              </button>
              {onEdit ? (
                <button type="button" className="cal-btn-save" onClick={onEdit}>
                  <span className="cal-btn-save-shine" aria-hidden />
                  Edit Lesson
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
