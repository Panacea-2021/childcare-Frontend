'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const RoomsPage = dynamic(
  () => import('@/components/modules/center-management/RoomsPage').then((m) => m.RoomsPage),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function Page() {
  return <RoomsPage />;
}
