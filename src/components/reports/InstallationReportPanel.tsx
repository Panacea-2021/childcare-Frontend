'use client';

import { memo } from 'react';
import { ParentInstallationDashboard } from '@/components/reports/parent-installation/ParentInstallationDashboard';
import { StaffInstallationDashboard } from '@/components/reports/staff-installation/StaffInstallationDashboard';

type Props = {
  variant: 'parent' | 'staff';
  onGenerate: () => void;
  onDownload: () => void;
};

function InstallationReportPanelBase({ variant }: Props) {
  if (variant === 'parent') {
    return <ParentInstallationDashboard />;
  }

  return <StaffInstallationDashboard />;
}

export const InstallationReportPanel = memo(InstallationReportPanelBase);
