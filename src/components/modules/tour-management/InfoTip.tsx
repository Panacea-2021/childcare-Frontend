'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

type Props = {
  text: string;
};

function placeNear(btn: HTMLElement, popH = 72) {
  const rect = btn.getBoundingClientRect();
  const popW = Math.min(280, window.innerWidth - 24);
  let left = rect.left;
  if (left + popW > window.innerWidth - 12) {
    left = Math.max(12, window.innerWidth - popW - 12);
  }
  const below = rect.bottom + 8;
  const top =
    below + popH > window.innerHeight - 12
      ? Math.max(12, rect.top - popH - 8)
      : below;
  return { top, left };
}

export function InfoTip({ text }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const show = () => {
    clearCloseTimer();
    if (btnRef.current) setPos(placeNear(btnRef.current));
    setOpen(true);
  };

  const hideSoon = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setPos(null);
    }, 100);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;

    const update = () => {
      const popH = popRef.current?.offsetHeight || 72;
      setPos(placeNear(btnRef.current!, popH));
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, text]);

  if (!text.trim()) return null;

  return (
    <span
      className="tm-infoTip"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
    >
      <button
        ref={btnRef}
        type="button"
        className={`tm-infoBtn${open ? ' is-open' : ''}`}
        aria-label="More information"
        aria-describedby={open ? id : undefined}
        tabIndex={0}
        onFocus={show}
        onBlur={hideSoon}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Info size={14} strokeWidth={2.2} />
      </button>
      {mounted && open && pos
        ? createPortal(
            <span
              ref={popRef}
              className="tm-infoPop"
              id={id}
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              onMouseEnter={show}
              onMouseLeave={hideSoon}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
