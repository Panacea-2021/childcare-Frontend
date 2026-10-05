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
  /** Wider panel for dual-column flows (e.g. Assign Lessons). */
  wide?: boolean;
  /** Optional line under the title. */
  subtitle?: string;
  /** Extra class on the scrollable body (e.g. flush dual-column layouts). */
  bodyClassName?: string;
  /** Optional header icon. Defaults to the standard form/building chip. */
  icon?: React.ReactNode;
  /** Secondary text on the right (e.g. "2 students"), shown before the close control. */
  meta?: string;
  /**
   * Plain header matching Program insight drawers:
   * title on the left, optional meta + × on the right (no icon / no "Close" label).
   */
  plainHeader?: boolean;
  /** Extra controls before the Close button (e.g. ⋮ menu). */
  headerActions?: React.ReactNode;
};

function DefaultDrawerIcon() {
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

export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
  subtitle,
  bodyClassName,
  icon,
  meta,
  plainHeader = false,
  headerActions,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lockUiOverlay();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev === 'hidden' ? '' : prev;
      unlockUiOverlay();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="ui-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className={`ui-drawer${wide ? ' ui-drawer-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {plainHeader ? (
          <div className="ui-drawer-header ui-drawer-header-plain">
            <h2 className="ui-drawer-plain-title">{title}</h2>
            <div className="ui-drawer-plain-right">
              {meta ? <span className="ui-drawer-plain-meta">{meta}</span> : null}
              <button type="button" className="ui-drawer-plain-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
          </div>
        ) : (
          <div className="ui-drawer-header">
            <div className="ui-modal-title-row">
              <span className="ui-modal-icon" aria-hidden>
                {icon ?? <DefaultDrawerIcon />}
              </span>
              <div className="ui-drawer-title-stack">
                <h2>{title}</h2>
                {subtitle ? <p className="ui-drawer-subtitle">{subtitle}</p> : null}
              </div>
            </div>
            <div className="ui-drawer-header-actions">
              {headerActions}
              <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">
                <span className="ui-modal-close-x" aria-hidden>
                  ×
                </span>
                Close
              </button>
            </div>
          </div>
        )}
        <div className={['ui-drawer-body', bodyClassName].filter(Boolean).join(' ')}>{children}</div>
        {footer ? <div className="ui-drawer-footer">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}
