'use client';

import { useEffect, useId, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useFloatingPosition } from '@/components/modules/center-management/ui/useFloatingPosition';

export type BiFilterOption = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: BiFilterOption[];
  searchable?: boolean;
  placeholder?: string;
  /** Override trigger text (e.g. custom date range label). */
  displayValue?: string;
  /** External ref to the trigger shell (for anchored popovers). */
  triggerRefOut?: MutableRefObject<HTMLDivElement | null>;
};

/** Premium labeled filter dropdown for Billing Invoices filter bar. */
export function BiFilterSelect({
  label,
  value,
  onChange,
  options,
  searchable = true,
  placeholder = 'Select…',
  displayValue,
  triggerRefOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const shownLabel = displayValue || selected?.label;
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [options, q]);

  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align: 'start',
    minWidth: 'trigger',
    maxHeight: 280,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || contentRef.current?.contains(t)) return;
      setOpen(false);
      setQ('');
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setActive(Math.max(0, filtered.findIndex((o) => o.value === value)));
    }
  }, [open, searchable]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQ('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active].value);
    }
  };

  return (
    <div className={`bi-filter-field${open ? ' is-open' : ''}`}>
      <label className="bi-filter-label" htmlFor={listId}>
        {label}
      </label>
      <div
        className="bi-filter-dd"
        ref={(el) => {
          triggerRef.current = el;
          if (triggerRefOut) triggerRefOut.current = el;
        }}
      >
        <button
          type="button"
          className={`bi-filter-trigger${open ? ' is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          {open && searchable ? (
            <input
              ref={inputRef}
              id={listId}
              className="bi-filter-input"
              value={q}
              placeholder={shownLabel ?? placeholder}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              onClick={(e) => e.stopPropagation()}
              aria-autocomplete="list"
            />
          ) : (
            <span className={shownLabel ? '' : 'is-ph'}>{shownLabel ?? placeholder}</span>
          )}
          {searchable ? <Search size={15} className="bi-filter-ico" aria-hidden /> : <ChevronDown size={15} className="bi-filter-ico" aria-hidden />}
        </button>

        {typeof document !== 'undefined'
          ? createPortal(
              <AnimatePresence>
                {open ? (
                  <motion.div
                    ref={contentRef}
                    className="bi-filter-menu"
                    style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: 280 }}
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    role="listbox"
                    id={listId}
                  >
                    {filtered.length === 0 ? (
                      <div className="bi-filter-empty">No matches</div>
                    ) : (
                      filtered.map((opt, i) => {
                        const on = opt.value === value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={on}
                            className={`bi-filter-option${on ? ' is-selected' : ''}${i === active ? ' is-active' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => pick(opt.value)}
                          >
                            <span>{opt.label}</span>
                            {on ? <Check size={14} /> : null}
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}
