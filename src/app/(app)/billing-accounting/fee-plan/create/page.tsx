import { Suspense } from 'react';
import { CreateFeePlanPage } from '@/components/modules/billing-accounting/CreateFeePlanPage';
import { PageLoader } from '@/components/ui/loading';

export default function CreateFeePlanRoute() {
  return (
    <Suspense fallback={<PageLoader context="fee-plan" title="Loading fee plan form…" />}>
      <CreateFeePlanPage />
    </Suspense>
  );
}
