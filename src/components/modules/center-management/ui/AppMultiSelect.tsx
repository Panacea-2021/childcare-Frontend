'use client';

import { useId, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { FloatingMenu, type DropdownOption } from './AppDropdown';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

/** Multi-select with pills in the trigger and checklist dropdown. */
export function AppMultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Select…',
  searchable = true,
  searchPlaceholder = 'Search…',
  disabled = false,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const listId = useId();

  const selected = options.filter((o) => values.includes(o.value));
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  return (
    <FloatingMenu
      open={open}
      onOpenChange={(v) => {
        if (disabled) return;
        setOpen(v);
        if (!v) setQ('');
      }}
      className={className}
      trigger={
        <button
          type="button"
          className={`cm-multi-trigger${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="cm-multi-trigger-body">
            {selected.length ? (
              selected.map((opt) => (
                <span
                  key={opt.value}
                  className="cm-multi-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(opt.value);
                  }}
                >
                  {opt.label}
                  <X size={12} />
                </span>
              ))
            ) : (
              <span className="is-placeholder">{placeholder}</span>
            )}
          </span>
          <ChevronDown size={16} className="cm-dd-chevron" />
        </button>
      }
    >
      <div id={listId}>
        {searchable ? (
          <div className="cm-dd-search">
            <Search size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}
        <div className="cm-dd-list">
          {filtered.map((opt) => {
            const on = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={on}
                disabled={opt.disabled}
                className={`cm-dd-item${on ? ' is-selected' : ''}`}
                onClick={() => toggle(opt.value)}
              >
                {opt.icon ? <span className="cm-dd-item-icon">{opt.icon}</span> : null}
                <span className="cm-dd-item-label">{opt.label}</span>
                {on ? <Check size={15} className="cm-dd-check" /> : null}
              </button>
            );
          })}
          {!filtered.length ? <div className="cm-dd-empty">No matches</div> : null}
        </div>
      </div>
    </FloatingMenu>
  );
}
