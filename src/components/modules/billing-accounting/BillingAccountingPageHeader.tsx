'use client';

import type { ReactNode } from 'react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
};

/**
 * Billing & Accounting page header — same visual treatment as
 * Center Management Students (shared CenterManagementPageHeader).
 */
export function BillingAccountingPageHeader({ title, description, icon, actions }: Props) {
  return (
    <CenterManagementPageHeader
      title={title}
      description={description}
      icon={icon}
      actions={actions}
    />
  );
}
