'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const PaymentsPage = dynamic(
  () =>
    import('@/components/modules/billing-accounting/PaymentsPage').then((m) => m.PaymentsPage),
  { ssr: false, loading: () => <PageLoader context="payments" inset /> },
);

export default function BillingPaymentsRoute() {
  return <PaymentsPage />;
}
