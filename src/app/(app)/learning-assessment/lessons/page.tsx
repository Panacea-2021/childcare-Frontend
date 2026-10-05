'use client';

import dynamic from 'next/dynamic';

const LessonsPage = dynamic(
  () =>
    import('@/components/modules/learning-assessment/lessons/LessonsPage').then(
      (m) => m.LessonsPage,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mod-page" style={{ padding: 24 }}>
        Loading lessons…
      </div>
    ),
  },
);

export default function Page() {
  return <LessonsPage />;
}
