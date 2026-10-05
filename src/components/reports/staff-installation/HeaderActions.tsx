'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, MoreHorizontal, RefreshCw } from 'lucide-react';

type Props = {
  onExportExcel: () => void;
  onRefresh: () => void;
};

export function HeaderActions({ onExportExcel, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);

  const toggle = () => {
    const el = triggerRef.current;
    if (!el) return;
    if (open) {
      close();
      return;
    }
    const rect = el.getBoundingClientRect();
    const width = 180;
    setPos({
      top: rect.bottom + 8,
      left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8),
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const onDismiss = () => close();

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onDismiss);
    window.addEventListener('scroll', onDismiss, true);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onDismiss);
      window.removeEventListener('scroll', onDismiss, true);
    };
  }, [open]);

  return (
    <div className="sai-header-actions">
      <button type="button" className="ui-btn ui-btn-primary" onClick={onExportExcel}>
        <Download size={16} style={{ marginRight: 8 }} />
        Export Excel
      </button>

      <div className="sai-overflow">
        <button
          type="button"
          ref={triggerRef}
          className="pai-icon-btn pai-icon-btn-lg"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
        >
          <MoreHorizontal size={18} />
        </button>

        {typeof document !== 'undefined'
          ? createPortal(
              <AnimatePresence>
                {open && pos ? (
                  <motion.div
                    ref={menuRef}
                    className="sai-overflow-menu"
                    role="menu"
                    aria-label="Report actions"
                    style={{ top: pos.top, left: pos.left }}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        close();
                        onRefresh();
                      }}
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}
