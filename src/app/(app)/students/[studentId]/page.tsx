'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const StudentProfilePage = dynamic(
  () =>
    import('@/components/modules/student-profile').then((m) => m.StudentProfilePage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading student profile…</div>,
  },
);

export default function Page() {
  const params = useParams<{ studentId: string }>();
  return <StudentProfilePage studentId={params.studentId} />;
}
