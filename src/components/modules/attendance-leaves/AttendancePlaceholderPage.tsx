'use client';

import { motion } from 'framer-motion';
import { CalendarClock, LineChart, UsersRound } from 'lucide-react';
import './attendance-placeholder.css';

type Props = {
  title: string;
  description: string;
  icon: 'staff' | 'ratio' | 'forecast';
};

const ICONS = {
  staff: UsersRound,
  ratio: UsersRound,
  forecast: LineChart,
};

export function AttendancePlaceholderPage({ title, description, icon }: Props) {
  const Icon = ICONS[icon] ?? CalendarClock;
  return (
    <motion.div
      className="att-ph"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="att-ph-card">
        <span className="att-ph-ico">
          <Icon size={28} />
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <em>Coming soon</em>
      </div>
    </motion.div>
  );
}
