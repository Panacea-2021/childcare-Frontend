'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type NotesToastItem = {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info';
};

interface NotesToastProps {
  toasts: NotesToastItem[];
  onDismiss: (id: string) => void;
}

export function NotesToast({ toasts, onDismiss }: NotesToastProps) {
  return (
    <div className="notes-toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            className={`notes-toast notes-toast-${toast.type ?? 'success'}`}
            initial={{ opacity: 0, y: 16, x: 12 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28 }}
            onClick={() => onDismiss(toast.id)}
          >
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
