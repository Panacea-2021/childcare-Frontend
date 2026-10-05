import { Suspense } from 'react';
import { CreateInvoicePage } from '@/components/modules/billing-accounting/CreateInvoicePage';
import { PageLoader } from '@/components/ui/loading';

export default function CreateInvoiceRoute() {
  return (
    <Suspense fallback={<PageLoader context="invoices" title="Loading invoice form…" />}>
      <CreateInvoicePage />
    </Suspense>
  );
}
