'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const MealPlannerPage = dynamic(
  () =>
    import('@/components/modules/calendar/meals/MealPlannerPage').then((m) => m.MealPlannerPage),
  {
    ssr: false,
    loading: () => <PageLoader context="calendar" title="Loading meal planner…" />,
  },
);

export default function Page() {
  return <MealPlannerPage />;
}
