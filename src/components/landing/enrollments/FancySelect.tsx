'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
};

export function FancySelect({ label, placeholder, value, options, onChange, required }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`fancy-select${open ? ' is-open' : ''}${value ? ' has-value' : ''}`} ref={rootRef}>
      <span className="ui-label fancy-selectLabel">{label}{required ? ' *' : ''}</span>
      <button
        type="button"
        className="fancy-selectTrigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? 'is-filled' : 'is-placeholder'}>{value || placeholder}</span>
        <ChevronDown size={16} className="fancy-selectChevron" aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            className="fancy-selectMenu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={!value ? 'is-active' : undefined}
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                <span>{placeholder}</span>
              </button>
            </li>
            {options.map((opt) => (
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
                  <span>{opt}</span>
                  {value === opt ? <Check size={15} aria-hidden /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
