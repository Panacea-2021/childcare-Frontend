import { Suspense } from 'react';
import { CreditHistoryPage } from '@/components/modules/billing-accounting/CreditHistoryPage';
import { PageLoader } from '@/components/ui/loading';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="balances" title="Loading credit history…" />}>
      <CreditHistoryPage />
    </Suspense>
  );
}
