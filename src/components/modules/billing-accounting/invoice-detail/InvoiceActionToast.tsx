'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type InvoiceToastPayload = {
  type: 'success' | 'error' | 'info';
  title: string;
  detail?: string;
  emails?: string[];
};

type Props = {
  toast: InvoiceToastPayload | null;
  onClose: () => void;
  durationMs?: number;
};

export function InvoiceActionToast({ toast, onClose, durationMs = 3200 }: Props) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [toast, durationMs, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={`${toast.type}-${toast.title}`}
          className={`ivd-toast-card is-${toast.type}`}
          role="status"
          initial={{ opacity: 0, y: -20, scale: 0.94, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, scale: 0.96, filter: 'blur(4px)' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ivd-toast-glow" aria-hidden />
          <span className="ivd-toast-icon" aria-hidden>
            {toast.type === 'success' ? (
              <CheckCircle2 size={22} strokeWidth={2.4} />
            ) : toast.type === 'error' ? (
              <AlertTriangle size={22} strokeWidth={2.4} />
            ) : (
              <Info size={22} strokeWidth={2.4} />
            )}
          </span>
          <div className="ivd-toast-body">
            <strong>{toast.title}</strong>
            {toast.detail ? <p>{toast.detail}</p> : null}
            {toast.emails?.length ? (
              <div className="ivd-toast-chips">
                {toast.emails.map((email) => (
                  <span key={email} className="ivd-toast-chip">
                    {email}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="ivd-toast-close" onClick={onClose} aria-label="Dismiss">
            <X size={14} />
          </button>
          <span className="ivd-toast-progress" aria-hidden />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
