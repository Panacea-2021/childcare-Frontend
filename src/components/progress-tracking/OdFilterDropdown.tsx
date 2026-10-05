'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type OdFilterOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: OdFilterOption[];
  ariaLabel: string;
  className?: string;
};

export function OdFilterDropdown({
  value,
  onChange,
  options,
  ariaLabel,
  className = '',
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? options[0]?.label ?? '';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 160);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      const spaceBelow = window.innerHeight - r.bottom;
      const top =
        spaceBelow < 220 && r.top > spaceBelow
          ? Math.max(8, r.top - 8 - Math.min(280, options.length * 40 + 16))
          : r.bottom + 6;
      setPos({ top, left, width });
    };

    place();

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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
  }, [open, options.length]);

  return (
    <div className={`od-dd ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`od-dd-trigger${open ? ' is-open' : ''}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="od-dd-label">{label}</span>
        <ChevronDown size={16} className="od-dd-chevron" aria-hidden />
      </button>

      {mounted &&
        open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            className="od-dd-menu"
            role="listbox"
            aria-label={ariaLabel}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`od-dd-item${active ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {active ? <Check size={15} aria-hidden /> : null}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
