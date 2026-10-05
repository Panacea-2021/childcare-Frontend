'use client';

import { memo, useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/components/app/dashboard/useCountUp';
import type { EnquiryStat } from './types';
import { staggerContainer, staggerItem, cardHover } from './animations';

type CardProps = {
  stat: EnquiryStat;
  animate: boolean;
};

const EnquiryStatCard = memo(function EnquiryStatCard({ stat, animate }: CardProps) {
  const count = useCountUp(stat.count, 900, animate);
  const down = stat.trend.trim().startsWith('-');
  const Icon = stat.Icon;

  return (
    <motion.article
      className={`enq-stat enq-stat-${stat.tone}`}
      style={
        stat.color
          ? ({ ['--enq-stat-accent' as string]: stat.color } as CSSProperties)
          : undefined
      }
      variants={staggerItem}
      whileHover={cardHover}
    >
      <div className="enq-stat-inner">
        <div className="enq-stat-top">
          <span className="enq-stat-icon" aria-hidden>
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className={`enq-stat-trend${down ? ' is-down' : ''}`}>{stat.trend}</span>
        </div>
        <p className="enq-stat-label">{stat.label}</p>
        <p className="enq-stat-value">{count}</p>
        <p className="enq-stat-sub">{stat.subtitle}</p>
      </div>
    </motion.article>
  );
});

type Props = {
  stats: EnquiryStat[];
};

export const EnquiryStats = memo(function EnquiryStats({ stats }: Props) {
  const items = useMemo(() => stats, [stats]);

  return (
    <motion.div
      className="enq-stats"
      role="list"
      aria-label="Enquiry statistics"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {items.map((stat) => (
        <EnquiryStatCard key={stat.id} stat={stat} animate />
      ))}
    </motion.div>
  );
});
