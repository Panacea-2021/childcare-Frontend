'use client';

import { memo } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Gift, PartyPopper } from 'lucide-react';
import type { BirthdayEntry } from './types';
import { formatBirthdayLabel, initials, upcomingTimeline } from './mockData';

type Props = {
  entries: BirthdayEntry[];
  today: Date;
};

export const UpcomingSidebar = memo(function UpcomingSidebar({ entries, today }: Props) {
  const items = upcomingTimeline(entries, today, 8);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <aside className="bc-side-panel" aria-label="Upcoming birthdays">
          <h3 className="bc-side-title">
            <PartyPopper size={16} aria-hidden />
            Upcoming Birthdays
          </h3>

          {items.length === 0 ? (
            <div className="bc-side-empty">No upcoming birthdays in the next few weeks.</div>
          ) : (
            <div className="bc-timeline">
              {items.map(({ entry, label, days }, i) => (
                <m.div
                  key={entry.id}
                  className="bc-time-item"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <span className="bc-time-dot" aria-hidden>
                    {days === 0 ? '🎉' : <Gift size={11} />}
                  </span>
                  <div className="bc-time-body">
                    <span className="bc-time-label">{label}</span>
                    <div className="bc-time-row">
                      <span
                        className={`bc-avatar bc-avatar--${entry.profileColor}`}
                        aria-hidden
                      >
                        {initials(entry.name)}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong>{entry.name}</strong>
                        <small>
                          {entry.type === 'student'
                            ? entry.room ?? 'Student'
                            : entry.role ?? 'Staff'}{' '}
                          · {formatBirthdayLabel(entry.birthDate)}
                        </small>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </aside>
      </MotionConfig>
    </LazyMotion>
  );
});
