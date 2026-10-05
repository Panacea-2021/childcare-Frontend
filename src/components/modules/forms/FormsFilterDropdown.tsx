'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

type Option = string;

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  searchable?: boolean;
};

export function FormsFilterDropdown({ label, value, options, onChange, searchable }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

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

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()))
    : options;

  return (
    <div className={`forms-dd ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="forms-dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setQ('');
        }}
      >
        <span>{value || label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open ? (
        <div className="forms-dd-panel" role="listbox" aria-label={label}>
          {searchable ? (
            <label className="forms-dd-search">
              <Search size={14} aria-hidden />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                aria-label={`Search ${label}`}
              />
            </label>
          ) : null}
          <ul>
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  className={value === opt ? 'is-active' : undefined}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? <li className="forms-dd-empty">No matches</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
