'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, List, Plus, Search, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TOUR_BASE } from '@/lib/appointments/types';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ACTIONS = [
  { id: 'new', label: 'New Appointment', href: `${TOUR_BASE}/new`, icon: Plus },
  { id: 'calendar', label: 'Go to Calendar View', href: `${TOUR_BASE}?view=calendar`, icon: CalendarPlus },
  { id: 'list', label: 'Go to List View', href: `${TOUR_BASE}?view=list`, icon: List },
  { id: 'settings', label: 'Calendar Settings', href: `${TOUR_BASE}/calendars`, icon: Settings2 },
];

export const CommandPalette = memo(function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ACTIONS;
    return ACTIONS.filter((a) => a.label.toLowerCase().includes(query));
  }, [q]);

  useEffect(() => {
    if (!open) {
      setQ('');
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(items.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter' && items[active]) {
        router.push(items[active].href);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, items, active, router]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="appt-cmd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="appt-cmd-panel"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="appt-cmd-input">
              <Search size={16} color="#94a3b8" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Search actions… (Ctrl+K)"
                aria-label="Command palette search"
              />
            </div>
            <ul className="appt-cmd-list">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`appt-cmd-item${idx === active ? ' is-active' : ''}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
              {!items.length ? (
                <li style={{ padding: 12, color: '#94a3b8', fontSize: 14 }}>No matches</li>
              ) : null}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
