'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StaffHolidaysPage = dynamic(
  () =>
    import('@/components/modules/calendar/holidays/StaffHolidaysPage').then(
      (m) => m.StaffHolidaysPage,
    ),
  {
    ssr: false,
    loading: () => <PageLoader context="calendar" title="Loading holidays…" />,
  },
);

export default function Page() {
  return <StaffHolidaysPage />;
}
