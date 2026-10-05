'use client';

import dynamic from 'next/dynamic';

const EmailCampaignsPage = dynamic(
  () =>
    import('@/components/modules/enquiries/marketing/email-campaigns').then(
      (m) => m.EmailCampaignsPage,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return <EmailCampaignsPage />;
}
