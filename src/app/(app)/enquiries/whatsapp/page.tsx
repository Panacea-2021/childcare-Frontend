'use client';

import dynamic from 'next/dynamic';

const WhatsAppCampaignsPage = dynamic(
  () =>
    import('@/components/modules/enquiries/whatsapp').then(
      (m) => m.WhatsAppCampaignsPage,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return <WhatsAppCampaignsPage />;
}
