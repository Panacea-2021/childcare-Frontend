'use client';

import type { ReactNode } from 'react';
import './module-page-header.css';

type Props = {
  /** Uppercase section eyebrow, e.g. "CENTER MANAGEMENT" */
  section: string;
  title: string;
  description?: string;
  icon: ReactNode;
  actions?: ReactNode;
};

/**
 * Premium SaaS page header — used across Center Management and Attendance & Leaves.
 * Animations run once on mount via CSS (fade-up + underline expand).
 */
export function ModulePageHeader({ section, title, description, icon, actions }: Props) {
  return (
    <header className="mph">
      <span className="mph-glow" aria-hidden />
      <div className="mph-row">
        <div className="mph-copy">
          <span className="mph-kicker">{section}</span>
          <div className="mph-title-row">
            <span className="mph-icon" aria-hidden>
              {icon}
            </span>
            <div className="mph-title-wrap">
              <h1 className="mph-title">{title}</h1>
              <span className="mph-underline" aria-hidden />
            </div>
          </div>
          {description ? <p className="mph-desc">{description}</p> : null}
        </div>
        {actions ? <div className="mph-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
