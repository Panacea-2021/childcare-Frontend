'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { StudentProfilePage } from '@/components/modules/center-management/StudentProfilePage';
import { PageLoader } from '@/components/ui/loading';

export default function Page() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense fallback={<PageLoader context="students" title="Loading student profile…" />}>
      <StudentProfilePage studentId={params.id} />
    </Suspense>
  );
}
