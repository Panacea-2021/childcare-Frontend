'use client';

import { use } from 'react';
import { EditLessonPage } from '@/components/progress-tracking/EditLessonPage';

type Props = {
  params: Promise<{ lessonId: string }>;
};

export default function Page({ params }: Props) {
  const { lessonId } = use(params);
  return <EditLessonPage lessonId={decodeURIComponent(lessonId)} />;
}
