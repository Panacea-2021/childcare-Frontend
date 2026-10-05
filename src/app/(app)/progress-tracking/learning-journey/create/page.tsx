'use client';

import { Suspense } from 'react';
import { CreateLearningJourneyPage } from '@/components/progress-tracking/CreateLearningJourneyPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-page"><div className="pt-shell">Loading…</div></div>}>
      <CreateLearningJourneyPage />
    </Suspense>
  );
}
