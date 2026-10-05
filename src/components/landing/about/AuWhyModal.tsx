'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { auEase } from './motion';

export type WhyModalPayload = {
  id: string;
  title: string;
  description: string;
  modalBody: string;
  modalPoints: readonly string[];
  theme: 'mint' | 'pink' | 'yellow';
  logos?: readonly string[];
};

type Props = {
  open: boolean;
  item: WhyModalPayload | null;
  onClose: () => void;
  visual: ReactNode;
};

export function AuWhyModal({ open, item, onClose, visual }: Props) {
  const reduced = usePrefersReducedMotion();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => panelRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduced || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rx: py * -2, ry: px * 3 });
    },
    [reduced],
  );

  const onLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="au-modalRoot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            className="au-modalBackdrop"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`au-modalPanel au-modalPanel--${item.theme}`}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
              transformStyle: 'preserve-3d',
              perspective: 1200,
              rotateX: reduced ? 0 : tilt.rx,
              rotateY: reduced ? 0 : tilt.ry,
            }}
            initial={
              reduced
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.92, rotateX: 5 }
            }
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.35, ease: auEase }}
          >
            <button
              type="button"
              className="au-modalClose"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <div className="au-modalVisual">{visual}</div>
            <div className="au-modalBody">
              <h3 id={titleId}>{item.title}</h3>
              <p>{item.modalBody}</p>
              <ul>
                {item.modalPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
