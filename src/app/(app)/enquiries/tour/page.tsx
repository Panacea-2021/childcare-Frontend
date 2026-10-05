import { Suspense } from 'react';
import { AppointmentsPage } from '@/components/modules/appointments';

export default function Page() {
  return (
    <Suspense fallback={<div className="mod-page">Loading tours…</div>}>
      <AppointmentsPage />
    </Suspense>
  );
}
