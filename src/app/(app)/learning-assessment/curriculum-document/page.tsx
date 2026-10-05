'use client';

import dynamic from 'next/dynamic';

const CurriculumDocumentsPage = dynamic(
  () =>
    import('@/components/modules/learning-assessment/curriculum-document').then(
      (m) => m.CurriculumDocumentsPage,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mod-page" style={{ padding: 24 }}>
        Loading curriculum documents…
      </div>
    ),
  },
);

export default function Page() {
  return <CurriculumDocumentsPage />;
}
