'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StaffPage = dynamic(
  () => import('@/components/modules/center-management/StaffPage').then((m) => m.StaffPage),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function Page() {
  return <StaffPage />;
}
