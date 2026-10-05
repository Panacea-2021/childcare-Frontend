'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const LabelsPage = dynamic(
  () => import('@/components/modules/center-management/LabelsPage').then((m) => m.LabelsPage),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function Page() {
  return <LabelsPage />;
}
