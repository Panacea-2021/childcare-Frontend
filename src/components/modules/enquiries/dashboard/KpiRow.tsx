'use client';

import { memo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FolderOpen,
  Inbox,
  ListTodo,
  Megaphone,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
} from 'lucide-react';
import { useCountUp } from '@/components/app/dashboard/useCountUp';
import { staggerContainer, staggerItem } from '../animations';
import type { DashboardKpi } from './types';

const ICONS = {
  inbox: Inbox,
  folderOpen: FolderOpen,
  checkCircle: CheckCircle2,
  listTodo: ListTodo,
  zap: Zap,
  megaphone: Megaphone,
} as const;

const SPARK_COLORS: Record<DashboardKpi['tone'], string> = {
  pink: '#ED70A8',
  purple: '#5D5FEF',
  green: '#3D7A55',
  coral: '#EC4899',
  lavender: '#8B5CF6',
  mint: '#059669',
};

function MiniSpark({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const w = 56;
  const h = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="edash-kpi-spark">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        opacity={0.85}
      />
    </svg>
  );
}

function KpiCard({ kpi, animate, index }: { kpi: DashboardKpi; animate: boolean; index: number }) {
  const count = useCountUp(kpi.value, 900, animate);
  const Icon = ICONS[kpi.icon];
  const TrendIcon =
    kpi.trendDirection === 'down' ? TrendingDown : kpi.trendDirection === 'up' ? TrendingUp : Minus;
  const display =
    kpi.displayValue && kpi.displayValue.includes('K')
      ? kpi.displayValue
      : kpi.value >= 1000
        ? count.toLocaleString('en-IN')
        : String(count);

  const style = { '--dash-stagger': `${index * 70}ms` } as CSSProperties;

  return (
    <motion.article
      className={`edash-kpi edash-kpi-${kpi.tone}`}
      style={style}
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className="edash-kpi-left">
        <div className="edash-kpi-left-top">
          <span className="edash-kpi-icon" aria-hidden>
            <Icon size={18} strokeWidth={2.25} />
          </span>
          <span className={`edash-kpi-trend is-${kpi.trendDirection}`}>
            <TrendIcon size={11} aria-hidden />
            {kpi.trend}
          </span>
        </div>
        <div className="edash-kpi-copy">
          <span className="edash-kpi-label">{kpi.label}</span>
          <span className="edash-kpi-support">{kpi.support}</span>
        </div>
        <MiniSpark values={kpi.sparkline} color={SPARK_COLORS[kpi.tone]} />
      </div>
      <div className="edash-kpi-right">
        <strong>{display}</strong>
      </div>
    </motion.article>
  );
}

export const KpiRow = memo(function KpiRow({
  items,
  animate,
}: {
  items: DashboardKpi[];
  animate: boolean;
}) {
  return (
    <motion.div
      className="edash-kpi-row"
      role="list"
      aria-label="Enquiry key metrics"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {items.map((kpi, index) => (
        <div key={kpi.id} role="listitem">
          <KpiCard kpi={kpi} animate={animate} index={index} />
        </div>
      ))}
    </motion.div>
  );
});
