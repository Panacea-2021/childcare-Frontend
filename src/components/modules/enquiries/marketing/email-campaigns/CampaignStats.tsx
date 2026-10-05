'use client';

import type { CSSProperties, ReactNode } from 'react';
import { CalendarClock, FileEdit, Mail, MousePointerClick, Send, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/components/app/dashboard/useCountUp';

type Props = {
  total: number;
  sent: number;
  scheduled: number;
  drafts: number;
  recipients?: number;
  avgOpen?: number;
  avgClick?: number;
};

type Tone = 'pink' | 'purple' | 'green' | 'coral' | 'mint' | 'peach';

type Card = {
  id: string;
  label: string;
  hint: string;
  value: number;
  suffix?: string;
  format?: 'number' | 'percent';
  icon: ReactNode;
  tone: Tone;
};

function AnimatedValue({
  value,
  format = 'number',
  suffix = '',
}: {
  value: number;
  format?: 'number' | 'percent';
  suffix?: string;
}) {
  const n = useCountUp(value, 900, true);
  if (format === 'percent') return <>{n}%</>;
  return (
    <>
      {n.toLocaleString()}
      {suffix}
    </>
  );
}

export function CampaignStats({
  total,
  sent,
  scheduled,
  drafts,
  recipients,
  avgOpen,
  avgClick,
}: Props) {
  const primary: Card[] = [
    {
      id: 'total',
      label: 'Total Campaigns',
      hint: 'All time',
      value: total,
      icon: <Mail size={20} />,
      tone: 'purple',
    },
    {
      id: 'sent',
      label: 'Sent',
      hint: 'Delivered',
      value: sent,
      icon: <Send size={20} />,
      tone: 'green',
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      hint: 'Upcoming',
      value: scheduled,
      icon: <CalendarClock size={20} />,
      tone: 'peach',
    },
    {
      id: 'drafts',
      label: 'Drafts',
      hint: 'In progress',
      value: drafts,
      icon: <FileEdit size={20} />,
      tone: 'pink',
    },
  ];

  const secondary: Card[] =
    recipients !== undefined
      ? [
          {
            id: 'recipients',
            label: 'Total Recipients',
            hint: 'Across campaigns',
            value: recipients,
            icon: <Users size={20} />,
            tone: 'coral',
          },
          {
            id: 'open',
            label: 'Average Open Rate',
            hint: 'Sent campaigns',
            value: avgOpen ?? 0,
            format: 'percent',
            icon: <Mail size={20} />,
            tone: 'mint',
          },
          {
            id: 'click',
            label: 'Average Click Rate',
            hint: 'Sent campaigns',
            value: avgClick ?? 0,
            format: 'percent',
            icon: <MousePointerClick size={20} />,
            tone: 'purple',
          },
        ]
      : [];

  return (
    <div className="ec-kpi-stack">
      <div className="ec-kpi-row" role="list" aria-label="Campaign statistics">
        {primary.map((item, index) => (
          <KpiCard key={item.id} item={item} index={index} />
        ))}
      </div>
      {secondary.length > 0 ? (
        <div className="ec-kpi-row ec-kpi-row-3" role="list" aria-label="Campaign analytics">
          {secondary.map((item, index) => (
            <KpiCard key={item.id} item={item} index={index + 4} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ item, index }: { item: Card; index: number }) {
  const style = { '--ec-stagger': `${index * 70}ms` } as CSSProperties;

  return (
    <motion.article
      className={`ec-kpi-card ec-kpi-${item.tone}`}
      style={style}
      role="listitem"
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className="ec-kpi-left">
        <span className="ec-kpi-icon" aria-hidden>
          {item.icon}
        </span>
        <div className="ec-kpi-copy">
          <span className="ec-kpi-label">{item.label}</span>
          <span className="ec-kpi-hint">{item.hint}</span>
        </div>
      </div>
      <div className="ec-kpi-right">
        <strong>
          <AnimatedValue value={item.value} format={item.format} suffix={item.suffix} />
        </strong>
      </div>
    </motion.article>
  );
}
