'use client';

import { use } from 'react';
import { StaffFormScreen } from '@/components/modules/center-management/StaffFormScreen';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffFormScreen staffId={id} />;
}
