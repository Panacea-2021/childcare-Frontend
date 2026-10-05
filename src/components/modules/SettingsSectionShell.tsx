'use client';

import type { ReactNode } from 'react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import '@/components/modules/center-management/students.css';
import './settings-section.css';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Extra class on the cm-page wrapper (e.g. settings-programs). */
  className?: string;
};

/**
 * Shared Settings chrome: Students-style header + spaced content panel shell.
 */
export function SettingsSectionShell({
  title,
  description,
  icon,
  actions,
  children,
  className = '',
}: Props) {
  return (
    <div className={`cm-page cm-page--settings settings-section ${className}`.trim()}>
      <CenterManagementPageHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
      />
      <div className="settings-section-body">{children}</div>
    </div>
  );
}
