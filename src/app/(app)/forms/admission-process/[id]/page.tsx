'use client';

import { useParams } from 'next/navigation';
import { AdmissionProcessDetailPage } from '@/components/modules/forms/admission/AdmissionProcessDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <AdmissionProcessDetailPage processId={params.id} />;
}
