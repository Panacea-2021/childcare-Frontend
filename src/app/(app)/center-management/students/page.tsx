'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const StudentsPage = dynamic(
  () =>
    import('@/components/modules/center-management/StudentsPage').then((m) => m.StudentsPage),
  { ssr: false, loading: () => <PageLoader context="students" inset /> },
);

export default function Page() {
  return <StudentsPage />;
}
