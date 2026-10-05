'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const FeePlanPage = dynamic(
  () =>
    import('@/components/modules/billing-accounting/FeePlanPage').then((m) => m.FeePlanPage),
  { ssr: false, loading: () => <PageLoader context="fee-plan" inset /> },
);

export default function BillingFeePlanRoute() {
  return <FeePlanPage />;
}
