'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, CalendarPlus } from 'lucide-react';
import { CalendarPageHeader } from '../CalendarPageHeader';

type Props = {
  onAdd: () => void;
};

export function SchoolCalendarHeader({ onAdd }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <CalendarPageHeader
          title="School Calendar"
          description="Manage school events, holidays, celebrations and important dates beautifully."
          icon={<CalendarDays size={22} strokeWidth={2.1} />}
          actions={
            <m.button
              type="button"
              className="cal-btn-add"
              onClick={onAdd}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Add event"
            >
              <span className="cal-btn-save-shine" aria-hidden />
              <CalendarPlus size={16} aria-hidden />
              Add Event
            </m.button>
          }
        />
      </MotionConfig>
    </LazyMotion>
  );
}
