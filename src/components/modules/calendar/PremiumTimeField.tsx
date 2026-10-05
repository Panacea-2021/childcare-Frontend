'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3 } from 'lucide-react';
import { toDisplayTime } from './mockData';

type Props = {
  id?: string;
  value: string;
  onChange: (hhmm: string) => void;
  placeholder: string;
  icon?: ReactNode;
  error?: string;
  className?: string;
  /** How 24h `HH:mm` is shown. Defaults to `h:mm AM`. */
  formatValue?: (hhmm: string) => string;
};

function buildTimes() {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}

const TIMES = buildTimes();

export function PremiumTimeField({
  id,
  value,
  onChange,
  placeholder,
  icon,
  error,
  className = '',
  formatValue = toDisplayTime,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 200);
      const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
      const below = window.innerHeight - r.bottom;
      const top = below > 280 || below > r.top ? r.bottom + 8 : Math.max(12, r.top - 288);
      setPos({ top, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || listRef.current?.contains(t)) return;
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
  }, [open]);

  useEffect(() => {
    if (!open || !value) return;
    const el = listRef.current?.querySelector(`[data-time="${value}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'center' });
  }, [open, value]);

  const items = useMemo(() => TIMES, []);

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={listRef}
            className="cal-prem-menu cal-prem-time-menu"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            role="listbox"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <div className="cal-prem-menu-scroll">
              {items.map((t) => {
                const active = t === value;
                return (
                  <button
                    key={t}
                    type="button"
                    data-time={t}
                    role="option"
                    aria-selected={active}
                    className={`cal-prem-option ${active ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                  >
                    <span>{formatValue(t)}</span>
                    {active ? <Clock3 size={14} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className={`cal-prem-field ${className}`} ref={wrapRef}>
      <button
        id={fieldId}
        type="button"
        className={`cal-prem-trigger ${open ? 'is-open' : ''} ${value ? 'has-value' : ''} ${error ? 'has-error' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cal-prem-ico" aria-hidden>
          {icon ?? <Clock3 size={16} />}
        </span>
        <span className={`cal-prem-value ${value ? '' : 'is-placeholder'}`}>
          {value ? formatValue(value) : placeholder}
        </span>
        <Clock3 size={15} className="cal-prem-trailing" aria-hidden />
      </button>
      {error ? <p className="cal-field-error">{error}</p> : null}
      {menu}
    </div>
  );
}
