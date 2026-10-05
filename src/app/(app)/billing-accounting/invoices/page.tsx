'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading';

const InvoicesPage = dynamic(
  () =>
    import('@/components/modules/billing-accounting/InvoicesPage').then((m) => m.InvoicesPage),
  { ssr: false, loading: () => <PageLoader context="invoices" inset /> },
);

export default function BillingInvoicesRoute() {
  return (
    <Suspense fallback={<PageLoader context="invoices" inset />}>
      <InvoicesPage />
    </Suspense>
  );
}
