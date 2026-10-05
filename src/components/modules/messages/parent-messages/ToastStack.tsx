'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ToastItem } from './types';

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="pm-toasts" aria-live="polite" aria-relevant="additions">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`pm-toast ${t.type}`}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.28 }}
            role="status"
            onClick={() => onDismiss(t.id)}
          >
            <strong>{t.title}</strong>
            <p>{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
