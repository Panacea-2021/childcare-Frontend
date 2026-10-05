'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Parts = { days: number; hours: number; minutes: number; seconds: number; done: boolean; live: boolean };

function calc(targetIso: string, endIso: string): Parts {
  const now = Date.now();
  const start = new Date(targetIso).getTime();
  const end = new Date(endIso).getTime();
  if (now >= start && now < end) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, live: true };
  }
  if (now >= end) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, live: false };
  }
  const diff = Math.max(0, start - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: false, live: false };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function Unit({ label, value }: { label: string; value: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="er-countUnit">
      <div className="er-countBox">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <em>{label}</em>
    </div>
  );
}

type Props = {
  startDateTime: string;
  endDateTime: string;
};

export function ErCountdown({ startDateTime, endDateTime }: Props) {
  const [parts, setParts] = useState(() => calc(startDateTime, endDateTime));

  useEffect(() => {
    setParts(calc(startDateTime, endDateTime));
    const id = window.setInterval(() => setParts(calc(startDateTime, endDateTime)), 1000);
    return () => window.clearInterval(id);
  }, [endDateTime, startDateTime]);

  if (parts.live) {
    return (
      <div className="er-countStatus er-countStatus--live" role="status">
        Event is live
      </div>
    );
  }
  if (parts.done) {
    return (
      <div className="er-countStatus" role="status">
        Event has ended
      </div>
    );
  }

  return (
    <div className="er-countdown" aria-live="polite" aria-label="Countdown to webinar">
      <p className="er-countLabel">Webinar starts in</p>
      <div className="er-countGrid">
        <Unit label="Days" value={pad(parts.days)} />
        <Unit label="Hours" value={pad(parts.hours)} />
        <Unit label="Minutes" value={pad(parts.minutes)} />
        <Unit label="Seconds" value={pad(parts.seconds)} />
      </div>
    </div>
  );
}
