'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil } from 'lucide-react';
import { STATUS_META } from '@/lib/mock/mockProgressTracking';
import type { ProgressStatus } from '@/types/progressTracking';

const STAGES: Array<Exclude<ProgressStatus, 'none'>> = [
  'planned',
  'introduced',
  'practiced',
  'mastered',
];

export type StageMenuAnchor = {
  lessonId: string;
  studentId: string;
  top: number;
  left: number;
};

type Props = {
  anchor: StageMenuAnchor;
  current: ProgressStatus;
  onSelect: (status: ProgressStatus) => void;
  onAddRecord: () => void;
  onClose: () => void;
};

export function SetStagePopover({ anchor, current, onSelect, onAddRecord, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Defer so the opening click doesn't immediately close the menu
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onDoc);
    }, 0);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const top = Math.min(anchor.top, window.innerHeight - 260);
  const left = Math.min(anchor.left, window.innerWidth - 200);

  return createPortal(
    <div
      ref={ref}
      className="pt-stage-pop"
      role="dialog"
      aria-label="Set stage"
      style={{ top, left }}
    >
      <p className="pt-stage-pop-title">Set stage</p>
      <div className="pt-stage-pop-list" role="menu">
        {STAGES.map((key) => {
          const meta = STATUS_META[key];
          return (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={current === key}
              className={`pt-stage-pop-item${current === key ? ' is-active' : ''}`}
              onClick={() => onSelect(key)}
            >
              <span className={`pt-stage-dot ${meta.className}`} aria-hidden />
              {meta.label}
            </button>
          );
        })}
      </div>
      <div className="pt-stage-pop-footer">
        <button type="button" className="pt-stage-pop-add" onClick={onAddRecord}>
          <Pencil size={14} aria-hidden />
          Add record
        </button>
      </div>
    </div>,
    document.body,
  );
}
