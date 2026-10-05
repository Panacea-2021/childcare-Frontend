'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  Pencil,
  Copy,
  Download,
  Printer,
  MessageCircle,
  Mail,
  Send,
  Trash2,
  PlusCircle,
} from 'lucide-react';

export type RowAction =
  | 'view'
  | 'edit'
  | 'add_activity'
  | 'duplicate'
  | 'download'
  | 'print'
  | 'whatsapp'
  | 'email'
  | 'app'
  | 'delete';

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAction: (action: RowAction) => void;
};

const ITEMS: Array<{ id: RowAction; label: string; icon: typeof Eye; danger?: boolean }> = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'add_activity', label: 'Add Activity', icon: PlusCircle },
  { id: 'duplicate', label: 'Duplicate', icon: Copy },
  { id: 'download', label: 'Download', icon: Download },
  { id: 'print', label: 'Print', icon: Printer },
  { id: 'whatsapp', label: 'Send WhatsApp', icon: MessageCircle },
  { id: 'email', label: 'Send Email', icon: Mail },
  { id: 'app', label: 'Send App Notification', icon: Send },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

const MENU_WIDTH = 228;
const GAP = 8;
const EDGE = 12;

export function ActionMenu({ open, anchorEl, onClose, onAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return;
    }

    const place = () => {
      const r = anchorEl.getBoundingClientRect();
      const menuEl = ref.current;
      const menuHeight = menuEl?.offsetHeight || Math.min(420, window.innerHeight - EDGE * 2);
      const menuWidth = menuEl?.offsetWidth || MENU_WIDTH;

      let left = r.right - menuWidth;
      left = Math.min(Math.max(EDGE, left), window.innerWidth - menuWidth - EDGE);

      const spaceBelow = window.innerHeight - r.bottom - EDGE;
      const spaceAbove = r.top - EDGE;
      let top: number;

      if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
        top = Math.min(r.bottom + GAP, window.innerHeight - menuHeight - EDGE);
      } else {
        top = Math.max(EDGE, r.top - menuHeight - GAP);
      }

      setPos({ top, left });
    };

    place();
    // Re-measure after paint so we use real menu height
    const raf = requestAnimationFrame(place);

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl.contains(t)) return;
      onClose();
    };

    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDoc);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, anchorEl, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          className="dr-menu dr-menu-portal"
          style={
            pos
              ? { top: pos.top, left: pos.left, visibility: 'visible' }
              : { top: 0, left: 0, visibility: 'hidden' }
          }
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          role="menu"
        >
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const showDivider = item.danger && i > 0;
            return (
              <div key={item.id}>
                {showDivider ? <div className="dr-menu-divider" aria-hidden /> : null}
                <button
                  type="button"
                  className={item.danger ? 'danger' : undefined}
                  role="menuitem"
                  onClick={() => {
                    onAction(item.id);
                    onClose();
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              </div>
            );
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
