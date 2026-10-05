'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StudentStaffRatioPage = dynamic(
  () =>
    import('@/components/modules/attendance-leaves/StudentStaffRatioPage').then(
      (m) => m.StudentStaffRatioPage,
    ),
  { ssr: false, loading: () => <PageLoader context="attendance" inset /> },
);

export default function StudentStaffRatioRoute() {
  return <StudentStaffRatioPage />;
}
