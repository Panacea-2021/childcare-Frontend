'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bell,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Mic,
  Search,
  Sparkles,
  Utensils,
  Users,
  Wallet,
} from 'lucide-react';
import { useCountUp } from './useCountUp';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const NAV = [
  { label: 'Dashboard', active: true },
  { label: 'Attendance', active: false },
  { label: 'Parents', active: false },
  { label: 'Children', active: false },
  { label: 'Teachers', active: false },
  { label: 'Billing', active: false },
  { label: 'Meals', active: false },
  { label: 'Activities', active: false },
];

const FEED = [
  'Emily checked in',
  'Lunch Updated',
  'Parent Message',
  'Payment Received',
  'Attendance Synced',
  'AI Generated Weekly Report',
];

const INSIGHTS = [
  'Attendance increased 12% today',
  '3 invoices ready for review',
  'Parent satisfaction at 98%',
  'Meal planner updated for tomorrow',
];

const FLOATING = [
  { id: 'insight', icon: '🧠', title: 'AI Insight', text: 'Attendance increased today', pos: 'a' },
  { id: 'rev', icon: '📈', title: 'Revenue up', text: '+18%', pos: 'b' },
  { id: 'sat', icon: '😊', title: 'Parent Satisfaction', text: '98%', pos: 'c' },
  { id: 'report', icon: '🤖', title: 'AI Report Ready', text: 'Weekly summary generated', pos: 'd' },
  { id: 'meal', icon: '🍱', title: 'Meal Updated', text: 'Veggies & rice logged', pos: 'e' },
  { id: 'checkin', icon: '👶', title: 'Child Checked In', text: 'Rachel · 8:42 AM', pos: 'f' },
  { id: 'reply', icon: '💬', title: 'Parent replied', text: 'Thanks for the update!', pos: 'g' },
  { id: 'goals', icon: '🎯', title: 'Goals Completed', text: '4 of 5 today', pos: 'h' },
];

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Stable SSR + first client paint — avoids hydration mismatch from Date()
  if (!now) {
    return (
      <time dateTime="--:--">
        --:--
      </time>
    );
  }

  return (
    <time dateTime={now.toISOString()}>
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </time>
  );
}

function AnimatedDonut({
  value,
  label,
  delay,
  active,
}: {
  value: number;
  label: string;
  delay: number;
  active: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const n = useCountUp(value, active, 1400, 0);

  return (
    <div className="phd-donutWrap">
      <svg className="phd-donut" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="28" className="phd-donutTrack" />
        <motion.circle
          cx="36"
          cy="36"
          r="28"
          className="phd-donutArc"
          strokeDasharray={`${2 * Math.PI * 28}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
          animate={
            active
              ? {
                  strokeDashoffset:
                    2 * Math.PI * 28 * (1 - (reduced ? value : n) / 100),
                }
              : undefined
          }
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <strong>{Math.round(reduced && active ? value : n)}%</strong>
      <span>{label}</span>
    </div>
  );
}

function RevenueChart({ active }: { active: boolean }) {
  const points = useMemo(
    () => [28, 42, 38, 55, 48, 62, 58, 74, 68, 82, 76, 90],
    [],
  );
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 220;
      const y = 70 - (p / 100) * 58;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="phd-chart" viewBox="0 0 220 78" aria-hidden="true">
      <defs>
        <linearGradient id="phdRevFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(93,95,239,0.28)" />
          <stop offset="100%" stopColor="rgba(93,95,239,0)" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${path} L220,78 L0,78 Z`}
        fill="url(#phdRevFill)"
        initial={false}
        animate={{ opacity: 1 }}
      />
      <motion.path
        d={path}
        fill="none"
        className="phd-chartLine"
        initial={false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function Heatmap({ active }: { active: boolean }) {
  const cells = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        intensity: ((i * 17) % 5) / 4,
      })),
    [],
  );
  return (
    <div className="phd-heat" aria-hidden="true">
      {cells.map((c, i) => (
        <motion.span
          key={c.id}
          style={{ opacity: 0.25 + c.intensity * 0.75 }}
          initial={{ scale: 0 }}
          animate={active ? { scale: 1 } : undefined}
          transition={{ delay: 0.5 + i * 0.015, type: 'spring', stiffness: 260 }}
        />
      ))}
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="phd-wave" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.span
          key={i}
          animate={
            reduced || !active
              ? { scaleY: 0.4 }
              : { scaleY: [0.35, 1, 0.45, 0.85, 0.35] }
          }
          transition={{
            duration: 1.2,
            delay: i * 0.08,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function HeroDashboard({ ready }: { ready: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [feedIndex, setFeedIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [aiText, setAiText] = useState(
    'Good morning! Occupancy is 94%. Want me to draft parent updates?',
  );
  const fullAi =
    'Good morning! Occupancy is 94%. Want me to draft parent updates?';

  useEffect(() => {
    if (!ready || reduced) {
      setAiText(fullAi);
      setTyping(false);
      return;
    }
    let i = 0;
    setAiText('');
    setTyping(true);
    const id = window.setInterval(() => {
      i += 1;
      setAiText(fullAi.slice(0, i));
      if (i >= fullAi.length) {
        window.clearInterval(id);
        setTyping(false);
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [ready, reduced]);

  useEffect(() => {
    if (!ready || reduced) return;
    const id = window.setInterval(() => {
      setFeedIndex((n) => (n + 1) % FEED.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [ready, reduced]);

  useEffect(() => {
    if (!ready || reduced) return;
    const id = window.setInterval(() => {
      setInsightIndex((n) => (n + 1) % INSIGHTS.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, [ready, reduced]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  };

  const billed = useCountUp(24800, ready, 1600, 0);
  const collected = useCountUp(18420, ready, 1700, 0);
  const outstanding = useCountUp(6380, ready, 1800, 0);
  const occupancy = useCountUp(94, ready, 1400, 0);

  return (
    <div className="ph-visual">
      {FLOATING.map((card, i) => (
        <motion.div
          key={card.id}
          className={`ph-floatCard ph-float-${card.pos}`}
          initial={false}
          animate={{
            opacity: 1,
            scale: 1,
            y: reduced ? 0 : [0, -7, 0],
          }}
          transition={{
            y: {
              delay: 0.6 + i * 0.1,
              duration: 4.5 + (i % 4) * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={reduced ? undefined : { scale: 1.04, y: -4 }}
        >
          <span className="ph-floatIcon" aria-hidden="true">
            {card.icon}
          </span>
          <div>
            <strong>{card.title}</strong>
            <small>{card.text}</small>
          </div>
        </motion.div>
      ))}

      <motion.div
        className="phd-stage"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="phd-glow" aria-hidden="true" />
        <div className="phd-reflection" aria-hidden="true" />

        <div className="phd-shell">
          <aside className="phd-sidebar">
            <div className="phd-brand">
              <span className="phd-brandMark" aria-hidden="true" />
              <strong>Panacea</strong>
            </div>
            {NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`phd-navItem${item.active ? ' is-active' : ''}`}
                tabIndex={-1}
              >
                {item.label}
              </button>
            ))}
          </aside>

          <div className="phd-main">
            <header className="phd-topbar">
              <div>
                <h3>AI Operations Hub</h3>
                <p>Live centre overview</p>
              </div>
              <div className="phd-topActions">
                <span className="phd-search" aria-hidden="true">
                  <Search size={12} />
                  <span>Ask Panacea…</span>
                  <kbd>⌘K</kbd>
                </span>
                <span className="phd-bell" aria-hidden="true">
                  <Bell size={14} />
                  <i />
                </span>
                <span className="phd-clock">
                  <LiveClock />
                </span>
              </div>
            </header>

            <div className="phd-grid">
              <div className="phd-card phd-metricsRow">
                <div>
                  <small>Billed Amount</small>
                  <b>${billed.toLocaleString()}</b>
                </div>
                <div>
                  <small>Collected Amount</small>
                  <b>${collected.toLocaleString()}</b>
                </div>
                <div>
                  <small>Outstanding Amount</small>
                  <b>${outstanding.toLocaleString()}</b>
                </div>
              </div>

              <div className="phd-card phd-revenue">
                <div className="phd-cardHead">
                  <Wallet size={14} aria-hidden="true" />
                  <span>Revenue</span>
                  <em>+18%</em>
                </div>
                <RevenueChart active={ready} />
              </div>

              <div className="phd-card phd-donuts">
                <AnimatedDonut value={72} label="Centre A" delay={0.3} active={ready} />
                <AnimatedDonut value={58} label="Centre B" delay={0.45} active={ready} />
                <AnimatedDonut value={81} label="Centre C" delay={0.6} active={ready} />
              </div>

              <div className="phd-card phd-occupancy">
                <div className="phd-cardHead">
                  <Users size={14} aria-hidden="true" />
                  <span>Today&apos;s Occupancy</span>
                </div>
                <strong>{occupancy}%</strong>
                <div className="phd-barTrack">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={ready ? { width: `${occupancy}%` } : undefined}
                    transition={{ duration: 1.1, delay: 0.4 }}
                  />
                </div>
                <small>Sunny · 72°F</small>
              </div>

              <div className="phd-card phd-heatCard">
                <div className="phd-cardHead">
                  <Activity size={14} aria-hidden="true" />
                  <span>Attendance Heatmap</span>
                </div>
                <Heatmap active={ready} />
              </div>

              <div className="phd-card phd-aiSummary">
                <div className="phd-cardHead">
                  <Brain size={14} aria-hidden="true" />
                  <span>AI Summary</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={insightIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                  >
                    {INSIGHTS[insightIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="phd-card phd-quick">
                <div className="phd-cardHead">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>Quick Actions</span>
                </div>
                <div className="phd-actions">
                  <span>
                    <Calendar size={12} /> Schedule
                  </span>
                  <span>
                    <Utensils size={12} /> Meals
                  </span>
                  <span>
                    <Wallet size={12} /> Invoice
                  </span>
                </div>
              </div>

              <div className="phd-card phd-timeline">
                <div className="phd-cardHead">
                  <Activity size={14} aria-hidden="true" />
                  <span>Live Activity</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={feedIndex}
                    className="phd-feedItem"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Check size={12} aria-hidden="true" />
                    <span>{FEED[feedIndex]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="phd-phone"
          initial={false}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
        >
          <div className="phd-phoneHeader">
            <div className="phd-avatar">R</div>
            <div>
              <strong>Rachel&apos;s Mother</strong>
              <small>Parent Communication</small>
            </div>
          </div>
          <div className="phd-feedBubble">
            <b>Rachel has checked in</b>
            <span>Today · 8:42 AM</span>
          </div>
          <div className="phd-feedBubble">
            <b>Food Update</b>
            <span>Ate well · veggies & rice</span>
            <div className="phd-photoStrip" />
          </div>
          <div className="phd-writeAi">
            <Sparkles size={12} aria-hidden="true" />
            Write with AI
            <ChevronRight size={12} aria-hidden="true" />
          </div>
        </motion.div>

        <motion.div
          className="phd-translate"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          AI Translate to 15+ languages
        </motion.div>

        <motion.div
          className="phd-assistant"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.45 }}
        >
          <div className="phd-assistantOrbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="phd-assistantInner">
            <div className="phd-assistantHead">
              <span className="phd-assistantAvatar" aria-hidden="true">
                <Brain size={16} />
              </span>
              <div>
                <strong>Panacea AI</strong>
                <small>{typing ? 'Thinking…' : 'Online'}</small>
              </div>
              <button type="button" className="phd-mic" tabIndex={-1} aria-hidden="true">
                <Mic size={12} />
              </button>
            </div>
            <p className="phd-assistantText">
              {aiText}
              {typing ? <span className="phd-caret" /> : null}
            </p>
            <Waveform active={ready && typing} />
          </div>
        </motion.div>

        <motion.div
          className="phd-voice"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          aria-hidden="true"
        >
          <Mic size={14} />
          <span>Voice</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
