'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const CampaignDetailsPage = dynamic(
  () =>
    import('@/components/modules/enquiries/marketing/email-campaigns').then(
      (m) => m.CampaignDetailsPage,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  const params = useParams();
  const id = String(params.id || '');
  return <CampaignDetailsPage campaignId={id} />;
}
