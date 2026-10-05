'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import './pill-date-picker.css';

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

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Gap between trigger and calendar panel (px) */
const PANEL_GAP = 12;

type Mode = 'date' | 'month';

type Props = {
  mode: Mode;
  value: string; // date: YYYY-MM-DD | month: YYYY-MM
  onChange: (value: string) => void;
  label?: string;
  ariaLabel: string;
  /** When 'above', opens calendar above the trigger (useful near modal footers). Default: auto-flip. */
  preferPlacement?: 'auto' | 'above' | 'below';
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateDisplay(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function formatMonthDisplay(value: string) {
  const [y, m] = value.split('-');
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return value;
  return `${MONTH_NAMES[idx]} ${y}`;
}

function parseMonth(value: string) {
  const [y, m] = value.split('-').map(Number);
  if (!y || !m) return new Date();
  return new Date(y, m - 1, 1);
}

function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export function PillDatePicker({
  mode,
  value,
  onChange,
  label,
  ariaLabel,
  preferPlacement = 'auto',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: 'above' | 'below' } | null>(
    null,
  );

  const [view, setView] = useState(() =>
    mode === 'month' ? parseMonth(value || '2026-08') : parseDate(value || toISODate(new Date())),
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!value) return;
    setView(mode === 'month' ? parseMonth(value) : parseDate(value));
  }, [value, mode]);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;

    const place = () => {
      const rect = wrapRef.current!.getBoundingClientRect();
      const width = mode === 'month' ? 280 : 300;
      const panelH = panelRef.current?.offsetHeight || (mode === 'month' ? 240 : 320);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);

      let placement: 'above' | 'below';
      if (preferPlacement === 'above') {
        placement = 'above';
      } else if (preferPlacement === 'below') {
        placement = 'below';
      } else {
        const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
        placement = spaceBelow < panelH && rect.top > panelH + PANEL_GAP ? 'above' : 'below';
      }

      const top =
        placement === 'above'
          ? Math.max(12, rect.top - panelH - PANEL_GAP)
          : rect.bottom + PANEL_GAP;

      setPos({ top, left, placement });
    };

    place();
    const raf = window.requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, mode, preferPlacement, view]);

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

  const cells = useMemo(() => (mode === 'date' ? buildMonthCells(view) : []), [mode, view]);
  const todayIso = toISODate(new Date());
  const display = mode === 'month' ? formatMonthDisplay(value) : formatDateDisplay(value);

  const panel =
    mounted && open && pos
      ? createPortal(
          <div
            ref={panelRef}
            className={`pdp-panel${mode === 'month' ? ' pdp-panel--month' : ''} pdp-panel--${pos.placement}`}
            style={{ top: pos.top, left: pos.left }}
            role="dialog"
            aria-label={ariaLabel}
          >
            <div className="pdp-head">
              <button
                type="button"
                className="pdp-navBtn"
                aria-label={mode === 'month' ? 'Previous year' : 'Previous month'}
                onClick={() =>
                  setView((d) =>
                    mode === 'month'
                      ? new Date(d.getFullYear() - 1, d.getMonth(), 1)
                      : new Date(d.getFullYear(), d.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>
              <strong>
                {mode === 'month'
                  ? view.getFullYear()
                  : `${MONTH_NAMES[view.getMonth()]} ${view.getFullYear()}`}
              </strong>
              <button
                type="button"
                className="pdp-navBtn"
                aria-label={mode === 'month' ? 'Next year' : 'Next month'}
                onClick={() =>
                  setView((d) =>
                    mode === 'month'
                      ? new Date(d.getFullYear() + 1, d.getMonth(), 1)
                      : new Date(d.getFullYear(), d.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {mode === 'month' ? (
              <div className="pdp-months">
                {MONTH_SHORT.map((name, idx) => {
                  const key = `${view.getFullYear()}-${pad(idx + 1)}`;
                  const selected = key === value;
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`pdp-monthBtn${selected ? ' is-selected' : ''}`}
                      onClick={() => {
                        onChange(key);
                        setOpen(false);
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="pdp-dow" aria-hidden>
                  {DOW.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="pdp-days">
                  {cells.map((day) => {
                    const iso = toISODate(day);
                    const inMonth = day.getMonth() === view.getMonth();
                    const selected = iso === value;
                    return (
                      <button
                        key={iso + String(inMonth)}
                        type="button"
                        className={[
                          'pdp-day',
                          !inMonth ? 'is-outside' : '',
                          iso === todayIso ? 'is-today' : '',
                          selected ? 'is-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={!inMonth}
                        onClick={() => {
                          onChange(iso);
                          setOpen(false);
                        }}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="pdp-root" ref={wrapRef}>
      <button
        type="button"
        className={`pdp-trigger${open ? ' is-open' : ''}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pdp-text">
          {label ? <span className="pdp-hint">{label}</span> : null}
          <span className="pdp-value">{display}</span>
        </span>
        <span className="pdp-icon" aria-hidden>
          <CalendarDays size={18} strokeWidth={2.25} />
        </span>
      </button>
      {panel}
    </div>
  );
}
