'use client';

import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
};

export function AppTooltip({ content, children, side = 'top' }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = side === 'top' ? r.top - 8 : r.bottom + 8;
    setCoords({ top, left: r.left + r.width / 2 });
    setOpen(true);
  };

  return (
    <span
      ref={ref}
      className="cm-tip-wrap"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
    >
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.span
                  className={`cm-tip cm-tip-${side}`}
                  style={{ top: coords.top, left: coords.left }}
                  initial={{ opacity: 0, scale: 0.96, y: side === 'top' ? 4 : -4 }}
                  animate={{ opacity: 1, scale: 1, y: side === 'top' ? -6 : 6 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  role="tooltip"
                >
                  {content}
                </motion.span>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </span>
  );
}
