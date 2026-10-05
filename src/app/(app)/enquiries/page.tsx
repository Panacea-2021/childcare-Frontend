'use client';

import dynamic from 'next/dynamic';

const EnquiriesPage = dynamic(
  () => import('@/components/modules/EnquiriesPage').then((m) => m.EnquiriesPage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading enquiries…</div>,
  },
);

export default function Page() {
  return <EnquiriesPage />;
}
