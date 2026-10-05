'use client';

import { memo } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import type { BirthdayEntry } from './types';
import { firstName, initials } from './mockData';

type Props = {
  todays: BirthdayEntry[];
};

export const TodayCelebration = memo(function TodayCelebration({ todays }: Props) {
  if (todays.length === 0) return null;

  const names = todays.map((t) => firstName(t.name));
  const title =
    names.length === 1
      ? `Happy Birthday ${names[0]}!`
      : names.length === 2
        ? `Happy Birthday ${names[0]} & ${names[1]}!`
        : `Happy Birthday ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}!`;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="bc-celebrate"
          aria-label="Today's celebration"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bc-celebrate-art" aria-hidden>
            <m.div
              className="bc-celebrate-icon"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PartyPopper size={28} strokeWidth={1.6} />
            </m.div>
          </div>

          <div className="bc-celebrate-copy">
            <h2>{title}</h2>
            <p>We wish you a joyful year filled with learning, happiness and smiles.</p>
            {todays.length > 1 ? (
              <div className="bc-avatar-stack" aria-label={`${todays.length} birthdays today`}>
                {todays.slice(0, 5).map((t) => (
                  <span
                    key={t.id}
                    className={`bc-avatar bc-avatar--lg bc-avatar--${t.profileColor}`}
                    title={t.name}
                  >
                    {initials(t.name)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="bc-celebrate-balloons" aria-hidden>
            <m.span animate={{ y: [0, -10, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>
              🎈
            </m.span>
            <m.span
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, delay: 0.3 }}
            >
              ✨
            </m.span>
            <m.span
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.6 }}
            >
              🎁
            </m.span>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
});
