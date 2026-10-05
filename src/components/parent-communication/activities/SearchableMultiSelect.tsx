'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export type SearchableOption = {
  id: string;
  label: string;
  meta?: string;
};

type Props = {
  label: string;
  placeholder: string;
  options: SearchableOption[];
  values: string[];
  onChange: (next: string[]) => void;
  emptyText?: string;
};

export function SearchableMultiSelect({
  label,
  placeholder,
  options,
  values,
  onChange,
  emptyText = 'No matches',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.meta ?? '').toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = useMemo(
    () => options.filter((o) => values.includes(o.id)),
    [options, values],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = (id: string) => {
    if (values.includes(id)) onChange(values.filter((v) => v !== id));
    else onChange([...values, id]);
  };

  return (
    <div className="pap-dd ui-field" ref={rootRef}>
      <span className="ui-label">{label}</span>
      <button
        type="button"
        className={`pap-dd-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="pap-dd-trigger-copy">
          {selected.length === 0 ? (
            <em>{placeholder}</em>
          ) : (
            <strong>
              {selected.length === 1
                ? selected[0].label
                : `${selected.length} selected`}
            </strong>
          )}
        </span>
        <ChevronDown size={16} />
      </button>

      {selected.length > 0 ? (
        <div className="pap-dd-chips">
          {selected.map((s) => (
            <span key={s.id} className="pap-dd-chip">
              {s.label}
              <button
                type="button"
                aria-label={`Remove ${s.label}`}
                onClick={() => toggle(s.id)}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="pap-dd-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <label className="pap-dd-search">
              <Search size={14} aria-hidden />
              <input
                className="ui-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoFocus
              />
            </label>
            <ul className="pap-dd-list" role="listbox">
              {filtered.length === 0 ? (
                <li className="pap-dd-empty">{emptyText}</li>
              ) : (
                filtered.map((opt, i) => {
                  const active = values.includes(opt.id);
                  return (
                    <motion.li key={opt.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`pap-dd-item${active ? ' is-active' : ''}`}
                        onClick={() => toggle(opt.id)}
                        style={{ animationDelay: `${i * 18}ms` }}
                      >
                        <span>
                          <strong>{opt.label}</strong>
                          {opt.meta ? <em>{opt.meta}</em> : null}
                        </span>
                        {active ? <Check size={15} strokeWidth={2.6} /> : null}
                      </button>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
