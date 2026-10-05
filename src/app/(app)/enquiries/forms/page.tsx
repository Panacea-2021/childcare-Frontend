'use client';

import dynamic from 'next/dynamic';

const StudentFormsPage = dynamic(
  () => import('@/components/modules/enquiries/forms/StudentFormsPage').then((m) => m.StudentFormsPage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading student forms…</div>,
  },
);

export default function Page() {
  return <StudentFormsPage />;
}
