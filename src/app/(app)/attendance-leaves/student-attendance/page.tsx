'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading';

const StudentAttendancePage = dynamic(
  () =>
    import('@/components/modules/attendance-leaves/StudentAttendancePage').then(
      (m) => m.StudentAttendancePage,
    ),
  { ssr: false, loading: () => <PageLoader context="attendance" inset /> },
);

export default function StudentAttendanceRoute() {
  return (
    <Suspense fallback={<PageLoader context="attendance" inset />}>
      <StudentAttendancePage />
    </Suspense>
  );
}
