import { Suspense } from 'react';
import { CreateDebitNotePage } from '@/components/modules/billing-accounting/CreateDebitNotePage';
import { PageLoader } from '@/components/ui/loading';

export default function CreateDebitNoteRoute() {
  return (
    <Suspense fallback={<PageLoader context="invoices" title="Loading debit form…" />}>
      <CreateDebitNotePage />
    </Suspense>
  );
}
