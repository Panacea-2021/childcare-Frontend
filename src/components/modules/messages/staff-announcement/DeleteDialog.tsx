'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { Announcement } from './types';

type Props = {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteDialog({ open, announcement, onClose, onConfirm }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const confirm = () => {
    if (busy) return;
    setBusy(true);
    onConfirm();
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && announcement ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog sc-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cal-dialog-close sc-confirm-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
            <motion.div
              className="sa-confirm-icon"
              aria-hidden
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <AlertTriangle size={30} />
            </motion.div>
            <h2 id={titleId}>Delete Announcement?</h2>
            <p>
              Are you sure you want to delete <strong>{announcement.title}</strong>? This action cannot be
              undone.
            </p>
            <div className="sc-confirm-actions" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-danger" onClick={confirm} disabled={busy}>
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
