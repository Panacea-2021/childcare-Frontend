'use client';

import { Cake } from 'lucide-react';
import { CalendarPageHeader } from '../CalendarPageHeader';

export function BirthdayHeader() {
  return (
    <CalendarPageHeader
      title="Birthday Calendar"
      description="Celebrate every child's and staff member's special day with a delightful birthday calendar."
      icon={<Cake size={22} strokeWidth={2.1} />}
    />
  );
}
