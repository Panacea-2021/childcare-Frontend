'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

export type ActionItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onSelect: () => void;
};

type Props = {
  label: string;
  items: ActionItem[];
};

type MenuPos = { top: number; left: number; openUp: boolean };

const MENU_WIDTH = 210;
const MENU_MAX_HEIGHT = 320;

export function ActionsMenu({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<MenuPos>({ top: 0, left: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => setMounted(true), []);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const estimatedHeight = Math.min(MENU_MAX_HEIGHT, items.length * 42 + 20);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight + 12 && rect.top > spaceBelow;
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    );
    const top = openUp
      ? Math.max(8, rect.top - estimatedHeight - 8)
      : Math.min(rect.bottom + 8, window.innerHeight - 8);
    setPos({ top, left, openUp });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    // After paint, refine with real menu height
    const id = window.requestAnimationFrame(() => {
      const menu = menuRef.current;
      const trigger = triggerRef.current;
      if (!menu || !trigger) return;
      const tRect = trigger.getBoundingClientRect();
      const mRect = menu.getBoundingClientRect();
      const spaceBelow = window.innerHeight - tRect.bottom;
      const openUp = spaceBelow < mRect.height + 12 && tRect.top > spaceBelow;
      const left = Math.min(
        Math.max(8, tRect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8,
      );
      const top = openUp
        ? Math.max(8, tRect.top - mRect.height - 8)
        : Math.min(tRect.bottom + 8, window.innerHeight - mRect.height - 8);
      setPos({ top, left, openUp });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onReposition = () => updatePosition();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, items.length]);

  return (
    <div className="cd-actions">
      <button
        ref={triggerRef}
        type="button"
        className="cd-actions-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreHorizontal size={18} />
      </button>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.ul
                  ref={menuRef}
                  id={menuId}
                  role="menu"
                  className={`cd-actions-menu${pos.openUp ? ' is-up' : ''}`}
                  style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
                  initial={{ opacity: 0, y: pos.openUp ? 10 : -10, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: pos.openUp ? 8 : -8, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {items.map((item, index) => (
                    <motion.li
                      key={item.id}
                      role="none"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 + index * 0.028, duration: 0.2 }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className={`cd-actions-item${item.danger ? ' is-danger' : ''}`}
                        onClick={() => {
                          setOpen(false);
                          item.onSelect();
                        }}
                      >
                        <span aria-hidden>{item.icon}</span>
                        {item.label}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
