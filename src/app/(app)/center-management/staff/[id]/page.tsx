'use client';

import { use } from 'react';
import { StaffProfilePage } from '@/components/modules/center-management/StaffProfilePage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffProfilePage staffId={id} />;
}
