'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Users } from 'lucide-react';
import type { ScheduleStaff } from '../types';

type Props = {
  staff: ScheduleStaff[];
  values: string[];
  onChange: (values: string[]) => void;
  labelledBy?: string;
};

type MenuPos = { top: number; left: number; width: number; maxHeight: number };

export function StaffMultiSelect({ staff, values, onChange, labelledBy }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const preferBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove;
      const maxHeight = Math.min(240, preferBelow ? spaceBelow : spaceAbove);
      const height = Math.max(120, maxHeight);
      setPos({
        top: preferBelow ? rect.bottom + 6 : rect.top - 6 - height,
        left: rect.left,
        width: rect.width,
        maxHeight: height,
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
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
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

  const selected = staff.filter((s) => values.includes(s.id));
  const summary =
    selected.length === 0
      ? 'Select staff'
      : selected.length <= 2
        ? selected.map((s) => s.name).join(', ')
        : `${selected.length} staff selected`;

  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  };

  return (
    <div className={`ss-ms${open ? ' is-open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="ss-ms-trigger ui-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`ss-ms-value${selected.length ? '' : ' is-placeholder'}`}>
          <Users size={15} aria-hidden />
          {summary}
        </span>
        <ChevronDown size={16} className="ss-ms-chevron" aria-hidden />
      </button>

      {mounted && open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="ss-ms-menu"
              id={listId}
              role="listbox"
              aria-multiselectable
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxHeight,
                zIndex: 12000,
              }}
            >
              {staff.map((s) => {
                const on = values.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    className={`ss-ms-option${on ? ' is-selected' : ''}`}
                    onClick={() => toggle(s.id)}
                  >
                    <span className={`ss-ms-check${on ? ' is-on' : ''}`} aria-hidden>
                      {on ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="ss-ms-copy">
                      <strong>{s.name}</strong>
                      <em>{s.role}</em>
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
