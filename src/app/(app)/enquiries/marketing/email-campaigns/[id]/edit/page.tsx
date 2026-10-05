'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';

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
  const params = useParams();
  const id = String(params.id || '');
  return (
    <Suspense fallback={<div className="shell-loading">Loading…</div>}>
      <CampaignComposerPage campaignId={id} />
    </Suspense>
  );
}
