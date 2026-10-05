'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import './searchable-select.css';

type Props = {
  id?: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** When false, only one option can be selected. Default true. */
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function MultiSelectDropdown({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  multiple = true,
  searchable = true,
  searchPlaceholder = 'Search…',
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, q]);

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
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
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

  const selectOption = (option: string) => {
    if (!multiple) {
      onChange(value.includes(option) ? [] : [option]);
      setOpen(false);
      setQ('');
      return;
    }
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
      return;
    }
    onChange([...value, option]);
  };

  if (disabled) {
    return (
      <input
        id={fieldId}
        className="ui-input"
        value={value.length ? value.join(', ') : '—'}
        disabled
        readOnly
      />
    );
  }

  const summary =
    value.length === 0
      ? placeholder
      : multiple
        ? value.length === 1
          ? value[0]
          : `${value.length} selected`
        : value[0];

  const panel =
    open && mounted && pos ? (
      <div
        ref={panelRef}
        className="vp-dd-menu"
        role="listbox"
        aria-multiselectable={multiple}
        aria-label={label}
        style={{ top: pos.top, left: pos.left, width: pos.width }}
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
          {filtered.map((option) => {
            const selected = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                className={`vp-dd-item${selected ? ' is-selected' : ''}`}
                onClick={() => selectOption(option)}
              >
                <span className="vp-dd-item-label">{option}</span>
                {selected ? <Check size={15} className="vp-dd-check" aria-hidden /> : null}
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
        id={fieldId}
        type="button"
        className={`vp-dd-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setOpen((v) => !v);
          if (open) setQ('');
        }}
      >
        <span className={value.length ? '' : 'is-placeholder'} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {summary}
        </span>
        {multiple && value.length > 1 ? (
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 'auto',
              marginRight: 4,
            }}
          >
            <X
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            />
          </span>
        ) : null}
        <ChevronDown size={16} className="vp-dd-chevron" aria-hidden />
      </button>
      {mounted ? createPortal(panel, document.body) : null}
    </div>
  );
}
