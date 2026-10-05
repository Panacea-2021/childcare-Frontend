'use client';

import { Suspense } from 'react';
import { InvoiceDetailPage } from '@/components/modules/billing-accounting/invoice-detail/InvoiceDetailPage';
import { PageLoader } from '@/components/ui/loading';
import '@/components/modules/center-management/students.css';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';

export function ParentInvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  return (
    <Suspense fallback={<PageLoader context="invoices" title="Loading invoice…" />}>
      <InvoiceDetailPage invoiceId={invoiceId} />
    </Suspense>
  );
}
