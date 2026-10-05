'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceDetailPage } from '@/components/modules/billing-accounting/invoice-detail/InvoiceDetailPage';
import { PageLoader } from '@/components/ui/loading';

export default function InvoiceDetailRoute() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense fallback={<PageLoader context="invoices" title="Loading invoice…" />}>
      <InvoiceDetailPage invoiceId={params.id} />
    </Suspense>
  );
}
