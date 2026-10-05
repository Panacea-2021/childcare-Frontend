'use client';

import { Suspense } from 'react';
import { NewsletterEditorPage } from '@/components/parent-communication/newsletters/NewsletterEditorPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="nl-editor">Loading editor…</div>}>
      <NewsletterEditorPage />
    </Suspense>
  );
}
