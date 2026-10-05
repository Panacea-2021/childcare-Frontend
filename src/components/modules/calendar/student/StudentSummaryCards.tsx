'use client';

import { memo, useEffect, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  Activity,
  Clock3,
  DoorOpen,
  Sparkles,
  Sunrise,
  Users,
} from 'lucide-react';
import type { StudentScheduleStats } from './types';

type Props = StudentScheduleStats;

const CARDS = [
  {
    key: 'total',
    label: 'Total Activities',
    icon: Activity,
    tone: 'total' as const,
    getValue: (p: Props) => p.totalActivities,
    decimals: 0,
  },
  {
    key: 'rooms',
    label: 'Rooms Scheduled',
    icon: DoorOpen,
    tone: 'rooms' as const,
    getValue: (p: Props) => p.roomsScheduled,
    decimals: 0,
  },
  {
    key: 'today',
    label: "Today's Activities",
    icon: Sunrise,
    tone: 'today' as const,
    getValue: (p: Props) => p.todayActivities,
    decimals: 0,
  },
  {
    key: 'hours',
    label: 'Weekly Hours',
    icon: Clock3,
    tone: 'hours' as const,
    getValue: (p: Props) => p.weeklyHours,
    decimals: 1,
  },
  {
    key: 'upcoming',
    label: 'Upcoming Activities',
    icon: Sparkles,
    tone: 'upcoming' as const,
    getValue: (p: Props) => p.upcomingActivities,
    decimals: 0,
  },
  {
    key: 'staff',
    label: 'Active Staff Assigned',
    icon: Users,
    tone: 'staff' as const,
    getValue: (p: Props) => p.activeStaff,
    decimals: 0,
  },
];

function useCountUp(target: number, decimals: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  if (decimals > 0) return value.toFixed(decimals);
  return String(Math.round(value));
}

const CountText = memo(function CountText({
  target,
  decimals,
}: {
  target: number;
  decimals: number;
}) {
  const display = useCountUp(target, decimals);
  return <strong>{display}</strong>;
});

export const StudentSummaryCards = memo(function StudentSummaryCards(props: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="ss-summary" role="list" aria-label="Student schedule summary">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <m.article
                key={card.key}
                className={`ss-sum-card ss-sum-card--${card.tone}`}
                role="listitem"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                whileHover={{ y: -5, scale: 1.015 }}
              >
                <m.span
                  className="ss-sum-icon"
                  aria-hidden
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </m.span>
                <div className="ss-sum-copy">
                  <span>{card.label}</span>
                  <CountText target={card.getValue(props)} decimals={card.decimals} />
                </div>
                <span className="ss-sum-glow" aria-hidden />
              </m.article>
            );
          })}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
});
