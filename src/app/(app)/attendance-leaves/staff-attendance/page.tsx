'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading';

const StaffAttendancePage = dynamic(
  () =>
    import('@/components/modules/attendance-leaves/StaffAttendancePage').then(
      (m) => m.StaffAttendancePage,
    ),
  {
    ssr: false,
    loading: () => <PageLoader context="attendance" title="Preparing staff attendance…" inset />,
  },
);

export default function StaffAttendanceRoute() {
  return (
    <Suspense
      fallback={<PageLoader context="attendance" title="Preparing staff attendance…" inset />}
    >
      <StaffAttendancePage />
    </Suspense>
  );
}
