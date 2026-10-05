import { Suspense } from 'react';
import { DepositHistoryPage } from '@/components/modules/billing-accounting/DepositHistoryPage';
import { PageLoader } from '@/components/ui/loading';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="balances" title="Loading deposit history…" />}>
      <DepositHistoryPage />
    </Suspense>
  );
}
