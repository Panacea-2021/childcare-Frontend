'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const AttendanceForecastPage = dynamic(
  () =>
    import('@/components/modules/attendance-leaves/AttendanceForecastPage').then(
      (m) => m.AttendanceForecastPage,
    ),
  { ssr: false, loading: () => <PageLoader context="attendance" inset /> },
);

export default function AttendanceForecastRoute() {
  return <AttendanceForecastPage />;
}
