'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Check,
  ClipboardList,
  Eye,
  FileBarChart,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  ENT_CONTROL_DASH,
  ENT_HERO,
  ENT_OCCUPANCY_DASH,
  ENT_RETAIN_DASH,
  ENT_TAB_PANELS,
  ENT_TABS,
  type EntTabIcon,
  type EntTabId,
} from './data';
import { EntReveal } from './EntReveal';
import { floatAnim, pillSpring } from './motion';
import { useCountUp } from '../hero/useCountUp';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS: Record<EntTabIcon, typeof BarChart3> = {
  analysis: BarChart3,
  presence: Eye,
  automated: Bot,
  enrollment: ClipboardList,
  waitlist: ListChecks,
  sites: Building2,
  reports: FileBarChart,
  roles: ShieldCheck,
  engage: MessageSquare,
  compliance: Users,
};

function MetricCount({
  value,
  pad,
  active,
}: {
  value: number;
  pad: number;
  active: boolean;
}) {
  const n = useCountUp(value, active, 1400, 0);
  return <>{String(n).padStart(pad, '0')}</>;
}

function AiMock() {
  return (
    <div className="ent-aiMock">
      <article className="ent-aiProfile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/parent-communication/teacher.jpg"
          alt=""
          width={56}
          height={56}
          loading="lazy"
        />
        <div>
          <strong>Maya Chen</strong>
          <span>Room A · Daily Recap</span>
        </div>
        <em>86</em>
      </article>

      <article className="ent-dashCard ent-aiFeed">
        <header>
          <Sparkles size={14} aria-hidden />
          <strong>Panacea AI</strong>
          <span className="ent-pillLive">Live</span>
        </header>
        <p>
          Maya shared materials twice during free play and invited a peer to join —
          strong social-emotional progress today.
        </p>
        <div className="ent-mockTags">
          <span>Sharing</span>
          <span>Empathy</span>
          <span>Self-regulation</span>
        </div>
        <ul className="ent-aiActivity">
          <li>
            <strong>Observation drafted</strong>
            <span>Creative Curriculum · Domain 1</span>
          </li>
          <li>
            <strong>Parent note ready</strong>
            <span>Review before send</span>
          </li>
          <li>
            <strong>Follow-up queued</strong>
            <span>Director review · 12s</span>
          </li>
        </ul>
      </article>
    </div>
  );
}

function OccupancyMock({ active }: { active: boolean }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, amount: 0.4 });
  const reduced = usePrefersReducedMotion();
  const animate = active && inView && !reduced;
  const maxBar = Math.max(...ENT_OCCUPANCY_DASH.chart.values);

  return (
    <div className="ent-occDash">
      <div className="ent-dashCard ent-occTop">
        <div>
          <strong>Enrollment & Registration</strong>
          <span>Network pipeline · Today</span>
        </div>
        <div className="ent-toast">
          <Bell size={14} aria-hidden />
          <span>{ENT_OCCUPANCY_DASH.notification}</span>
        </div>
      </div>

      <div className="ent-dashCard ent-occFunnel" aria-hidden>
        {ENT_OCCUPANCY_DASH.funnel.map((row) => (
          <div key={row.label} className="ent-occFunnelRow">
            <span>{row.label}</span>
            <i>
              <b
                style={{
                  width: animate ? `${row.value}%` : reduced ? `${row.value}%` : '0%',
                }}
              />
            </i>
          </div>
        ))}
      </div>

      <div className="ent-occMetrics">
        {ENT_OCCUPANCY_DASH.metrics.map((m) => (
          <div key={m.label} className="ent-dashCard ent-occMetric">
            <em>
              <MetricCount value={m.value} pad={m.pad} active={animate} />
            </em>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <div className="ent-dashCard ent-occChart" ref={chartRef}>
        <header>
          <strong>Waitlist & Demand Insights</strong>
          <span>Jan – Jun</span>
        </header>
        <div className="ent-occBars" aria-hidden>
          {ENT_OCCUPANCY_DASH.chart.values.map((v, i) => (
            <div key={ENT_OCCUPANCY_DASH.chart.labels[i]} className="ent-occBarCol">
              <i
                className={animate || reduced ? 'is-on' : ''}
                style={{
                  ['--ent-h' as string]: `${(v / maxBar) * 100}%`,
                  transitionDelay: `${i * 70}ms`,
                }}
              />
              <span>{ENT_OCCUPANCY_DASH.chart.labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlMock() {
  return (
    <div className="ent-ctrlDash">
      <div className="ent-dashCard ent-ctrlHead">
        <div>
          <strong>Multi-Center Management</strong>
          <span>Efficiency · Tuition collection</span>
        </div>
        <div className="ent-toast">
          <Bell size={14} aria-hidden />
          <span>{ENT_CONTROL_DASH.notification}</span>
        </div>
      </div>

      <div className="ent-dashCard ent-ctrlBars" aria-hidden>
        {ENT_CONTROL_DASH.bars.map((row) => (
          <div key={row.label} className="ent-ctrlBarRow">
            <span>{row.label}</span>
            <i>
              <b style={{ width: `${row.value}%` }} />
            </i>
            <em>{row.value}%</em>
          </div>
        ))}
      </div>

      <div className="ent-dashCard ent-permCard">
        <header>
          <strong>Permission Control</strong>
          <span>Role · HQ · Regions · Centers</span>
        </header>
        <div className="ent-permTableWrap">
          <table className="ent-permTable">
            <thead>
              <tr>
                <th>Role</th>
                <th>HQ</th>
                <th>Regions</th>
                <th>Centers</th>
              </tr>
            </thead>
            <tbody>
              {ENT_CONTROL_DASH.permissions.map((row) => (
                <tr key={row.role}>
                  <td>{row.role}</td>
                  <td>
                    {row.hq === false ? (
                      <span className="ent-permDash">—</span>
                    ) : (
                      <span className="ent-permCheck" aria-label="Allowed">
                        <Check size={14} strokeWidth={2.6} />
                      </span>
                    )}
                  </td>
                  <td>
                    {typeof row.regions === 'string' ? (
                      <span className="ent-permChip">{row.regions}</span>
                    ) : row.regions ? (
                      <span className="ent-permCheck" aria-label="Allowed">
                        <Check size={14} strokeWidth={2.6} />
                      </span>
                    ) : (
                      <span className="ent-permDash">—</span>
                    )}
                  </td>
                  <td>
                    {row.centers ? (
                      <span className="ent-permCheck" aria-label="Allowed">
                        <Check size={14} strokeWidth={2.6} />
                      </span>
                    ) : (
                      <span className="ent-permDash">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="ent-permFooter">{ENT_CONTROL_DASH.footer}</footer>
      </div>
    </div>
  );
}

function RetainMock() {
  const donutPct = 80; // 4:1 → majority students
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - donutPct / 100);

  return (
    <div className="ent-retainDash">
      <div className="ent-dashCard ent-retainFeed">
        <header>
          <strong>Parent Engagement</strong>
          <span>Today</span>
        </header>
        <ul>
          {ENT_RETAIN_DASH.feed.map((item) => {
            if (item.type === 'parent') {
              return (
                <li key={item.name} className="ent-retainRow">
                  <span className="ent-retainAvatar" aria-hidden>
                    {item.name.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.meta}</span>
                  </div>
                </li>
              );
            }
            if (item.type === 'meal') {
              return (
                <li key={item.title} className="ent-retainMeal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" width={48} height={48} loading="lazy" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </div>
                </li>
              );
            }
            return (
              <li key={item.title} className="ent-retainMilestone">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="ent-retainSide">
        <div className="ent-dashCard ent-retainDonut">
          <strong>Compliance</strong>
          <div className="ent-donutWrap" aria-hidden>
            <svg viewBox="0 0 96 96" className="ent-donutSvg">
              <circle cx="48" cy="48" r={r} className="ent-donutTrack" />
              <circle
                cx="48"
                cy="48"
                r={r}
                className="ent-donutFill"
                strokeDasharray={c}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="ent-donutLabel">
              <em>4:1</em>
              <span>Ratio</span>
            </div>
          </div>
          <div className="ent-retainCounts">
            <span>
              <b>{ENT_RETAIN_DASH.compliance.ratioStudents}</b> Student
            </span>
            <span>
              <b>{ENT_RETAIN_DASH.compliance.ratioStaff}</b> Staff
            </span>
          </div>
        </div>

        <div className="ent-dashCard ent-retainStat">
          <span>School Readiness</span>
          <em>{ENT_RETAIN_DASH.compliance.readiness}%</em>
          <i>
            <b style={{ width: `${ENT_RETAIN_DASH.compliance.readiness}%` }} />
          </i>
        </div>

        <div className="ent-dashCard ent-retainStat">
          <span>Licensing · {ENT_RETAIN_DASH.compliance.licensing.label}</span>
          <em>{ENT_RETAIN_DASH.compliance.licensing.value}%</em>
          <i>
            <b style={{ width: `${ENT_RETAIN_DASH.compliance.licensing.value}%` }} />
          </i>
        </div>
      </div>
    </div>
  );
}

function MockByTab({ tab, active }: { tab: EntTabId; active: boolean }) {
  switch (tab) {
    case 'occupancy':
      return <OccupancyMock active={active} />;
    case 'control':
      return <ControlMock />;
    case 'retain':
      return <RetainMock />;
    default:
      return <AiMock />;
  }
}

export function EntHero() {
  const reduced = usePrefersReducedMotion();
  const [tab, setTab] = useState<EntTabId>('ai');
  const [mounted, setMounted] = useState(false);
  const panel = ENT_TAB_PANELS[tab];

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  return (
    <div className="ent-hero">
      <EntReveal className="ent-heroInner">
        <h1 className="ent-heroTitle">
          {ENT_HERO.titleBefore}{' '}
          <span className="ent-heroAccent">{ENT_HERO.titleAccent}</span>
        </h1>
      </EntReveal>

      <EntReveal className="ent-tabWrap" delay={0.08}>
        <div className="ent-tabTrack" role="tablist" aria-label="Enterprise focus">
          {ENT_TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`ent-tabBtn${active ? ' is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {active ? (
                  <motion.span
                    className="ent-tabActive"
                    layoutId="enterprise-active-pill"
                    transition={pillSpring}
                    aria-hidden
                  />
                ) : null}
                <span className="ent-tabLabel">{item.label}</span>
              </button>
            );
          })}
        </div>
      </EntReveal>

      <EntReveal className="ent-dashPanel" delay={0.14} amount={0.18}>
        <div className="ent-dashGrid">
          <div className="ent-dashCopySlot">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`copy-${tab}`}
                className="ent-dashCopy"
                initial={reduced ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: 10 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {panel.headline ? <p className="ent-dashHeadline">{panel.headline}</p> : null}
                <ul className="ent-bulletList">
                  {panel.bullets.map((bullet, i) => {
                    const Icon = ICONS[bullet.icon];
                    return (
                      <motion.li
                        key={bullet.title}
                        initial={reduced ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span className="ent-bulletIcon" aria-hidden>
                          <Icon size={18} strokeWidth={2.2} />
                        </span>
                        <div>
                          <strong>{bullet.title}</strong>
                          <p>{bullet.body}</p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
                <Link href={panel.featuresHref} className="ent-textCta">
                  {panel.featuresLabel}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="ent-dashVisual">
            <span className="ent-dashGlow" aria-hidden />
            <motion.div
              className="ent-dashStage"
              {...(live ? floatAnim(2.5, 7.5) : {})}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`mock-${tab}`}
                  className="ent-dashMockLayer"
                  initial={reduced ? false : { opacity: 0, scale: 0.985, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.985, y: -10 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MockByTab tab={panel.mock} active={tab === panel.mock} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </EntReveal>
    </div>
  );
}
