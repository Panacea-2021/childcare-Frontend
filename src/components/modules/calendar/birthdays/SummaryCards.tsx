'use client';

import { memo } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Cake, Gift, GraduationCap, Heart, Sparkles } from 'lucide-react';

type Props = {
  todayCount: number;
  upcoming7: number;
  students: number;
  staff: number;
};

const CARDS = [
  {
    key: 'today',
    label: "Today's Birthdays",
    icon: Cake,
    tone: 'today' as const,
    balloon: '✨',
    getValue: (p: Props) => p.todayCount,
  },
  {
    key: 'upcoming',
    label: 'Upcoming Birthdays',
    icon: Gift,
    tone: 'upcoming' as const,
    balloon: '🎁',
    getValue: (p: Props) => p.upcoming7,
  },
  {
    key: 'students',
    label: 'Students',
    icon: GraduationCap,
    tone: 'students' as const,
    balloon: '🎈',
    getValue: (p: Props) => p.students,
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: Heart,
    tone: 'staff' as const,
    balloon: '💜',
    getValue: (p: Props) => p.staff,
  },
];

export const SummaryCards = memo(function SummaryCards(props: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="bc-summary" role="list" aria-label="Birthday summary">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <m.article
                key={card.key}
                className={`bc-sum-card bc-sum-card--${card.tone}`}
                role="listitem"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
                whileHover={{ y: -4, scale: 1.015 }}
              >
                <span className="bc-sum-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <div className="bc-sum-copy">
                  <span>{card.label}</span>
                  <strong>{card.getValue(props)}</strong>
                </div>
                <m.span
                  className="bc-sum-balloon"
                  aria-hidden
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {card.balloon}
                </m.span>
                <m.span
                  className="bc-sum-sparkle"
                  aria-hidden
                  animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Sparkles size={12} />
                </m.span>
              </m.article>
            );
          })}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
});
