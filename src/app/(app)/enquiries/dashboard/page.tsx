'use client';

import dynamic from 'next/dynamic';

const EnquiriesOverviewDashboard = dynamic(
  () =>
    import('@/components/modules/enquiries/dashboard').then(
      (m) => m.EnquiriesOverviewDashboard,
    ),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return <EnquiriesOverviewDashboard />;
}
