'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const StudentFormBuilder = dynamic(
  () =>
    import('@/components/modules/enquiries/forms/StudentFormBuilder').then((m) => m.StudentFormBuilder),
  { ssr: false, loading: () => <div className="shell-loading">Opening form builder…</div> },
);

function BuilderInner() {
  const params = useSearchParams();
  const id = params.get('id') || undefined;
  const title = params.get('title') || undefined;
  // Remount when id changes so template/scratch/AI forms load correctly
  return <StudentFormBuilder key={id || 'new'} formId={id} initialTitle={title || undefined} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="shell-loading">Opening form builder…</div>}>
      <BuilderInner />
    </Suspense>
  );
}
