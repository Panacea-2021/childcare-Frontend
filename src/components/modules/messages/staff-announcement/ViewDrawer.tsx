'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Link2,
  Mail,
  MessageSquare,
  Paperclip,
  Smartphone,
  Users,
  X,
} from 'lucide-react';
import type { Announcement } from './types';
import { roomOptions, staffOptions } from './mockData';
import { formatDisplayDate, formatDisplayTime, formatFileSize } from './utils';

type Props = {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onEdit: () => void;
};

const METHOD_LABEL = {
  email: { label: 'Email', Icon: Mail },
  whatsapp: { label: 'WhatsApp', Icon: MessageSquare },
  sms: { label: 'SMS', Icon: Smartphone },
} as const;

export function ViewDrawer({ open, announcement: a, onClose, onEdit }: Props) {
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

  const room = a ? roomOptions.find((r) => r.id === a.roomId) : undefined;
  const staff = a
    ? a.staffIds.map((id) => staffOptions.find((s) => s.id === id)).filter(Boolean)
    : [];

  return createPortal(
    <AnimatePresence>
      {open && a ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog sa-view-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: '42%', scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: '28%', scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  📣
                </span>
                <div>
                  <h2 id={titleId}>Announcement Details</h2>
                  <p>Full announcement record</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <div className="sa-timeline">
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Title</h4>
                  <p>{a.title}</p>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Date & Time</h4>
                  <p>
                    <CalendarDays size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                    {formatDisplayDate(a.date)}
                    <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
                    <Clock3 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                    {formatDisplayTime(a.time)}
                  </p>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Mode</h4>
                  <p>
                    {a.mode === 'staff' ? (
                      <>
                        <Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                        Staff
                      </>
                    ) : (
                      <>
                        <Building2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                        Room — {room?.name ?? '—'}
                      </>
                    )}
                  </p>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Recipients</h4>
                  {a.mode === 'staff' ? (
                    <div className="sa-chips" style={{ marginTop: 6 }}>
                      {staff.map((s) =>
                        s ? (
                          <span key={s.id} className="sa-chip">
                            <span className="sa-chip-avatar">{s.avatar}</span>
                            {s.name}
                          </span>
                        ) : null,
                      )}
                    </div>
                  ) : (
                    <p>
                      All staff in {room?.name ?? 'room'} ({room?.staffCount ?? 0} members)
                      {room ? (
                        <>
                          <br />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {room.department} · {room.floor}
                          </span>
                        </>
                      ) : null}
                    </p>
                  )}
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Communication Method</h4>
                  <div className="sa-methods" style={{ marginTop: 6 }}>
                    {a.methods.map((m) => {
                      const meta = METHOD_LABEL[m];
                      const Icon = meta.Icon;
                      return (
                        <span key={m} className={`sa-method-pill ${m}`}>
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Note</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{a.note}</p>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Attachments</h4>
                  {a.attachments.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No attachments</p>
                  ) : (
                    <div className="sa-files">
                      {a.attachments.map((f) => (
                        <div key={f.id} className="sa-file-card">
                          <span className="sa-file-ico" aria-hidden>
                            <Paperclip size={16} />
                          </span>
                          <div className="sa-file-meta">
                            <strong>{f.name}</strong>
                            <span>{formatFileSize(f.size)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Reference Link</h4>
                  {a.referenceLink ? (
                    <p>
                      <Link2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                      <a href={a.referenceLink} target="_blank" rel="noreferrer">
                        {a.referenceLink}
                      </a>
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No reference link</p>
                  )}
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Delivery Status</h4>
                  <p>
                    <span className={`sa-status ${a.status}`}>
                      <span className="sa-status-dot" aria-hidden />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                    <span style={{ marginLeft: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Created by {a.createdBy}
                    </span>
                  </p>
                </div>
                <div className="sa-tl-item">
                  <span className="sa-tl-dot" aria-hidden />
                  <h4>Summary</h4>
                  <p>
                    <FileText size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                    Full announcement record ready for staff delivery channels.
                  </p>
                </div>
              </div>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Close
              </button>
              <button type="button" className="cal-btn-save" onClick={onEdit}>
                <span className="cal-btn-save-shine" aria-hidden />
                Edit
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
