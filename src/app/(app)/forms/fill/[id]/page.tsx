'use client';

import { useParams } from 'next/navigation';
import { FormPreviewLivePage } from '@/components/modules/forms/FormPreviewLivePage';

export default function FormFillPage() {
  const params = useParams<{ id: string }>();
  const formId = decodeURIComponent(params.id ?? '');
  return <FormPreviewLivePage formId={formId} mode="fill" />;
}
