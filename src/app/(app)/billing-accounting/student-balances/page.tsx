'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading';

const StudentBalancesPage = dynamic(
  () =>
    import('@/components/modules/billing-accounting/StudentBalancesPage').then(
      (m) => m.StudentBalancesPage,
    ),
  { ssr: false, loading: () => <PageLoader context="balances" inset /> },
);

export default function BillingStudentBalancesRoute() {
  return (
    <Suspense fallback={<PageLoader context="balances" inset />}>
      <StudentBalancesPage />
    </Suspense>
  );
}
