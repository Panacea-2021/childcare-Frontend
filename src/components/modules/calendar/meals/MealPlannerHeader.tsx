'use client';

import { UtensilsCrossed } from 'lucide-react';
import { CalendarPageHeader } from '../CalendarPageHeader';

export function MealPlannerHeader() {
  return (
    <CalendarPageHeader
      title="Meal Planner"
      description="Plan nutritious meals for every day with reusable food items and meal templates."
      icon={<UtensilsCrossed size={22} strokeWidth={2.1} />}
    />
  );
}
