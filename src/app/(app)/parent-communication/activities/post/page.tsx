'use client';

import { Suspense } from 'react';
import { PostActivityPage } from '@/components/parent-communication/activities/PostActivityPage';
import { PageLoader } from '@/components/ui/loading';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="default" title="Loading post activity…" />}>
      <PostActivityPage />
    </Suspense>
  );
}
