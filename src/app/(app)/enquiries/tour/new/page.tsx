import { Suspense } from 'react';
import { CreateAppointmentPage } from '@/components/modules/appointments';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="appt-page mod-page">
          <div className="appt-skeleton" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="appt-skel-line" />
            ))}
          </div>
        </div>
      }
    >
      <CreateAppointmentPage />
    </Suspense>
  );
}
