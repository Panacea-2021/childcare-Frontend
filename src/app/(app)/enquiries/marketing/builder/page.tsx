'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AutomationBuilderPage = dynamic(
  () =>
    import('@/components/modules/enquiries/marketing').then((m) => m.AutomationBuilderPage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return (
    <Suspense fallback={<div className="shell-loading">Loading…</div>}>
      <AutomationBuilderPage />
    </Suspense>
  );
}
