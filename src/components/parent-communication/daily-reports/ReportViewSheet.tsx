'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Circle, ClipboardList, Layers, MessageCircle, Pencil, X } from 'lucide-react';
import type { ChecklistItemDef, RoomDailyReport } from '@/types/dailyReport';
import { StatusBadge } from './StatusBadge';
import { formatDateLabel, getEntry, roomChecklistColumns } from './utils';

type Props = {
  open: boolean;
  report: RoomDailyReport | null;
  checklist: ChecklistItemDef[];
  onClose: () => void;
  onEdit: () => void;
  onSendWhatsApp: () => void;
};

export function ReportViewSheet({
  open,
  report,
  checklist,
  onClose,
  onEdit,
  onSendWhatsApp,
}: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const columns = report ? roomChecklistColumns(checklist, report) : [];

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
    <AnimatePresence>
      {open && report ? (
        <motion.div
          className="cal-dialog-backdrop dr-sheet-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="dr-view-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  🏫
                </span>
                <div>
                  <h2 id={titleId}>{report.room}</h2>
                  <p>Daily report · {formatDateLabel(report.date)}</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <motion.section className="cal-form-section">
                <header className="cal-form-section-head">
                  <span className="cal-form-section-ico" aria-hidden>
                    <Layers size={15} />
                  </span>
                  <h3>Room Summary</h3>
                </header>
                <div className="cal-form-section-body">
                  <div className="dr-drawer-meta">
                    <div className="dr-meta-chip">
                      <span>Room</span>
                      <strong>{report.room}</strong>
                    </div>
                    <div className="dr-meta-chip">
                      <span>Attendance</span>
                      <strong>
                        {report.presentCount}/{report.studentCount}
                      </strong>
                    </div>
                    <div className="dr-meta-chip">
                      <span>Completion</span>
                      <strong>{report.completionPercent}%</strong>
                    </div>
                    <div className="dr-meta-chip">
                      <span>Status</span>
                      <strong>
                        <StatusBadge status={report.status} />
                      </strong>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section className="cal-form-section">
                <header className="cal-form-section-head">
                  <span className="cal-form-section-ico" aria-hidden>
                    <ClipboardList size={15} />
                  </span>
                  <h3>Activity Timeline</h3>
                </header>
                <div className="cal-form-section-body">
                  <div className="dr-timeline">
                    {columns.map((col) => {
                      const entry = getEntry(report, col.id);
                      const done = Boolean(entry?.completed);
                      return (
                        <div key={col.id} className="dr-timeline-item">
                          <div className={`dr-timeline-dot${done ? ' is-done' : ''}`}>
                            {done ? <Check size={14} strokeWidth={3} /> : <Circle size={12} />}
                          </div>
                          <div className="dr-timeline-card">
                            <h4>{col.name}</h4>
                            <p>
                              {done
                                ? entry?.remarks || 'Completed successfully.'
                                : 'Pending — not recorded yet.'}
                            </p>
                            <div className="dr-timeline-row">
                              <span>Status: {done ? 'Completed' : 'Pending'}</span>
                              {entry?.completedAt ? <span>Time: {entry.completedAt}</span> : null}
                              {entry?.completedBy ? <span>By: {entry.completedBy}</span> : null}
                            </div>
                            {entry?.incident ? (
                              <div className="dr-incident-box" style={{ marginTop: 10 }}>
                                <strong>
                                  {entry.incident.type} · {entry.incident.severity.toUpperCase()}
                                </strong>
                                <p style={{ margin: 0 }}>{entry.incident.description}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {report.overallNotes ? (
                    <div className="dr-timeline-card" style={{ marginTop: 12 }}>
                      <h4>Overall Notes</h4>
                      <p>{report.overallNotes}</p>
                    </div>
                  ) : null}
                </div>
              </motion.section>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Close
              </button>
              <button type="button" className="cal-btn-ghost" onClick={onEdit}>
                <Pencil size={15} />
                Edit
              </button>
              <button type="button" className="cal-btn-save" onClick={onSendWhatsApp}>
                <span className="cal-btn-save-shine" aria-hidden />
                <MessageCircle size={15} />
                Send WhatsApp
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
