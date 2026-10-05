'use client';

import { useParams } from 'next/navigation';
import { FormDetailPage } from '@/components/modules/forms/FormDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <FormDetailPage formId={params.id} />;
}
