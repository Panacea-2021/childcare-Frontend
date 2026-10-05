'use client';

import dynamic from 'next/dynamic';

const AutomationsPage = dynamic(
  () =>
    import('@/components/modules/enquiries/marketing').then((m) => m.AutomationsPage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading…</div>,
  },
);

export default function Page() {
  return <AutomationsPage />;
}
