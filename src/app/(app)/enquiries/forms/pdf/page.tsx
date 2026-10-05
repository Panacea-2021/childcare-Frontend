'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const PdfFormEditor = dynamic(
  () => import('@/components/modules/enquiries/forms/PdfFormEditor').then((m) => m.PdfFormEditor),
  { ssr: false, loading: () => <div className="shell-loading">Opening PDF editor…</div> },
);

function PdfInner() {
  const params = useSearchParams();
  const file = params.get('file') || 'document.pdf';
  return <PdfFormEditor fileName={file} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="shell-loading">Opening PDF editor…</div>}>
      <PdfInner />
    </Suspense>
  );
}
