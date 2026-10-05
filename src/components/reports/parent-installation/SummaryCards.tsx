'use client';

import CountUp from 'react-countup';
import { m, useReducedMotion } from 'framer-motion';
import { Mail, MailX, Smartphone, UserRound } from 'lucide-react';

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
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <div className="pai-summary-grid pai-summary-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pai-skel pai-skel-card animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: 'installed',
      title: 'Installed Parents',
      count: summary.installed,
      subtitle: 'Successful app signup / login',
      accent: 'green',
      icon: <Smartphone size={18} />,
      ring: true,
    },
    {
      key: 'pending',
      title: 'Pending Installations',
      count: summary.pending,
      subtitle: 'Not yet installed',
      accent: 'orange',
      icon: <UserRound size={18} />,
    },
    {
      key: 'sent',
      title: 'Invitations Sent',
      count: summary.invitationsSent,
      subtitle: 'Parents invited',
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
    <div className="pai-summary-grid pai-summary-4" role="region" aria-label="Installation summary">
      {cards.map((card, index) => (
        <m.div
          key={card.key}
          className={`pai-stat-card pai-accent-${card.accent}`}
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { delay: index * 0.08, duration: 0.45, ease: 'easeOut' }
          }
          whileHover={
            reduce
              ? undefined
              : {
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.18 },
                }
          }
        >
          <div className="pai-stat-top">
            <span className="pai-stat-icon" aria-hidden>
              {card.icon}
            </span>
            {'ring' in card && card.ring ? <ProgressRing value={summary.installRate} /> : null}
          </div>
          <p className="pai-stat-title">{card.title}</p>
          <p className="pai-stat-count">
            {reduce ? (
              card.count
            ) : (
              <CountUp start={0} end={card.count} duration={1} enableScrollSpy={false} />
            )}
          </p>
          <p className="pai-stat-sub">{card.subtitle}</p>
        </m.div>
      ))}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg className="pai-ring" viewBox="0 0 72 72" aria-hidden>
      <circle className="pai-ring-track" cx="36" cy="36" r={r} />
      <m.circle
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
