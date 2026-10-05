'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, type LucideIcon } from 'lucide-react';

export type FilterOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  icon: LucideIcon;
  ariaLabel: string;
  searchable?: boolean;
};

export function StudentFilterSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  ariaLabel,
  searchable = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const width = Math.max(rect.width, 220);
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
      const menuHeight = Math.min(280, filtered.length * 42 + (searchable ? 52 : 16));
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
      const top = openUp ? rect.top - menuHeight - 6 : rect.bottom + 6;
      setPos({ top: Math.max(8, top), left, width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, filtered.length, searchable]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
      setQuery('');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const menu =
    open && mounted && pos ? (
      <motion.div
        ref={menuRef}
        className="pap-filter-menu is-portal"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        role="listbox"
        aria-label={ariaLabel}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {searchable ? (
          <label className="pap-filter-search">
            <Search size={14} aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              autoFocus
            />
          </label>
        ) : null}
        <ul className="pap-filter-list">
          {filtered.length === 0 ? (
            <li className="pap-filter-empty">No matches</li>
          ) : (
            filtered.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`pap-filter-item${active ? ' is-active' : ''}`}
                    onClick={() => {
                      onChange(opt.value);
                      close();
                    }}
                  >
                    <span>{opt.label}</span>
                    {active ? <Check size={14} strokeWidth={2.75} /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </motion.div>
    ) : null;

  return (
    <div className="pap-filter-dd" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`pap-filter-trigger${open ? ' is-open' : ''}${selected && value !== 'all' ? ' has-value' : ''}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pap-filter-ico" aria-hidden>
          <Icon size={15} />
        </span>
        <span className="pap-filter-label">{selected?.label ?? placeholder}</span>
        <ChevronDown size={15} className="pap-filter-chevron" aria-hidden />
      </button>
      {mounted ? createPortal(<AnimatePresence>{menu}</AnimatePresence>, document.body) : null}
    </div>
  );
}
