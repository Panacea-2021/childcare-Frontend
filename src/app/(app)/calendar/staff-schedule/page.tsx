'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StaffSchedulePage = dynamic(
  () => import('@/components/modules/calendar/StaffSchedulePage').then((m) => m.StaffSchedulePage),
  {
    ssr: false,
    loading: () => <PageLoader context="calendar" title="Loading schedule…" />,
  },
);

export default function Page() {
  return <StaffSchedulePage />;
}
