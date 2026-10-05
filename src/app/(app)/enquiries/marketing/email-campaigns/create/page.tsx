'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CampaignComposerPage = dynamic(
  () =>
    import('@/components/modules/enquiries/marketing/email-campaigns').then(
      (m) => m.CampaignComposerPage,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return (
    <Suspense fallback={<div className="shell-loading">Loading…</div>}>
      <CampaignComposerPage />
    </Suspense>
  );
}
