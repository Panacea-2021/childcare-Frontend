'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock3,
  Send,
  UserCheck,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

type Props = {
  totalRooms: number;
  completed: number;
  pending: number;
  sent: number;
  attendance: number;
  incidents: number;
};

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let frameId = 0;
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * value));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span className="dr-stat-value">{display}</span>;
}

export function DailyReportsStats(props: Props) {
  const stats: Array<{
    id: string;
    label: string;
    value: number;
    icon: LucideIcon;
    gradient: string;
    tone: string;
  }> = [
    {
      id: 'rooms',
      label: 'Total Rooms',
      value: props.totalRooms,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #5D5FEF 0%, #4B51E0 100%)',
      tone: 'purple',
    },
    {
      id: 'completed',
      label: "Today's Reports Completed",
      value: props.completed,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      tone: 'green',
    },
    {
      id: 'pending',
      label: 'Pending Reports',
      value: props.pending,
      icon: Clock3,
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      tone: 'amber',
    },
    {
      id: 'sent',
      label: 'Reports Sent',
      value: props.sent,
      icon: Send,
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      tone: 'sky',
    },
    {
      id: 'attendance',
      label: "Today's Attendance",
      value: props.attendance,
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
      tone: 'mint',
    },
    {
      id: 'incidents',
      label: "Today's Incidents",
      value: props.incidents,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      tone: 'coral',
    },
  ];

  return (
    <section className="dr-stats" aria-label="Daily report statistics">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.id}
            className={`dr-stat-card pc-tone-${stat.tone}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.04 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5 }}
          >
            <div className="dr-stat-top">
              <span className="dr-stat-label">{stat.label}</span>
              <motion.div
                className="dr-stat-icon"
                style={{ background: stat.gradient }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <Icon size={18} />
              </motion.div>
            </div>
            <AnimatedCounter value={stat.value} />
          </motion.article>
        );
      })}
    </section>
  );
}
