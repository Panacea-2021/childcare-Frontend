'use client';

import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Columns3, Search } from 'lucide-react';
import type { ListColumnKey } from './types';
import { dropdownMotion, interactiveBtn } from './animations';

export const ENQUIRY_LIST_COLUMNS: {
  key: ListColumnKey;
  label: string;
  always?: boolean;
}[] = [
  { key: 'student', label: 'Student', always: true },
  { key: 'stage', label: 'Stage' },
  { key: 'source', label: 'Source' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'program', label: 'Program' },
  { key: 'expectedStart', label: 'Expected Start Date' },
  { key: 'parentContact', label: 'Parent Contact' },
  { key: 'createdOn', label: 'Created Date' },
  { key: 'actions', label: 'Actions', always: true },
];

export const DEFAULT_VISIBLE_COLUMNS: Record<ListColumnKey, boolean> = {
  student: true,
  stage: true,
  source: true,
  assignedTo: true,
  program: true,
  expectedStart: true,
  parentContact: true,
  createdOn: true,
  actions: true,
};

type Props = {
  visible: Record<ListColumnKey, boolean>;
  onChange: (next: Record<ListColumnKey, boolean>) => void;
  disabled?: boolean;
};

export const ColumnsDropdown = memo(function ColumnsDropdown({
  visible,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const toggleable = useMemo(
    () => ENQUIRY_LIST_COLUMNS.filter((c) => !c.always),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toggleable;
    return toggleable.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, toggleable]);

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

  const selectAll = () => {
    const next = { ...visible };
    for (const col of toggleable) next[col.key] = true;
    onChange(next);
  };

  const clearAll = () => {
    const next = { ...visible };
    for (const col of toggleable) next[col.key] = false;
    onChange(next);
  };

  return (
    <div className="enq-cols-menu" ref={rootRef}>
      <motion.button
        type="button"
        className="ui-btn ui-btn-outline enq-interactive-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        {...interactiveBtn}
      >
        <Columns3 size={15} aria-hidden />
        Columns
        <motion.span
          className="enq-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <ChevronDown size={14} aria-hidden />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            className="enq-cols-dropdown"
            {...dropdownMotion}
          >
            <label className="enq-cols-search">
              <Search size={14} aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search columns…"
                aria-label="Search columns"
              />
            </label>
            <div className="enq-cols-bulk">
              <button type="button" className="enq-cols-bulk-btn" onClick={selectAll}>
                Select All
              </button>
              <button type="button" className="enq-cols-bulk-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>
            {filtered.map((col) => (
              <label key={col.key} className="enq-cols-item">
                <input
                  type="checkbox"
                  checked={visible[col.key]}
                  onChange={() =>
                    onChange({ ...visible, [col.key]: !visible[col.key] })
                  }
                />
                {col.label}
              </label>
            ))}
            {!filtered.length ? (
              <p className="enq-cols-empty">No columns match.</p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
