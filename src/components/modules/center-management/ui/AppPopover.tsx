'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useFloatingPosition, type FloatAlign } from './useFloatingPosition';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: FloatAlign;
  maxHeight?: number;
  minWidth?: number;
  className?: string;
};

export function AppPopover({
  open,
  onOpenChange,
  trigger,
  children,
  align = 'end',
  maxHeight = 360,
  minWidth = 280,
  className = '',
}: Props) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align,
    minWidth,
    maxHeight,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || contentRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [open, onOpenChange]);

  return (
    <div className={`cm-pop-anchor ${className}`} ref={triggerRef}>
      {trigger}
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className="cm-pop"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: Math.max(minWidth, pos.width),
                    maxHeight,
                  }}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  role="dialog"
                >
                  {children}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

/** Controlled popover that manages open state internally via trigger click */
export function AppPopoverButton({
  trigger,
  children,
  align = 'end',
  maxHeight = 360,
  minWidth = 280,
}: Omit<Props, 'open' | 'onOpenChange'> & { trigger: (open: boolean, toggle: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AppPopover
      open={open}
      onOpenChange={setOpen}
      align={align}
      maxHeight={maxHeight}
      minWidth={minWidth}
      trigger={trigger(open, () => setOpen((v) => !v))}
    >
      {children}
    </AppPopover>
  );
}
