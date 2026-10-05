'use client';

import { memo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ScheduleShift, ScheduleStaff } from './types';

type Props = {
  person: ScheduleStaff;
  hoursLabel: string;
  shiftCount: number;
};

function useCountUp(target: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 520;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);
  return value;
}

function StaffSidebarInner({ person, hoursLabel, shiftCount }: Props) {
  const reduce = useReducedMotion();
  const count = useCountUp(shiftCount, !reduce);

  return (
    <div className="cal-staff-card">
      <motion.div
        className="cal-avatar-wrap"
        whileHover={reduce ? undefined : { y: -3, scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      >
        <div className={`cal-avatar ${person.tone}`} aria-hidden>
          {person.initials}
        </div>
        <motion.span
          className={`cal-online ${person.online ? '' : 'is-offline'}`}
          aria-label={person.online ? 'Online' : 'Offline'}
          animate={
            reduce || !person.online
              ? undefined
              : {
                  scale: [1, 1.25, 1],
                  boxShadow: [
                    '0 0 0 2px rgba(61,122,85,0.15)',
                    '0 0 0 5px rgba(61,122,85,0.08)',
                    '0 0 0 2px rgba(61,122,85,0.15)',
                  ],
                }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <div className="cal-staff-meta">
        <h3>{person.name}</h3>
        <p>{person.role}</p>
        <div className="cal-staff-stats">
          {hoursLabel} · {count} {shiftCount === 1 ? 'Shift' : 'Shifts'}
        </div>
      </div>
    </div>
  );
}

export const StaffSidebar = memo(StaffSidebarInner);

export type { ScheduleStaff, ScheduleShift };
