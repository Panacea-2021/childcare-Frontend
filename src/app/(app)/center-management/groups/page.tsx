'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const GroupsPage = dynamic(
  () => import('@/components/modules/center-management/GroupsPage').then((m) => m.GroupsPage),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function Page() {
  return <GroupsPage />;
}
