'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import './field-picker.css';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const PANEL_GAP = 8;
const PANEL_WIDTH = 312;

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  /** How the ISO value is shown in the trigger. Default: dd-mm-yyyy */
  displayFormat?: 'dd-mm-yyyy' | 'dd/mm/yy';
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplay(iso: string, displayFormat: 'dd-mm-yyyy' | 'dd/mm/yy' = 'dd-mm-yyyy') {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  if (displayFormat === 'dd/mm/yy') return `${d}/${m}/${y.slice(-2)}`;
  return `${d}-${m}-${y}`;
}

function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function buildMonthCells(view: Date) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function FieldDatePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = 'dd-mm-yyyy',
  displayFormat = 'dd-mm-yyyy',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: 'below' | 'above' } | null>(
    null,
  );
  const [view, setView] = useState(() => parseDate(value || toISODate(new Date())));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!value) return;
    setView(parseDate(value));
  }, [value]);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const place = () => {
      const rect = wrapRef.current!.getBoundingClientRect();
      const panelH = panelRef.current?.offsetHeight || 340;
      const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
      const placement = spaceBelow < panelH && rect.top > panelH + PANEL_GAP ? 'above' : 'below';
      const top =
        placement === 'above' ? Math.max(12, rect.top - panelH - PANEL_GAP) : rect.bottom + PANEL_GAP;
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - PANEL_WIDTH - 12);
      setPos({ top, left, placement });
    };
    place();
    // Re-measure after paint so panel height is accurate
    const raf = window.requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cells = useMemo(() => buildMonthCells(view), [view]);
  const todayIso = toISODate(new Date());
  const display = formatDisplay(value, displayFormat);

  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const panel =
    mounted && open && pos
      ? createPortal(
          <div
            ref={panelRef}
            className={`vp-fp-panel vp-fp-panel--${pos.placement}`}
            style={{ top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            role="dialog"
            aria-label={ariaLabel}
          >
            <div className="vp-fp-head">
              <button
                type="button"
                className="vp-fp-navBtn"
                aria-label="Previous month"
                onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              >
                <ChevronLeft size={16} strokeWidth={2.25} />
              </button>
              <strong>
                {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
              </strong>
              <button
                type="button"
                className="vp-fp-navBtn"
                aria-label="Next month"
                onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              >
                <ChevronRight size={16} strokeWidth={2.25} />
              </button>
            </div>
            <div className="vp-fp-dow" aria-hidden>
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="vp-fp-days">
              {cells.map((day) => {
                const iso = toISODate(day);
                const inMonth = day.getMonth() === view.getMonth();
                const selected = iso === value;
                return (
                  <button
                    key={iso + String(inMonth)}
                    type="button"
                    className={[
                      'vp-fp-day',
                      !inMonth ? 'is-outside' : '',
                      iso === todayIso ? 'is-today' : '',
                      selected ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      if (!inMonth) {
                        setView(new Date(day.getFullYear(), day.getMonth(), 1));
                      }
                      pick(iso);
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="vp-fp-foot">
              <button
                type="button"
                className="vp-fp-footBtn"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="vp-fp-footBtn is-accent"
                onClick={() => {
                  const t = toISODate(new Date());
                  setView(new Date());
                  pick(t);
                }}
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="vp-fp" ref={wrapRef}>
      <button
        type="button"
        className={`vp-fp-trigger${open ? ' is-open' : ''}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`vp-fp-value${display ? '' : ' is-placeholder'}`}>
          {display || placeholder}
        </span>
        <span className="vp-fp-icon" aria-hidden>
          <CalendarDays size={18} strokeWidth={2.1} />
        </span>
      </button>
      {panel}
    </div>
  );
}
