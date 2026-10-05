'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';

export type MultiOption = { value: string; label: string; color?: string };

type Props = {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiOption[];
  placeholder: string;
  icon?: ReactNode;
  error?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
};

export function MultiSelect({
  id,
  values,
  onChange,
  options,
  placeholder,
  icon,
  error,
  onAddNew,
  addNewLabel = '+ Add',
  disabled = false,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.filter((o) => values.includes(o.value));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    if (!el) return;
    const place = () => {
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 240);
      const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
      const below = window.innerHeight - r.bottom;
      const top = below > 280 || below > r.top ? r.bottom + 8 : Math.max(12, r.top - 8 - 300);
      setPos({ top, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
      setQuery('');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const toggle = (value: string) => {
    if (values.includes(value)) onChange(values.filter((v) => v !== value));
    else onChange([...values, value]);
  };

  const remove = (value: string) => onChange(values.filter((v) => v !== value));

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={listRef}
            className="cal-prem-menu les-multi-menu"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            role="listbox"
            aria-multiselectable
            aria-labelledby={fieldId}
          >
            <div className="cal-prem-search">
              <Search size={14} aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                aria-label="Search options"
              />
            </div>
            <div className="cal-prem-menu-scroll">
              {filtered.length === 0 ? (
                <div className="cal-prem-empty">No matches</div>
              ) : (
                filtered.map((o) => {
                  const on = values.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`cal-prem-option ${on ? 'is-selected' : ''}`}
                      onClick={() => toggle(o.value)}
                    >
                      <span className="les-multi-opt">
                        {o.color ? (
                          <i className="les-color-dot" style={{ background: o.color }} aria-hidden />
                        ) : null}
                        {o.label}
                      </span>
                      {on ? <Check size={14} /> : null}
                    </button>
                  );
                })
              )}
            </div>
            {onAddNew ? (
              <button
                type="button"
                className="les-multi-add"
                onClick={() => {
                  setOpen(false);
                  onAddNew();
                }}
              >
                <Plus size={14} />
                {addNewLabel}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className={`cal-prem-field ${error ? 'has-error' : ''}`} ref={wrapRef}>
      <div
        id={fieldId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        className={`cal-prem-trigger ${open ? 'is-open' : ''} ${values.length ? 'has-value' : ''} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {icon ? (
          <span className="cal-prem-ico" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="les-multi-chips">
          {selected.length === 0 ? (
            <span className="cal-prem-value is-placeholder">{placeholder}</span>
          ) : (
            selected.map((s) => (
              <span key={s.value} className="les-chip">
                {s.color ? (
                  <i className="les-color-dot" style={{ background: s.color }} aria-hidden />
                ) : null}
                {s.label}
                {!disabled ? (
                  <button
                    type="button"
                    className="les-chip-x"
                    aria-label={`Remove ${s.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(s.value);
                    }}
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </span>
            ))
          )}
        </div>
        <ChevronDown size={16} className={`cal-prem-chevron ${open ? 'is-open' : ''}`} aria-hidden />
      </div>
      {error ? <p className="cal-field-error">{error}</p> : null}
      {menu}
    </div>
  );
}
