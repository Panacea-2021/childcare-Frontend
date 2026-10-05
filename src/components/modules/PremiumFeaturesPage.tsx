'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Bus,
  Camera,
  CheckCircle2,
  Clock3,
  Crown,
  Info,
  Sparkles,
  Wand2,
} from 'lucide-react';
import '@/components/ui/module.css';
import './premium-features.css';

const SECTIONS = [
  { id: 'payment', label: 'Payment Integrations' },
  { id: 'ai', label: 'Leverage AI' },
  { id: 'accounting', label: 'Accounting Tools' },
  { id: 'learning', label: 'Learning And Assessment' },
  { id: 'marketing', label: 'Marketing Features' },
  { id: 'multi', label: 'Multi-center Management' },
  { id: 'safety', label: 'Safety And Security' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const PAYMENT_LOGOS = [
  { name: 'RinggitPay', tone: 't-blue' },
  { name: 'Gusto', tone: 't-red' },
  { name: 'CCAvenue', tone: 't-teal' },
  { name: 'PayPal', tone: 't-paypal' },
  { name: 'PAYCHEX', tone: 't-blue' },
  { name: '2C2P', tone: 't-green' },
  { name: 'stripe', tone: 't-stripe' },
  { name: 'Easebuzz', tone: 't-navy' },
  { name: 'Tally', tone: '' },
  { name: 'ORACLE NetSuite', tone: '' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function FloatCard({
  children,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      style={style}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay, ease }}
    >
      <div
        className={`${className ?? 'pf-floatCard'}${reduce ? '' : ' pf-floatAnim'}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </div>
    </motion.div>
  );
}

export function PremiumFeaturesPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<SectionId>('payment');
  const [toast, setToast] = useState<string | null>(null);
  const scrollingRef = useRef(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(`pf-${s.id}`)).filter(
      Boolean
    ) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const id = visible.target.id.replace('pf-', '') as SectionId;
        setActive(id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.4, 0.6] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: SectionId) => {
    setActive(id);
    scrollingRef.current = true;
    const el = document.getElementById(`pf-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 700);
  };

  return (
    <div className="mod-page pf-page" style={{ perspective: 1200 }}>
      <motion.nav
        className="pf-crumbs"
        aria-label="Breadcrumb"
        initial={reduce ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <span>Panacea</span>
        <span className="pf-crumbsSep" aria-hidden>
          {'>>'}
        </span>
        <strong>Premium features</strong>
      </motion.nav>

      <motion.div
        className="pf-titleRow"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.04, ease }}
      >
        <button
          type="button"
          className="pf-backBtn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 className="pf-pageTitle">
          Premium Features
          <span className="pf-infoHint" title="Upgrade options available with sales">
            <Info size={16} aria-hidden />
          </span>
        </h1>
      </motion.div>

      <motion.div
        className="pf-banner"
        initial={reduce ? false : { opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.08, ease }}
      >
        <span className="pf-bannerShine" aria-hidden />
        <span className="pf-bannerIcon" aria-hidden>
          <Crown size={20} />
        </span>
        <p className="pf-bannerText">
          Book a meeting with our sales team to get a demo or upgrade to premium features today!
        </p>
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          onClick={() => setToast('Sales request noted (UI mock).')}
        >
          Contact Sales
        </motion.button>
      </motion.div>

      <motion.div
        className="pf-tabsRow"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease }}
      >
        <LayoutGroup id="pf-tabs">
          <div className="pf-tabs" role="tablist" aria-label="Premium feature sections">
            {SECTIONS.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`pf-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => goTo(item.id)}
                >
                  {isActive ? (
                    <motion.span
                      className="pf-tabPill"
                      layoutId="pf-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                    />
                  ) : null}
                  <span className="pf-tabLabel">{item.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </motion.div>

      <div className="pf-sections">
        <section id="pf-payment" className="pf-section" aria-labelledby="pf-payment-title">
          <Reveal>
            <h2 id="pf-payment-title" className="pf-sectionTitle">
              Payment Integrations
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="pf-card">
              <div className="pf-logoStrip">
                {PAYMENT_LOGOS.map((logo, i) => (
                  <motion.span
                    key={logo.name}
                    className={`pf-logoChip ${logo.tone}`.trim()}
                    initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: i * 0.04, ease }}
                    whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
                  >
                    {logo.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="pf-ai" className="pf-section" aria-labelledby="pf-ai-title">
          <Reveal>
            <h2 id="pf-ai-title" className="pf-sectionTitle">
              AI Writing Assistant
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="pf-card pf-cardPad">
              <div className="pf-split">
                <div>
                  <span className="pf-badge">AI Features</span>
                  <p className="pf-lead">
                    Improve communication and connect with parents effortlessly using AI-powered
                    tools.
                  </p>
                  <ul className="pf-bullets">
                    <li>
                      Instantly improve grammar and tone for polished, professional communication.
                    </li>
                    <li>
                      Leverage AI to craft messages that align with your intent and engage
                      meaningfully.
                    </li>
                    <li>Communicate seamlessly with parents in their preferred language.</li>
                  </ul>
                </div>
                <div className="pf-visual">
                  <span className="pf-aiGlow" aria-hidden>
                    <Wand2 size={18} />
                    AI
                  </span>
                  <FloatCard style={{ alignSelf: 'flex-start', maxWidth: 210 }} delay={0.1}>
                    <strong>Translate</strong>
                    <div style={{ marginTop: 6 }}>Hello, Alex.</div>
                    <div style={{ marginTop: 4, color: 'var(--color-accent)' }}>
                      Spanish: Hola, Alex.
                    </div>
                  </FloatCard>
                  <FloatCard style={{ alignSelf: 'flex-end', maxWidth: 250 }} delay={0.25}>
                    <strong>Enter your text</strong>
                    <div className="pf-toneTags">
                      <span className="pf-toneTag">Write exciting</span>
                      <span className="pf-toneTag">Friendly tone</span>
                      <span className="pf-toneTag">Rephrase</span>
                      <span className="pf-toneTag">Shorten</span>
                      <span className="pf-toneTag">Expand</span>
                    </div>
                  </FloatCard>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="pf-accounting" className="pf-section" aria-labelledby="pf-accounting-title">
          <Reveal>
            <h2 id="pf-accounting-title" className="pf-sectionTitle">
              Accounting Tools
            </h2>
          </Reveal>
          <div className="pf-grid2">
            <Reveal delay={0.04}>
              <article className="pf-miniCard">
                <span className="pf-badge">Xero Integration</span>
                <p className="pf-lead">
                  Sync invoices, payments, and ledgers with Xero for cleaner books and faster
                  month-end close.
                </p>
                <span className="pf-miniIcon" aria-hidden>
                  X
                </span>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="pf-miniCard">
                <span className="pf-badge">QuickBooks Integration</span>
                <p className="pf-lead">
                  Connect QuickBooks to automate fee posting, reconciliation, and expense tracking.
                </p>
                <span className="pf-miniIcon" aria-hidden>
                  qb
                </span>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="pf-learning" className="pf-section" aria-labelledby="pf-learning-title">
          <Reveal>
            <h2 id="pf-learning-title" className="pf-sectionTitle">
              Learning And Assessment
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="pf-card pf-cardPad">
              <div className="pf-split">
                <div>
                  <span className="pf-badge">Student Assessment Framework</span>
                  <p className="pf-lead">
                    Capture observations, milestones, and portfolios in one assessment workspace
                    built for early years teams.
                  </p>
                  <ul className="pf-bullets">
                    <li>Record real-time observations linked to learning goals.</li>
                    <li>Generate milestone reports parents can understand at a glance.</li>
                    <li>Build media-rich digital portfolios for every student.</li>
                  </ul>
                </div>
                <div className="pf-visual" style={{ gap: 10 }}>
                  <FloatCard className="pf-mockTable" delay={0.08}>
                    <strong style={{ color: '#111827' }}>Progress report</strong>
                    <table>
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Term 1</th>
                          <th>Term 2</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Literacy</td>
                          <td>Beginner</td>
                          <td>Developing</td>
                        </tr>
                        <tr>
                          <td>Motor</td>
                          <td>Developing</td>
                          <td>Expert</td>
                        </tr>
                      </tbody>
                    </table>
                  </FloatCard>
                  <FloatCard delay={0.2}>
                    <strong>Digital Portfolio</strong>
                    <div style={{ marginTop: 6 }}>Weekly highlights · photos · notes</div>
                  </FloatCard>
                  <FloatCard delay={0.32}>
                    <strong>AI Lesson Plan</strong>
                    <div style={{ marginTop: 6 }}>MON Singing · TUE Art · WED Outdoor play</div>
                  </FloatCard>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="pf-marketing" className="pf-section" aria-labelledby="pf-marketing-title">
          <Reveal>
            <h2 id="pf-marketing-title" className="pf-sectionTitle">
              Marketing Features
            </h2>
          </Reveal>
          <div className="pf-grid2">
            <Reveal delay={0.04}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">Tour Management</span>
                <p className="pf-lead">
                  Simplify school tours with smart scheduling and increase school visits for higher
                  admissions.
                </p>
                <ul className="pf-bullets">
                  <li>Share availability and let parents book tours at their convenience.</li>
                  <li>Automatically assign tours to staff or rotate schedules.</li>
                </ul>
                <div className="pf-visual" style={{ marginTop: 14, minHeight: 180 }}>
                  <div className="pf-kanban">
                    <div className="pf-kanbanCol blue">
                      <h4>Tours Booked</h4>
                      <div className="pf-bar" />
                      <div className="pf-bar y" />
                    </div>
                    <div className="pf-kanbanCol violet">
                      <h4>Toured</h4>
                      <div className="pf-bar g" />
                    </div>
                    <div className="pf-kanbanCol mint">
                      <h4>Interested</h4>
                      <div className="pf-bar" />
                    </div>
                  </div>
                  <FloatCard delay={0.15}>
                    <strong>Matilda John</strong> with Jackson James · 11:30am–12:00pm
                  </FloatCard>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.1}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">Facebook Integration</span>
                <p className="pf-lead">
                  Turn Facebook leads into admission enquiries. Automatically fetch leads from your
                  ads and convert them into student enquiries.
                </p>
                <div
                  className="pf-visual"
                  style={{ marginTop: 14, minHeight: 180, alignItems: 'center' }}
                >
                  <FloatCard delay={0.12}>
                    <Bell size={14} style={{ display: 'inline', marginRight: 6 }} />
                    <strong>5 new leads from Facebook</strong> today
                  </FloatCard>
                  <motion.button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    style={{ height: 34, minHeight: 34, fontSize: '0.8rem' }}
                    whileHover={reduce ? undefined : { scale: 1.03 }}
                    whileTap={reduce ? undefined : { scale: 0.98 }}
                    onClick={() => setToast('Facebook configure opened (UI mock).')}
                  >
                    Configure Facebook
                  </motion.button>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.06}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">WhatsApp Marketing</span>
                <p className="pf-lead">
                  Connect WhatsApp Business to manage parent inquiries efficiently. Teachers reply
                  from Panacea; parents receive updates on WhatsApp.
                </p>
                <div className="pf-visual" style={{ marginTop: 14, minHeight: 160 }}>
                  <FloatCard delay={0.1}>
                    <strong>2 new messages from WhatsApp</strong> today
                  </FloatCard>
                  <FloatCard delay={0.22}>
                    <strong>Matilda Johnson</strong> · Just now
                    <div>Can we schedule a tour this week?</div>
                  </FloatCard>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.12}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">Enquiries</span>
                <p className="pf-lead">
                  Boost admissions by capturing leads from all channels in one place and driving
                  effective follow-ups.
                </p>
                <ul className="pf-bullets">
                  <li>Capture inquiries from website, chatbots, WhatsApp, Facebook and more.</li>
                  <li>Automate tasks, emails, and follow-ups so no inquiry is missed.</li>
                  <li>Track conversion rates at each stage with detailed insights.</li>
                </ul>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="pf-multi" className="pf-section" aria-labelledby="pf-multi-title">
          <Reveal>
            <h2 id="pf-multi-title" className="pf-sectionTitle">
              Multi-center Management
            </h2>
          </Reveal>
          <div className="pf-grid2">
            <Reveal delay={0.04}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">Multi-Center Analytics</span>
                <p className="pf-lead">
                  Gain insights across centers with analytics to track performance, compare data,
                  and drive growth.
                </p>
                <ul className="pf-bullets">
                  <li>View billing, admissions, and inquiries for all centers in one place.</li>
                  <li>Compare center performance and identify areas for improvement.</li>
                  <li>Monitor monthly trends and dive deep into KPIs.</li>
                </ul>
                <div
                  className="pf-visual"
                  style={{ marginTop: 14, minHeight: 170, alignItems: 'center' }}
                >
                  <FloatCard style={{ textAlign: 'center' }} delay={0.1}>
                    <strong>Total Students 300</strong>
                    <div style={{ marginTop: 6 }}>School Centre 1 · 2 · 3</div>
                  </FloatCard>
                  <FloatCard delay={0.22}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Center 1 is 60% more efficient in payment collection.
                  </FloatCard>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.1}>
              <article className="pf-card pf-cardPad">
                <span className="pf-badge">Control Panel</span>
                <p className="pf-lead">
                  Standardize setup, centralize management, and streamline processes for consistency
                  across all your centers.
                </p>
                <div className="pf-visual" style={{ marginTop: 14, minHeight: 170 }}>
                  <FloatCard delay={0.12}>
                    <CheckCircle2
                      size={14}
                      style={{ display: 'inline', marginRight: 6, color: '#16a34a' }}
                    />
                    Successfully saved Attendance &amp; Leave Settings
                  </FloatCard>
                  <FloatCard delay={0.24}>
                    <strong>Activity Settings</strong>
                    <div style={{ marginTop: 6 }}>Status on · Notify parents · Comments enabled</div>
                  </FloatCard>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="pf-safety" className="pf-section" aria-labelledby="pf-safety-title">
          <Reveal>
            <h2 id="pf-safety-title" className="pf-sectionTitle">
              Safety And Security
            </h2>
          </Reveal>
          <div className="pf-grid2">
            <Reveal delay={0.04}>
              <article className="pf-miniCard">
                <span className="pf-badge">Bus Tracking</span>
                <p className="pf-lead">
                  Track live location with Bus GPS Tracking. Provide parents with live bus locations
                  for safety and accountability.
                </p>
                <span className="pf-miniIcon" aria-hidden>
                  <Bus size={22} />
                </span>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="pf-miniCard">
                <span className="pf-badge">CCTV Monitoring</span>
                <p className="pf-lead">
                  Enhance safety with real-time CCTV feed, improving transparency and compliance
                  across your childcare.
                </p>
                <span className="pf-miniIcon" aria-hidden>
                  <Camera size={22} />
                </span>
              </article>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="pf-socialBar">
              <p>Stay connected by following us on social media for the latest updates and news.</p>
              <div className="pf-socialLinks">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                  Facebook
                </a>
                <a href="https://panacea.example" target="_blank" rel="noreferrer">
                  <Clock3 size={14} aria-hidden />
                  Panacea website
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="pf-toast"
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
