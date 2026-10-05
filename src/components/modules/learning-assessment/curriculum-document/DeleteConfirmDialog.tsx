'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { DeleteTarget } from './types';

type Props = {
  open: boolean;
  target: DeleteTarget | null;
  hasChildren?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteConfirmDialog({ open, target, hasChildren, onClose, onConfirm }: Props) {
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

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) return null;

  const isFolder = target?.kind === 'folder';
  const name = target?.item.name ?? '';

  return createPortal(
    <AnimatePresence>
      {open && target ? (
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
              className="sc-confirm-icon"
              aria-hidden
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <AlertTriangle size={32} />
            </motion.div>
            <h2 id={titleId}>{isFolder ? 'Delete Folder?' : 'Delete Document?'}</h2>
            <p>
              {isFolder ? (
                hasChildren ? (
                  <>
                    This folder contains subfolders/documents. Are you sure you want to delete{' '}
                    <strong>{name}</strong>?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete folder <strong>{name}</strong>?
                  </>
                )
              ) : (
                <>
                  Delete this document? <strong>{name}</strong> will be permanently removed.
                </>
              )}
            </p>
            <div className="sc-confirm-actions">
              <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="sc-btn-delete" onClick={confirm} disabled={busy}>
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
