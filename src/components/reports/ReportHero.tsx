'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';
import { ReportsPageHeader } from './ReportsPageHeader';

type Stat = {
  label: string;
  value: string | number;
};

type Props = {
  title?: string;
  subtitle: string;
  stats: Stat[];
};

function ReportHeroBase({
  title = 'Excel Reports',
  subtitle,
  stats,
}: Props) {
  return (
    <section className="rp-hero rp-hero--students">
      <ReportsPageHeader
        title={title}
        description={subtitle}
        icon={<FileSpreadsheet size={22} strokeWidth={2.1} />}
      />

      <div className="rp-hero-stats">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rp-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
          >
            <span className="rp-stat-label">{stat.label}</span>
            <span className="rp-stat-value">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export const ReportHero = memo(ReportHeroBase);
