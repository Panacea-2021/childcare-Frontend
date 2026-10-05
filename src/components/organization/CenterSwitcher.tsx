'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Layers } from 'lucide-react';
import { useCenterScope } from './CenterScopeContext';
import './center-switcher.css';

type Props = {
  collapsed?: boolean;
  /** Where the switcher is rendered — controls layout/menu position */
  variant?: 'sidebar' | 'header' | 'landing';
};

export function CenterSwitcher({ collapsed = false, variant = 'sidebar' }: Props) {
  const { organization, centers, activeScope, isAllCenters, scopeLabel, setActiveScope, canSwitchCenters } =
    useCenterScope();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
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

  if (!canSwitchCenters) return null;

  const showCopy = !collapsed || variant === 'header' || variant === 'landing';

  return (
    <div
      className={`cs-switcher cs-variant-${variant}${collapsed ? ' is-collapsed' : ''}${open ? ' is-open' : ''}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className={`cs-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={scopeLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cs-trigger-icon" aria-hidden>
          {isAllCenters ? <Layers size={16} /> : <Building2 size={16} />}
        </span>
        {showCopy ? (
          <span className="cs-trigger-copy">
            <span className="cs-trigger-org">{organization.name}</span>
            <span className="cs-trigger-scope">{scopeLabel}</span>
          </span>
        ) : null}
        {showCopy ? (
          <ChevronDown size={14} className={`cs-chevron${open ? ' is-open' : ''}`} aria-hidden />
        ) : null}
      </button>

      {open ? (
        <div className="cs-menu" role="listbox" aria-label="Select center scope">
          <button
            type="button"
            role="option"
            aria-selected={isAllCenters}
            className={`cs-option${isAllCenters ? ' is-active' : ''}`}
            onClick={() => {
              setActiveScope('all');
              setOpen(false);
            }}
          >
            <Layers size={15} aria-hidden />
            <span className="cs-option-copy">
              <strong>All Centers</strong>
              <small>Organization rollup across {centers.length} centers</small>
            </span>
            {isAllCenters ? <Check size={14} className="cs-check" aria-hidden /> : null}
          </button>

          <div className="cs-menu-sep" aria-hidden />

          {centers.map((center) => {
            const active = activeScope === center.id;
            return (
              <button
                key={center.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`cs-option${active ? ' is-active' : ''}`}
                onClick={() => {
                  setActiveScope(center.id);
                  setOpen(false);
                }}
              >
                <Building2 size={15} aria-hidden />
                <span className="cs-option-copy">
                  <strong>{center.shortName}</strong>
                  <small>
                    {center.city} · {center.code}
                  </small>
                </span>
                {active ? <Check size={14} className="cs-check" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
