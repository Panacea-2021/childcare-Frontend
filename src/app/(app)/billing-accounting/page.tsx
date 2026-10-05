'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const BillingDashboardPage = dynamic(
  () =>
    import('@/components/modules/billing-accounting/BillingDashboardPage').then(
      (m) => m.BillingDashboardPage,
    ),
  { ssr: false, loading: () => <PageLoader context="payments" inset /> },
);

export default function BillingDashboardRoute() {
  return <BillingDashboardPage />;
}
