'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, CalendarClock, Megaphone, Hourglass } from 'lucide-react';
import type { SummaryStats } from './types';

type Props = {
  stats: SummaryStats;
};

const CARDS = [
  { key: 'total' as const, label: 'Total Announcements', icon: Megaphone, tone: 'total' },
  { key: 'today' as const, label: "Today's Announcements", icon: CalendarClock, tone: 'today' },
  { key: 'scheduled' as const, label: 'Scheduled', icon: Clock3, tone: 'scheduled' },
  { key: 'delivered' as const, label: 'Delivered', icon: CheckCircle2, tone: 'delivered' },
  { key: 'pending' as const, label: 'Pending', icon: Hourglass, tone: 'pending' },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 18;
    const start = display;
    const delta = value - start;
    if (delta === 0) return;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const t = Math.min(1, frame / steps);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(start + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

export function SummaryCards({ stats }: Props) {
  return (
    <div className="sa-summary" role="list" aria-label="Announcement summary">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.key}
            className={`sa-sum-card sa-sum-card--${card.tone}`}
            role="listitem"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
            whileHover={{ y: -4, scale: 1.015 }}
          >
            <motion.span
              className="sa-sum-icon"
              aria-hidden
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon size={20} strokeWidth={1.85} />
            </motion.span>
            <div className="sa-sum-copy">
              <span>{card.label}</span>
              <strong>
                <AnimatedNumber value={stats[card.key]} />
              </strong>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
