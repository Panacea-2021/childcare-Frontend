'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const CalendarPage = dynamic(
  () => import('@/components/modules/CalendarPage').then((m) => m.CalendarPage),
  {
    ssr: false,
    loading: () => <PageLoader context="calendar" title="Loading school calendar…" />,
  },
);

export default function Page() {
  return <CalendarPage />;
}
