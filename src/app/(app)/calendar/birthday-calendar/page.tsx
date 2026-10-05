'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const BirthdayCalendarPage = dynamic(
  () =>
    import('@/components/modules/calendar/birthdays/BirthdayCalendarPage').then(
      (m) => m.BirthdayCalendarPage,
    ),
  {
    ssr: false,
    loading: () => <PageLoader context="calendar" title="Loading birthday calendar…" />,
  },
);

export default function Page() {
  return <BirthdayCalendarPage />;
}
