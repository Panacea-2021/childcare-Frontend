'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StaffMessagesPage = dynamic(
  () =>
    import('@/components/modules/messages/staff-messages/StaffMessagesPage').then(
      (m) => m.StaffMessagesPage,
    ),
  {
    ssr: false,
    loading: () => <PageLoader context="messages" title="Opening staff conversations…" />,
  },
);

export default function Page() {
  return <StaffMessagesPage />;
}
