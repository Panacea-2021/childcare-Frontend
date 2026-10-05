'use client';

import { Suspense } from 'react';
import { ActivitySettingsPage } from '@/components/parent-communication/activities/settings/ActivitySettingsPage';
import { PageLoader } from '@/components/ui/loading';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader context="default" title="Loading activity settings…" />}>
      <ActivitySettingsPage />
    </Suspense>
  );
}
