'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Copy,
  Eye,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import type { CampaignStatus } from './types';

export type CampaignActionKey =
  | 'view'
  | 'edit'
  | 'duplicate'
  | 'pause'
  | 'resume'
  | 'delete';

type Props = {
  status: CampaignStatus;
  onAction: (action: CampaignActionKey) => void;
};

export function CampaignRowMenu({ status, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items: {
    key: CampaignActionKey;
    label: string;
    icon: React.ReactNode;
    danger?: boolean;
  }[] =
    status === 'Draft'
      ? [
          { key: 'edit', label: 'Edit Draft', icon: <Pencil size={15} /> },
          { key: 'duplicate', label: 'Duplicate', icon: <Copy size={15} /> },
          { key: 'delete', label: 'Delete', icon: <Trash2 size={15} />, danger: true },
        ]
      : status === 'Scheduled' || status === 'Paused'
        ? [
            { key: 'view', label: 'View', icon: <Eye size={15} /> },
            ...(status === 'Scheduled'
              ? [{ key: 'pause' as const, label: 'Pause', icon: <Pause size={15} /> }]
              : [{ key: 'resume' as const, label: 'Resume', icon: <Play size={15} /> }]),
            { key: 'duplicate', label: 'Duplicate', icon: <Copy size={15} /> },
            { key: 'delete', label: 'Delete', icon: <Trash2 size={15} />, danger: true },
          ]
        : status === 'Sent'
          ? [
              { key: 'view', label: 'View', icon: <Eye size={15} /> },
              { key: 'duplicate', label: 'Duplicate', icon: <Copy size={15} /> },
            ]
          : [
              { key: 'view', label: 'View', icon: <Eye size={15} /> },
              { key: 'duplicate', label: 'Duplicate', icon: <Copy size={15} /> },
              { key: 'delete', label: 'Delete', icon: <Trash2 size={15} />, danger: true },
            ];

  return (
    <div className="ec-row-actions" ref={rootRef}>
      <button
        type="button"
        className="ec-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Campaign actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            className="ec-menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
          >
            {items.map((item) => (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`ec-menu-item${item.danger ? ' is-danger' : ''}`}
                  onClick={() => {
                    setOpen(false);
                    onAction(item.key);
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
