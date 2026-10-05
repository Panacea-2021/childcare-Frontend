'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import './searchable-select.css';

export type SearchableOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[] | string[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
};

function normalizeOptions(options: SearchableOption[] | string[]): SearchableOption[] {
  return options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  searchable = true,
  disabled = false,
  ariaLabel,
  id,
}: Props) {
  const autoId = useId();
  const listId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const selected = normalized.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return normalized;
    return normalized.filter((o) => o.label.toLowerCase().includes(query));
  }, [normalized, q]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const width = Math.max(rect.width, 220);
      const left = Math.min(rect.left, window.innerWidth - width - 8);
      setPos({
        top: rect.bottom + 8,
        left: Math.max(8, left),
        width,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
      setQ('');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQ('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const menu =
    open && mounted && pos ? (
      <div
        ref={menuRef}
        className="vp-dd-menu"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        id={listId}
        role="listbox"
        aria-label={ariaLabel ?? placeholder}
      >
        {searchable ? (
          <div className="vp-dd-search">
            <Search size={14} aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </div>
        ) : null}
        <div className="vp-dd-list">
          {filtered.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`vp-dd-item${isSelected ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQ('');
                }}
              >
                <span className="vp-dd-item-label">{opt.label}</span>
                {isSelected ? <Check size={15} className="vp-dd-check" aria-hidden /> : null}
              </button>
            );
          })}
          {!filtered.length ? <div className="vp-dd-empty">No matches</div> : null}
        </div>
      </div>
    ) : null;

  return (
    <div className="vp-dd" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`vp-dd-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? placeholder}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          if (open) setQ('');
        }}
      >
        <span className={selected ? '' : 'is-placeholder'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className="vp-dd-chevron" aria-hidden />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
