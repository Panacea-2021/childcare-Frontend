'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormBuilder } from '@/components/modules/forms/FormBuilder';
import { PageLoader } from '@/components/ui/loading';

function BuilderInner() {
  const params = useSearchParams();
  const title = params.get('title') || 'New Form';
  const audience = params.get('audience') || undefined;
  const formId = params.get('id') || undefined;
  const mode = params.get('mode') === 'preview' ? 'preview' : 'build';
  return (
    <FormBuilder initialTitle={title} audience={audience} formId={formId} initialMode={mode} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="forms" />}>
      <BuilderInner />
    </Suspense>
  );
}
