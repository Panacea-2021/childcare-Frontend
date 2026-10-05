'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Layers,
  Moon,
  Pencil,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { ScheduleShift, ScheduleStaff } from './types';
import { formatHoursMinutes, toDisplayTime } from './mockData';

type Props = {
  open: boolean;
  shift: ScheduleShift | null;
  staff: ScheduleStaff[];
  onClose: () => void;
  onEdit: (shift: ScheduleShift) => void;
  onDelete: (shiftId: string) => void;
};

function ShiftTypeIcon({ type }: { type: ScheduleShift['shiftType'] }) {
  if (type === 'morning') return <Sun size={22} aria-hidden />;
  if (type === 'afternoon') return <Clock3 size={22} aria-hidden />;
  return <Moon size={22} aria-hidden />;
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
  },
};

export function ShiftDetailModal({ open, shift, staff, onClose, onEdit, onDelete }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setConfirmDelete(false);
      setDeleting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) setConfirmDelete(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, confirmDelete]);

  if (!mounted) return null;

  const person = shift ? staff.find((s) => s.id === shift.staffId) : null;
  const typeLabel = shift
    ? shift.shiftType === 'morning'
      ? 'Morning'
      : shift.shiftType === 'afternoon'
        ? 'Afternoon'
        : 'Evening'
    : '';

  const handleDelete = async () => {
    if (!shift) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 280));
    onDelete(shift.id);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && shift ? (
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
            className={`cal-dialog cal-shift-detail cal-shift-detail--${shift.shiftType}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cal-shift-detail-orb a" aria-hidden />
            <div className="cal-shift-detail-orb b" aria-hidden />

            <header className="cal-dialog-header cal-shift-detail-header">
              <div className="cal-dialog-title-block">
                <motion.span
                  className={`cal-shift-detail-hero-ico cal-shift-detail-hero-ico--${shift.shiftType}`}
                  aria-hidden
                  initial={reduce ? false : { scale: 0.6, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.08 }}
                >
                  <ShiftTypeIcon type={shift.shiftType} />
                  {!reduce ? (
                    <motion.span
                      className="cal-shift-detail-spark"
                      animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles size={12} />
                    </motion.span>
                  ) : null}
                </motion.span>
                <div>
                  <h2 id={titleId}>{shift.title}</h2>
                  <p>
                    {typeLabel} shift · {formatHoursMinutes(shift.startTime, shift.endTime)}
                  </p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <motion.div
                className="cal-shift-detail-preview"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className={`cal-shift cal-shift-${shift.shiftType} cal-shift-detail-card`}>
                  <div className="cal-shift-top">
                    <ShiftTypeIcon type={shift.shiftType} />
                    <span>{shift.title}</span>
                  </div>
                  <div className="cal-shift-time">
                    {toDisplayTime(shift.startTime)} – {toDisplayTime(shift.endTime)}
                  </div>
                  <div className="cal-shift-room">
                    <BookOpen size={10} aria-hidden /> {shift.lesson}
                  </div>
                  <div className="cal-shift-room">{shift.room}</div>
                  <div className="cal-shift-foot">
                    <span className={`cal-shift-status ${shift.status}`}>{shift.status}</span>
                    <span className="cal-shift-dur">
                      {formatHoursMinutes(shift.startTime, shift.endTime)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="cal-shift-detail-grid"
                variants={reduce ? undefined : stagger}
                initial={reduce ? false : 'hidden'}
                animate="show"
              >
                <motion.div className="cal-shift-detail-item" variants={reduce ? undefined : item}>
                  <span className="cal-shift-detail-item-ico" aria-hidden>
                    <UserRound size={16} />
                  </span>
                  <div>
                    <span className="cal-shift-detail-label">Staff</span>
                    <span className="cal-shift-detail-value">
                      {person ? `${person.name} · ${person.role}` : '—'}
                    </span>
                  </div>
                </motion.div>

                <motion.div className="cal-shift-detail-item" variants={reduce ? undefined : item}>
                  <span className="cal-shift-detail-item-ico" aria-hidden>
                    <CalendarDays size={16} />
                  </span>
                  <div>
                    <span className="cal-shift-detail-label">Date</span>
                    <span className="cal-shift-detail-value">{formatDisplayDate(shift.date)}</span>
                  </div>
                </motion.div>

                <motion.div className="cal-shift-detail-item" variants={reduce ? undefined : item}>
                  <span className="cal-shift-detail-item-ico" aria-hidden>
                    <Clock3 size={16} />
                  </span>
                  <div>
                    <span className="cal-shift-detail-label">Time</span>
                    <span className="cal-shift-detail-value">
                      {toDisplayTime(shift.startTime)} – {toDisplayTime(shift.endTime)}
                    </span>
                  </div>
                </motion.div>

                <motion.div className="cal-shift-detail-item" variants={reduce ? undefined : item}>
                  <span className="cal-shift-detail-item-ico" aria-hidden>
                    <Layers size={16} />
                  </span>
                  <div>
                    <span className="cal-shift-detail-label">Room & category</span>
                    <span className="cal-shift-detail-value">
                      {shift.room} · {shift.category}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="cal-shift-detail-item cal-shift-detail-item--wide"
                  variants={reduce ? undefined : item}
                >
                  <span className="cal-shift-detail-item-ico" aria-hidden>
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <span className="cal-shift-detail-label">Lesson</span>
                    <span className="cal-shift-detail-value">{shift.lesson}</span>
                  </div>
                </motion.div>

                {shift.notes ? (
                  <motion.div
                    className="cal-shift-detail-item cal-shift-detail-item--wide"
                    variants={reduce ? undefined : item}
                  >
                    <span className="cal-shift-detail-item-ico" aria-hidden>
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <span className="cal-shift-detail-label">Notes</span>
                      <span className="cal-shift-detail-value">{shift.notes}</span>
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>

              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  <motion.div
                    key="confirm"
                    className="cal-shift-detail-confirm"
                    role="alertdialog"
                    aria-label="Confirm delete schedule"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  >
                    <div className="cal-shift-detail-confirm-copy">
                      <Trash2 size={18} aria-hidden />
                      <div>
                        <strong>Delete this schedule?</strong>
                        <p>This removes “{shift.title}” from the board. You can’t undo this.</p>
                      </div>
                    </div>
                    <div className="cal-shift-detail-confirm-actions">
                      <button
                        type="button"
                        className="cal-btn-ghost"
                        onClick={() => setConfirmDelete(false)}
                        disabled={deleting}
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        className="cal-btn-danger"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <footer className="cal-dialog-footer cal-shift-detail-footer">
              <button
                type="button"
                className="cal-btn-ghost cal-btn-danger-outline"
                onClick={() => setConfirmDelete(true)}
                disabled={confirmDelete}
              >
                <Trash2 size={16} aria-hidden />
                Delete
              </button>
              <div className="cal-shift-detail-footer-right">
                <button type="button" className="cal-btn-ghost" onClick={onClose}>
                  Close
                </button>
                <motion.button
                  type="button"
                  className="cal-btn-save"
                  whileHover={reduce ? undefined : { scale: 1.03 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onEdit(shift);
                  }}
                >
                  <span className="cal-btn-save-shine" aria-hidden />
                  <Pencil size={16} aria-hidden />
                  Edit Schedule
                </motion.button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
