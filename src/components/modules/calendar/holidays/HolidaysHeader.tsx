'use client';

import { Sun } from 'lucide-react';
import { CalendarPageHeader } from '../CalendarPageHeader';

export function HolidaysHeader() {
  return (
    <CalendarPageHeader
      title="Staff Holidays"
      description="View and manage staff holidays and leave across your centre."
      icon={<Sun size={22} strokeWidth={2.1} />}
    />
  );
}
