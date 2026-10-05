'use client';

import dynamic from 'next/dynamic';

const FacebookIntegrationPage = dynamic(
  () =>
    import('@/components/modules/enquiries/facebook').then(
      (m) => m.FacebookIntegrationPage,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return <FacebookIntegrationPage />;
}
