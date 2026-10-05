'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const ParentMessagesPage = dynamic(
  () =>
    import('@/components/modules/messages/parent-messages/ParentMessagesPage').then(
      (m) => m.ParentMessagesPage,
    ),
  {
    ssr: false,
    loading: () => <PageLoader context="messages" />,
  },
);

export default function Page() {
  return <ParentMessagesPage />;
}
