'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, MailX, Smartphone } from 'lucide-react';

type Summary = {
  installed: number;
  pending: number;
  invitationsSent: number;
  invitationsNotSent: number;
  installRate: number;
};

type Props = {
  summary: Summary;
  loading?: boolean;
};

export function SummaryCards({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="pai-summary-grid pai-summary-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pai-skel pai-skel-card" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: 'installed',
      title: 'Installed Staff',
      count: summary.installed,
      subtitle: 'Successful app signup / login',
      accent: 'green',
      icon: <Smartphone size={18} />,
      ring: true,
    },
    {
      key: 'pending',
      title: 'Pending Installation',
      count: summary.pending,
      subtitle: 'Not yet installed',
      accent: 'orange',
      icon: <Briefcase size={18} />,
    },
    {
      key: 'sent',
      title: 'Invitations Sent',
      count: summary.invitationsSent,
      subtitle: 'Staff invited',
      accent: 'blue',
      icon: <Mail size={18} />,
    },
    {
      key: 'not_sent',
      title: 'Invitations Not Sent',
      count: summary.invitationsNotSent,
      subtitle: 'Awaiting invitation',
      accent: 'pink',
      icon: <MailX size={18} />,
    },
  ] as const;

  return (
    <div className="pai-summary-grid pai-summary-4" role="region" aria-label="Staff installation summary">
      {cards.map((card, i) => (
        <motion.article
          key={card.key}
          className={`pai-stat-card pai-accent-${card.accent}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="pai-stat-top">
            <motion.span
              className="pai-stat-icon"
              aria-hidden
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            >
              {card.icon}
            </motion.span>
            {'ring' in card && card.ring ? <ProgressRing value={summary.installRate} /> : null}
          </div>
          <p className="pai-stat-title">{card.title}</p>
          <p className="pai-stat-count">
            <AnimatedCount value={card.count} />
          </p>
          <p className="pai-stat-sub">{card.subtitle}</p>
        </motion.article>
      ))}
    </div>
  );
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 18;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((value * frame) / steps));
      if (frame >= steps) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [value]);

  return <>{display}</>;
}

function ProgressRing({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg className="pai-ring" viewBox="0 0 72 72" aria-hidden>
      <circle className="pai-ring-track" cx="36" cy="36" r={r} />
      <motion.circle
        className="pai-ring-value"
        cx="36"
        cy="36"
        r={r}
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
      />
      <text x="36" y="40" textAnchor="middle" className="pai-ring-text">
        {value}%
      </text>
    </svg>
  );
}
