'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AdmissionFillLivePage } from '@/components/modules/forms/admission/AdmissionFillLivePage';

function AdmissionFillContent() {
  const params = useParams<{ id: string }>();
  const processId = decodeURIComponent(params.id ?? '');
  return <AdmissionFillLivePage processId={processId} />;
}

export default function AdmissionFillRoutePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading admission portal…
        </div>
      }
    >
      <AdmissionFillContent />
    </Suspense>
  );
}
