'use client';

import {
  memo,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  node?: ReactNode;
};

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
};

export const SearchableSelect = memo(function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchable = false,
  error,
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

  const selected = options.find((o) => o.value === value);
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
      const width = Math.max(r.width, 220);
      const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
      const below = window.innerHeight - r.bottom;
      const top = below > 260 || below > r.top ? r.bottom + 8 : Math.max(12, r.top - 8 - 280);
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
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={listRef}
            className="enq-select-menu"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            role="listbox"
            aria-labelledby={fieldId}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {searchable ? (
              <div className="enq-select-search">
                <Search size={14} aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search options"
                />
              </div>
            ) : null}
            <div className="enq-select-scroll">
              {filtered.length === 0 ? (
                <div className="enq-select-empty">No matches</div>
              ) : (
                filtered.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`enq-select-option${active ? ' is-selected' : ''}`}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span className="enq-select-value">{opt.node ?? opt.label}</span>
                      {active ? <Check size={15} aria-hidden /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className="enq-select" ref={wrapRef}>
      <button
        id={fieldId}
        type="button"
        className={`enq-select-trigger${open ? ' is-open' : ''}${error ? ' is-error' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="enq-select-value">
          {selected ? (
            selected.node ?? selected.label
          ) : (
            <span className="enq-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {menu}
      {error ? <p className="enq-error">{error}</p> : null}
    </div>
  );
});
