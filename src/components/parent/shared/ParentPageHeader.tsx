'use client';

import type { ReactNode } from 'react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
  /** Kept for API compatibility — invoices header does not show a kicker. */
  kicker?: string;
};

/**
 * Parent Portal page header — identical to Student Invoices
 * (floating icon, title shimmer, entrance animation).
 */
export function ParentPageHeader({ title, description, icon, actions }: Props) {
  return (
    <CenterManagementPageHeader
      title={title}
      description={description}
      icon={icon}
      actions={actions}
    />
  );
}
