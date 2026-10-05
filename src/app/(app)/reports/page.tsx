'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading';

const ReportsPage = dynamic(
  () => import('@/components/modules/ReportsPage').then((m) => m.ReportsPage),
  { ssr: false, loading: () => <PageLoader context="reports" inset /> },
);

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="reports" inset />}>
      <ReportsPage />
    </Suspense>
  );
}
