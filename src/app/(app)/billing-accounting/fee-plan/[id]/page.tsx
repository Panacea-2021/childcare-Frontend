import { Suspense } from 'react';
import { FeePlanDetailPage } from '@/components/modules/billing-accounting/FeePlanDetailPage';

export default function FeePlanDetailRoute() {
  return (
    <Suspense fallback={null}>
      <FeePlanDetailPage />
    </Suspense>
  );
}
