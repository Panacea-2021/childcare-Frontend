'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockUiOverlay, unlockUiOverlay } from '@/lib/uiOverlay';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  /** Mid-wide analytics dialog (~940px, auto height). */
  lg?: boolean;
  /** Extra-wide modal for dense forms / report builders. */
  xl?: boolean;
  /** When set with xl/lg, height grows with content up to max-height. */
  autoHeight?: boolean;
  /**
   * Stack above another modal or a drawer.
   * (e.g. Tag students over Add record, or Edit Label over Manage drawer)
   */
  elevated?: boolean;
  /** Optional header icon. Defaults to the standard form/building chip. */
  icon?: React.ReactNode;
  /** Circular icon-only close control (report builders). */
  iconClose?: boolean;
  /** Optional label above the form fields (rarely needed). */
  sectionTitle?: string;
  /** Optional subtitle under the title (report generators). */
  subtitle?: React.ReactNode;
  /** Extra class names on the dialog panel (premium layouts, themed shells). */
  className?: string;
};

/** Escape closes only the topmost open modal. */
const escapeStack: Array<() => void> = [];

function DefaultModalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20V9.5L12 4l8 5.5V20h-5.5v-5h-5v5H4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
  lg,
  xl,
  autoHeight,
  elevated = false,
  icon,
  iconClose,
  sectionTitle,
  subtitle,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    escapeStack.push(onClose);
    lockUiOverlay();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      const top = escapeStack[escapeStack.length - 1];
      top?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      const idx = escapeStack.lastIndexOf(onClose);
      if (idx >= 0) escapeStack.splice(idx, 1);
      unlockUiOverlay();
      if (escapeStack.length === 0) {
        document.body.style.overflow = prevOverflow === 'hidden' ? '' : prevOverflow;
      }
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={`ui-modal-backdrop${elevated ? ' ui-modal-backdrop-elevated' : ''}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`ui-modal${wide ? ' ui-modal-wide' : ''}${lg ? ' ui-modal-lg' : ''}${xl ? ' ui-modal-xl' : ''}${autoHeight ? ' ui-modal-auto-height' : ''}${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="ui-modal-title-row">
            <span
              className={`ui-modal-icon${lg || xl ? ' ui-modal-icon-soft' : ''}${xl ? ' ui-modal-icon-round' : ''}`}
              aria-hidden
            >
              {icon ?? <DefaultModalIcon />}
            </span>
            <div className="ui-modal-title-copy">
              <h2>{title}</h2>
              {subtitle ? <p className="ui-modal-subtitle">{subtitle}</p> : null}
            </div>
          </div>
          <button
            type="button"
            className={`ui-modal-close${iconClose ? ' ui-modal-close-icon' : ''}`}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="ui-modal-close-x" aria-hidden>
              ×
            </span>
            {iconClose ? null : 'Close'}
          </button>
        </div>
        <div className="ui-modal-body">
          {sectionTitle ? (
            <div className="ui-form-section-title">
              <span className="ui-form-section-title-icon" aria-hidden>
                ●
              </span>
              {sectionTitle}
            </div>
          ) : null}
          {children}
        </div>
        {footer ? <div className="ui-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
