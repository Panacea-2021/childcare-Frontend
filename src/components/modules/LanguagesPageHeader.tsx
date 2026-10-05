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
 * Language page header — identical visual treatment to
 * Center Management Students (shared CenterManagementPageHeader).
 */
export function LanguagesPageHeader({ title, description, icon, actions }: Props) {
  return (
    <CenterManagementPageHeader
      title={title}
      description={description}
      icon={icon}
      actions={actions}
    />
  );
}
