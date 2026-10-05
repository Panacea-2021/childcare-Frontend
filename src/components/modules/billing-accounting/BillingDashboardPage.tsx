'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  BellRing,
  CalendarDays,
  Download,
  Flame,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Timer,
  TrendingUp,
  Utensils,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  buildBillingDashboard,
  formatInr,
  type DashMode,
  type DashPeriod,
} from '@/lib/billing-accounting/billingDashboardStore';
import { formatInvoicePaymentMode, loadCenterInvoices, localTodayIso } from '@/lib/billing-accounting/invoiceStore';
import '@/components/ui/module.css';
import './billing-dashboard.css';

const PERIOD_OPTIONS: { value: DashPeriod; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
];

type SeriesKey = 'all' | 'billed' | 'collected' | 'expense';

const SERIES_META: Record<Exclude<SeriesKey, 'all'>, { label: string; color: string }> = {
  billed: { label: 'Billed', color: '#5D5FEF' },
  collected: { label: 'Collected', color: '#3db8a8' },
  expense: { label: 'Expense', color: '#f0a06a' },
};

const KPI_TRENDS = {
  billed: { dir: 'up' as const, pct: 5 },
  collected: { dir: 'up' as const, pct: 8 },
  overdue: { dir: 'down' as const, pct: 2 },
  outstanding: { dir: 'up' as const, pct: 3 },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatShortDate(iso: string) {
  if (!iso) return '?';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysOverdue(dueIso: string) {
  if (!dueIso) return 0;
  const today = localTodayIso();
  const [ay, am, ad] = dueIso.split('-').map(Number);
  const [by, bm, bd] = today.split('-').map(Number);
  const a = new Date(ay, (am || 1) - 1, ad || 1).getTime();
  const b = new Date(by, (bm || 1) - 1, bd || 1).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}

/** Compact month tick so labels never collide/truncate mid-year. */
function chartMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y || 2026, (m || 1) - 1, 1);
  const mon = d.toLocaleString('en-IN', { month: 'short' });
  return `${mon} '${String(y).slice(-2)}`;
}

type TipBoundary = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type GlassTipState = {
  anchorX: number;
  anchorTop: number;
  anchorBottom: number;
  boundary?: TipBoundary;
  eyebrow: string;
  title: string;
  detail?: string;
  accent?: string;
  badge?: string;
};

type GlassTipLayout = {
  x: number;
  y: number;
  placement: 'top' | 'bottom';
  arrowX: number;
};

const TIP_GAP = 10;

function intersectBounds(a: TipBoundary, b: TipBoundary): TipBoundary {
  return {
    top: Math.max(a.top, b.top),
    left: Math.max(a.left, b.left),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
}

function tipFromBarInPanel(
  el: HTMLElement,
  partial: Omit<GlassTipState, 'anchorX' | 'anchorTop' | 'anchorBottom' | 'boundary'>,
): GlassTipState {
  const r = el.getBoundingClientRect();
  const panel =
    el.closest('.bdash-panel--revenue')?.getBoundingClientRect() ??
    el.closest('.bdash-panel')?.getBoundingClientRect();
  const chart = el.closest('.bdash-bars-wrap')?.getBoundingClientRect();
  const pad = 12;
  const boundary = panel
    ? {
        top: (chart?.top ?? panel.top) + 8,
        left: panel.left + pad,
        right: panel.right - pad,
        bottom: panel.bottom - pad,
      }
    : undefined;

  return {
    ...partial,
    anchorX: r.left + r.width / 2,
    anchorTop: r.top,
    anchorBottom: r.bottom,
    boundary,
  };
}

function tipFromEl(
  el: HTMLElement,
  partial: Omit<GlassTipState, 'anchorX' | 'anchorTop' | 'anchorBottom' | 'boundary'>,
): GlassTipState {
  const r = el.getBoundingClientRect();
  const panel = el.closest('.bdash-panel')?.getBoundingClientRect();
  const pad = 16;
  const boundary = panel
    ? {
        top: panel.top + pad,
        left: panel.left + pad,
        right: panel.right - pad,
        bottom: panel.bottom - pad,
      }
    : undefined;

  return {
    ...partial,
    anchorX: r.left + r.width / 2,
    anchorTop: r.top,
    anchorBottom: r.bottom,
    boundary,
  };
}

function computeGlassTipLayout(
  tip: GlassTipState,
  size: { width: number; height: number },
  opts?: { preferTop?: boolean },
): GlassTipLayout {
  const gap = TIP_GAP;
  const margin = 8;
  const panelBound: TipBoundary = tip.boundary ?? {
    top: margin,
    left: margin,
    right: window.innerWidth - margin,
    bottom: window.innerHeight - margin,
  };
  const viewportBound: TipBoundary = {
    top: margin,
    left: margin,
    right: window.innerWidth - margin,
    bottom: window.innerHeight - margin,
  };
  const bound = intersectBounds(panelBound, viewportBound);

  const halfW = size.width / 2;
  const x = Math.max(bound.left + halfW, Math.min(bound.right - halfW, tip.anchorX));

  const preferTop = opts?.preferTop !== false;
  let placement: 'top' | 'bottom' = 'top';
  /** Bottom edge of tooltip when placed above the bar (`is-top` uses translateY(-100%)). */
  let y = tip.anchorTop - gap;

  const fitsAbove = y - size.height >= bound.top;
  const fitsBelow = tip.anchorBottom + gap + size.height <= bound.bottom;

  if (preferTop) {
    if (!fitsAbove && fitsBelow) {
      placement = 'bottom';
      y = tip.anchorBottom + gap;
    } else if (!fitsAbove) {
      y = bound.top + size.height;
    }
  } else if (fitsBelow) {
    placement = 'bottom';
    y = tip.anchorBottom + gap;
  } else if (!fitsAbove) {
    y = bound.top + size.height;
  }

  if (placement === 'bottom' && y + size.height > bound.bottom) {
    placement = 'top';
    y = tip.anchorTop - gap;
    if (y - size.height < bound.top) {
      y = bound.top + size.height;
    }
  }

  if (placement === 'top' && y - size.height < bound.top) {
    y = bound.top + size.height;
  }

  const arrowX = Math.max(-halfW + 14, Math.min(halfW - 14, tip.anchorX - x));

  return { x, y, placement, arrowX };
}

function GlassTipPortal({
  tip,
  preferTop = true,
}: {
  tip: GlassTipState | null;
  preferTop?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<GlassTipLayout | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!tip || !ref.current) {
      setLayout(null);
      return;
    }

    const measure = () => {
      const node = ref.current;
      if (!node || !tip) return;
      setLayout(
        computeGlassTipLayout(
          tip,
          {
            width: node.offsetWidth,
            height: node.offsetHeight,
          },
          { preferTop },
        ),
      );
    };

    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [tip, preferTop]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {tip ? (
        <motion.div
          ref={ref}
          key={`${tip.eyebrow}-${tip.title}-${tip.anchorX}`}
          className={`bdash-tip${layout?.placement === 'bottom' ? ' is-bottom' : ' is-top'}`}
          role="tooltip"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{
            left: layout?.x ?? tip.anchorX,
            top: layout?.y ?? tip.anchorTop,
            visibility: layout ? 'visible' : 'hidden',
            ['--tip-accent' as string]: tip.accent || 'var(--color-accent, #5D5FEF)',
            ['--tip-arrow-shift' as string]: `${layout?.arrowX ?? 0}px`,
          }}
        >
          <span className="bdash-tip__glow" aria-hidden />
          <div className="bdash-tip__row">
            <span className="bdash-tip__eyebrow">{tip.eyebrow}</span>
            {tip.badge ? <span className="bdash-tip__badge">{tip.badge}</span> : null}
          </div>
          <strong className="bdash-tip__title">{tip.title}</strong>
          {tip.detail ? <p className="bdash-tip__detail">{tip.detail}</p> : null}
          <span className="bdash-tip__arrow" aria-hidden />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  const w = 88;
  const h = 30;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - (v / max) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg className="bdash-spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden>
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function ProgressRing({
  value,
  max = 100,
  color,
  size = 54,
}: {
  value: number;
  max?: number;
  color: string;
  size?: number;
}) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, max <= 0 ? 0 : value / max));
  return (
    <svg className="bdash-ring" width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#E8EDF5" strokeWidth="5" />
      <motion.circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

function AnimatedAmount({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 70, damping: 22, mass: 0.7 });
  const display = useTransform(spring, (v) => formatInr(Math.round(v)));
  const [text, setText] = useState(formatInr(0));
  const primed = useRef(false);

  useEffect(() => {
    if (!primed.current) {
      primed.current = true;
      motionVal.set(0);
      const id = requestAnimationFrame(() => motionVal.set(value));
      return () => cancelAnimationFrame(id);
    }
    motionVal.set(value);
  }, [motionVal, value]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return () => unsub();
  }, [display]);

  return <span>{text}</span>;
}

function CountUpInt({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 24 });
  const [n, setN] = useState(0);

  useEffect(() => {
    motionVal.set(0);
    const id = requestAnimationFrame(() => motionVal.set(value));
    return () => cancelAnimationFrame(id);
  }, [motionVal, value]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => setN(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return <>{n}</>;
}

function useTilt() {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [3.5, -3.5]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-3.5, 3.5]), { stiffness: 180, damping: 22 });
  const gx = useTransform(x, (v) => `${v * 100}%`);
  const gy = useTransform(y, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, color-mix(in srgb, var(--kpi-accent, #5D5FEF) 18%, transparent), transparent 55%)`;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return { ref, rotateX, rotateY, glow, onMove, onLeave };
}

function RevenueBars({
  points,
  series,
  onSeries,
  mode = 'bars',
}: {
  points: { key: string; label: string; billed: number; collected: number; expense: number }[];
  series: SeriesKey;
  onSeries: (s: SeriesKey) => void;
  /** `combo` draws expense bars + billed/collected lines (Expenses tab). */
  mode?: 'bars' | 'combo';
}) {
  const [hover, setHover] = useState<GlassTipState | null>(null);
  const kinds: Array<'billed' | 'collected' | 'expense'> =
    series === 'all'
      ? mode === 'combo'
        ? ['expense']
        : ['billed', 'collected', 'expense']
      : [series];

  const max = Math.max(
    1,
    ...points.flatMap((p) =>
      mode === 'combo' && series === 'all'
        ? [p.billed, p.collected, p.expense]
        : kinds.map((k) => p[k]),
    ),
  );

  const currentKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  if (!points.length) {
    return <div className="bdash-empty">No revenue data for this period yet.</div>;
  }

  const tabs: { key: SeriesKey; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: '#94a3b8' },
    { key: 'billed', label: 'Billed', color: SERIES_META.billed.color },
    { key: 'collected', label: 'Collected', color: SERIES_META.collected.color },
    { key: 'expense', label: 'Expense', color: SERIES_META.expense.color },
  ];

  const showLine = (key: 'billed' | 'collected') =>
    mode === 'combo' && (series === 'all' || series === key);

  const linePath = (key: 'billed' | 'collected') => {
    const n = points.length;
    return points
      .map((p, i) => {
        const x = ((i + 0.5) / n) * 100;
        const y = 100 - (p[key] / max) * 92;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const sparse = points.length <= 2;

  return (
    <>
      <div className="bdash-legend" role="tablist" aria-label="Series filter">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={series === item.key}
            className={`bdash-legend__btn${series === item.key ? ' is-active' : ''}`}
            style={{ ['--dot' as string]: item.color }}
            onClick={() => onSeries(item.key)}
          >
            <i className="bdash-legend__dot" />
            {item.label}
          </button>
        ))}
      </div>

      <div className={`bdash-bars-wrap${sparse ? ' is-sparse' : ''}`}>
        <div className="bdash-bars__grid" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} />
          ))}
        </div>
        {mode === 'combo' ? (
          <svg className="bdash-combo-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {showLine('billed') ? (
              <motion.path
                d={linePath('billed')}
                fill="none"
                stroke={SERIES_META.billed.color}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="bdash-combo-line bdash-combo-line--billed"
              />
            ) : null}
            {showLine('collected') ? (
              <motion.path
                d={linePath('collected')}
                fill="none"
                stroke={SERIES_META.collected.color}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bdash-combo-line bdash-combo-line--collected"
              />
            ) : null}
          </svg>
        ) : null}

        <div
          className={`bdash-bars${mode === 'combo' ? ' bdash-bars--combo' : ''}${sparse ? ' bdash-bars--sparse' : ''}`}
          role="img"
          aria-label="Revenue statistics by month"
        >
          {points.map((p, i) => {
            const isCurrent = p.key === currentKey;
            const tick = chartMonthLabel(p.key);
            return (
              <div key={p.key} className={`bdash-bars__col${isCurrent ? ' is-current' : ''}`}>
                <div className="bdash-bars__group">
                  {kinds.map((kind, bi) => {
                    const amt = p[kind];
                    const hPct = Math.max(3, (amt / max) * 100);
                    const meta = SERIES_META[kind];
                    return (
                      <motion.div
                        key={kind}
                        className={`bdash-bars__bar bdash-bars__bar--${kind}${isCurrent ? ' is-glow' : ''}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${hPct}%` }}
                        transition={{
                          delay: 0.12 + i * 0.07 + bi * 0.03,
                          type: 'spring',
                          stiffness: 120,
                          damping: 18,
                        }}
                        onMouseEnter={(e) =>
                          setHover(
                            tipFromBarInPanel(e.currentTarget, {
                              eyebrow: tick,
                              title: formatInr(amt),
                              detail: `${meta.label} for ${p.label}`,
                              accent: meta.color,
                              badge: meta.label,
                            }),
                          )
                        }
                        onMouseLeave={() => setHover(null)}
                      >
                        <span className="bdash-bars__shimmer" aria-hidden />
                      </motion.div>
                    );
                  })}
                </div>
                <span className="bdash-bars__label">{tick}</span>
              </div>
            );
          })}
        </div>
      </div>

      <GlassTipPortal tip={hover} preferTop />
    </>
  );
}

function AgeingDonut({
  buckets,
}: {
  buckets: { id: string; label: string; count: number; amount: number; color: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const total = buckets.reduce((s, b) => s + b.count, 0);
  const radius = 42;
  const stroke = 14;
  const c = 2 * Math.PI * radius;
  let offset = 0;

  const arcs =
    total === 0
      ? []
      : buckets.map((b) => {
          const len = (b.count / total) * c;
          const dash = `${len} ${c - len}`;
          const seg = { ...b, dash, offset, len };
          offset += len;
          return seg;
        });

  return (
    <div className="bdash-ageing">
      <div className="bdash-donut-wrap">
        <svg viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#EEF2F8" strokeWidth={stroke} />
          {arcs.map((a, i) => {
            const highlighted = !active || active === a.id;
            return (
              <motion.circle
                key={a.id}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={a.color}
                strokeWidth={active === a.id ? stroke + 3 : stroke}
                strokeLinecap="butt"
                strokeDasharray={a.dash}
                strokeDashoffset={-a.offset}
                initial={{ strokeDasharray: `0 ${c}`, opacity: 0.4 }}
                animate={{
                  strokeDasharray: a.dash,
                  opacity: highlighted ? 1 : 0.28,
                  strokeWidth: active === a.id ? stroke + 3 : stroke,
                }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease' }}
                onMouseEnter={() => setActive(a.id)}
                onMouseLeave={() => setActive(null)}
              />
            );
          })}
        </svg>
        <div className="bdash-donut-center">
          <strong>
            <CountUpInt value={total} />
          </strong>
          <span>Overdue</span>
        </div>
      </div>
      <ul className="bdash-ageing__list">
        {buckets.map((b, i) => (
          <motion.li
            key={b.id}
            className={`bdash-ageing__item${active === b.id ? ' is-active' : ''}${active && active !== b.id ? ' is-dim' : ''}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            onMouseEnter={() => setActive(b.id)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="bdash-ageing__swatch" style={{ background: b.color }} />
            <span className="bdash-ageing__label">
              {b.label} · {b.count}
            </span>
            <span className="bdash-ageing__val">{formatInr(b.amount)}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function KpiCard({
  id,
  label,
  value,
  hint,
  icon: Icon,
  accent,
  soft,
  index,
  progress,
  trend,
}: {
  id: string;
  label: string;
  value: number;
  hint: string;
  icon: typeof Receipt;
  accent: string;
  soft: string;
  index: number;
  progress: number;
  trend: { dir: 'up' | 'down'; pct: number };
}) {
  const tilt = useTilt();

  return (
    <motion.article
      ref={tilt.ref as RefObject<HTMLElement>}
      className="bdash-kpi"
      style={{
        ['--kpi-accent' as string]: accent,
        ['--kpi-soft' as string]: soft,
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 800,
      }}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.07, type: 'spring', stiffness: 160, damping: 20 }}
      whileHover={{ y: -4 }}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
    >
      <motion.span className="bdash-kpi__glow" style={{ background: tilt.glow }} aria-hidden />
      <span className="bdash-kpi__shine" aria-hidden />
      <div className="bdash-kpi__top">
        <p className="bdash-kpi__label">{label}</p>
        <motion.span
          className="bdash-kpi__icon"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
        >
          <Icon size={18} strokeWidth={2.1} />
        </motion.span>
      </div>
      <p className="bdash-kpi__value">
        <AnimatedAmount value={value} />
      </p>
      <div className="bdash-kpi__meta">
        <p className="bdash-kpi__hint">{hint}</p>
        <span className={`bdash-kpi__trend is-${trend.dir}`}>
          {trend.dir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend.dir === 'up' ? '+' : '?'}
          {trend.pct}%
        </span>
      </div>
      <div className="bdash-kpi__progress" aria-hidden>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.min(1, Math.max(0.04, progress)) }}
          transition={{ delay: 0.35 + index * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="bdash-sr-only">{id}</span>
    </motion.article>
  );
}

function DailyExpenseTimeline({
  days,
}: {
  days: { id: string; label: string; amount: number; spike: boolean }[];
}) {
  const [tip, setTip] = useState<GlassTipState | null>(null);
  const peak = Math.max(1, ...days.map((d) => d.amount));

  return (
    <>
      <div className="bdash-timeline">
        {days.map((d, i) => (
          <motion.div
            key={d.id}
            className={`bdash-timeline__col${d.spike ? ' is-spike' : ''}${tip?.eyebrow === d.label ? ' is-hot' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 + i * 0.03 }}
            onMouseEnter={(e) =>
              setTip(
                tipFromEl(e.currentTarget.querySelector('.bdash-timeline__bar') || e.currentTarget, {
                  eyebrow: d.label,
                  title: formatInr(d.amount),
                  detail: d.spike ? 'Spend spike vs daily average' : 'Daily modeled outflow',
                  accent: d.spike ? '#e85d6c' : '#f0a06a',
                  badge: d.spike ? 'Spike' : 'Day',
                }),
              )
            }
            onMouseLeave={() => setTip(null)}
          >
            <motion.span
              className="bdash-timeline__bar"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, (d.amount / peak) * 100)}%` }}
              transition={{ delay: 0.45 + i * 0.03, type: 'spring', stiffness: 140, damping: 18 }}
            />
            <em>{d.label}</em>
          </motion.div>
        ))}
      </div>
      <GlassTipPortal tip={tip} />
    </>
  );
}

const EXPENSE_SHARES = [
  { id: 'salary', label: 'Salary', share: 0.42, color: '#5D5FEF', icon: BadgeIndianRupee },
  { id: 'food', label: 'Food', share: 0.22, color: '#3db8a8', icon: Utensils },
  { id: 'utilities', label: 'Utilities', share: 0.14, color: '#5b9fff', icon: Zap },
  { id: 'maintenance', label: 'Maintenance', share: 0.12, color: '#f0a06a', icon: Wrench },
  { id: 'others', label: 'Others', share: 0.1, color: '#94a3b8', icon: Sparkles },
] as const;

function ExpenseCategoryDonut({
  total,
}: {
  total: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const buckets = EXPENSE_SHARES.map((c) => ({
    ...c,
    amount: Math.round(total * c.share),
  }));
  const radius = 42;
  const stroke = 14;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const arcs = buckets.map((b) => {
    const len = (b.share) * circ;
    const seg = { ...b, dash: `${len} ${circ - len}`, offset };
    offset += len;
    return seg;
  });

  return (
    <div className="bdash-ageing bdash-exp-donut">
      <div className="bdash-donut-wrap">
        <svg viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#EEF2F8" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <motion.circle
              key={a.id}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={a.color}
              strokeLinecap="butt"
              strokeDasharray={a.dash}
              strokeDashoffset={-a.offset}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: !active || active === a.id ? 1 : 0.28,
                strokeWidth: active === a.id ? stroke + 3 : stroke,
              }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.55 }}
              onMouseEnter={() => setActive(a.id)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>
        <div className="bdash-donut-center">
          <strong>
            <AnimatedAmount value={total} />
          </strong>
          <span>Spend</span>
        </div>
      </div>
      <ul className="bdash-ageing__list">
        {buckets.map((b, i) => (
          <motion.li
            key={b.id}
            className={`bdash-ageing__item${active === b.id ? ' is-active' : ''}${active && active !== b.id ? ' is-dim' : ''}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onMouseEnter={() => setActive(b.id)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="bdash-ageing__swatch" style={{ background: b.color }} />
            <span className="bdash-ageing__label">
              {b.label} · {Math.round(b.share * 100)}%
            </span>
            <span className="bdash-ageing__val">{formatInr(b.amount)}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function BillingDashboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<DashMode>('dashboard');
  const [period, setPeriod] = useState<DashPeriod>('this_month');
  const [series, setSeries] = useState<SeriesKey>('all');
  const [tick, setTick] = useState(0);
  const [liveBump, setLiveBump] = useState(0);
  const [toast, setToast] = useState<{ id: number; message: string; tone?: 'pay' | 'exp' } | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const model = useMemo(() => {
    void tick;
    return buildBillingDashboard(period, loadCenterInvoices());
  }, [period, tick]);

  const expenseTotal = useMemo(
    () => model.revenue.reduce((s, r) => s + r.expense, 0),
    [model.revenue],
  );

  const displayCollected = model.collected + liveBump;
  const vsCollectedPct = displayCollected > 0 ? Math.round((expenseTotal / displayCollected) * 100) : 0;
  const netSignal = Math.max(0, displayCollected - expenseTotal);
  const momDelta = 24; // mock insight vs last month

  const expenseSpark = useMemo(() => {
    const base = model.revenue.map((r) => r.expense);
    if (base.length >= 3) return base.slice(-7);
    return [40, 55, 48, 62, 58, 70, Math.max(40, expenseTotal / 30)];
  }, [model.revenue, expenseTotal]);

  const dailyFlow = useMemo(() => {
    const days = 14;
    const avg = expenseTotal > 0 ? expenseTotal / days : 45;
    return Array.from({ length: days }, (_, i) => {
      const wave = 0.55 + ((i * 17) % 10) / 18;
      const spike = i === 4 || i === 10 ? 1.65 : 1;
      const amount = Math.round(avg * wave * spike);
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        id: `d-${i}`,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount,
        spike: spike > 1,
      };
    });
  }, [expenseTotal]);

  useEffect(() => {
    const bump = window.setInterval(() => {
      setLiveBump((n) => (n >= 40 ? 0 : n + 5));
    }, 16000);
    return () => window.clearInterval(bump);
  }, []);

  useEffect(() => {
    let i = 0;
    const show = () => {
      if (mode === 'expenses') {
        const cats = ['Food', 'Utilities', 'Salary', 'Maintenance'];
        const amt = [1200, 800, 2500, 650][i % 4];
        setToast({
          id: Date.now(),
          tone: 'exp',
          message: `${formatInr(amt)} expense added for ${cats[i % 4]}`,
        });
      } else if (model.recentPayments.length > 0) {
        const p = model.recentPayments[i % model.recentPayments.length];
        setToast({
          id: Date.now(),
          tone: 'pay',
          message: `${formatInr(p.amount)} received from ${p.studentName}`,
        });
      }
      i += 1;
    };
    const first = window.setTimeout(show, 5000);
    const loop = window.setInterval(show, 24000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, [mode, model.recentPayments]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const insight =
    model.todayInvoiceCount === 0
      ? {
          title: 'No invoices today ? start generating to maintain cash flow',
          sub: 'A steady invoice cadence keeps overdue risk and collections in balance.',
          cta: 'Create Invoice',
          href: '/billing-accounting/invoices/create',
        }
      : {
          title: `You created ${model.todayInvoiceCount} new invoice${model.todayInvoiceCount === 1 ? '' : 's'} totaling ${formatInr(model.todayInvoiceAmount)} today`,
          sub: 'Review today?s ledger and follow up while momentum is high.',
          cta: 'Check Now',
          href: '/billing-accounting/invoices',
        };

  const kpis = [
    {
      id: 'billed',
      label: 'Total Billed',
      value: model.billed,
      hint: 'Invoices posted in period',
      icon: Receipt,
      accent: '#5D5FEF',
      soft: '#E8F2FF',
      progress: 1,
      trend: KPI_TRENDS.billed,
    },
    {
      id: 'collected',
      label: 'Total Collected',
      value: displayCollected,
      hint: 'Payments received',
      icon: Wallet,
      accent: '#3db8a8',
      soft: '#e6f8f5',
      progress: model.billed > 0 ? displayCollected / model.billed : 0,
      trend: KPI_TRENDS.collected,
    },
    {
      id: 'overdue',
      label: 'Total Overdue on Billed',
      value: model.overdue,
      hint: 'Past-due balances',
      icon: AlertTriangle,
      accent: '#e85d6c',
      soft: '#ffeef0',
      progress: model.billed > 0 ? model.overdue / model.billed : 0,
      trend: KPI_TRENDS.overdue,
    },
    {
      id: 'outstanding',
      label: 'Total Outstanding on Billed',
      value: model.outstanding,
      hint: 'Pending collection',
      icon: Timer,
      accent: '#e5a84b',
      soft: '#fff6e8',
      progress: model.billed > 0 ? model.outstanding / model.billed : 0,
      trend: KPI_TRENDS.outstanding,
    },
  ] as const;

  const downloadCsv = (filename: string, rows: string[][]) => {
    const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mod-page bdash">
      <div className="bdash-atmosphere" aria-hidden>
        <span className="bdash-atmosphere__blob bdash-atmosphere__blob--a" />
        <span className="bdash-atmosphere__blob bdash-atmosphere__blob--b" />
        <span className="bdash-atmosphere__blob bdash-atmosphere__blob--c" />
      </div>

      {portalReady
        ? createPortal(
            <AnimatePresence>
              {toast ? (
                <motion.div
                  key={toast.id}
                  className={`bdash-live-toast${toast.tone === 'exp' ? ' is-exp' : ''}`}
                  initial={{ opacity: 0, y: -16, x: 12 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -10, x: 8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  role="status"
                >
                  <span className="bdash-live-toast__dot" />
                  {toast.tone === 'exp' ? (
                    <BadgeIndianRupee size={15} strokeWidth={2.2} />
                  ) : (
                    <Wallet size={15} strokeWidth={2.2} />
                  )}
                  <p>{toast.message}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <BillingAccountingPageHeader
        title="Dashboard"
        description="Live pulse of billing, collections, overdue risk, and recent family payments."
        icon={<LayoutDashboard size={22} strokeWidth={2.1} />}
        actions={
          <div className="bdash-header-actions">
            <span className="bdash-live-pill" title="Demo live feed">
              <span className="bdash-live-pill__dot" />
              Live
            </span>
            <Link href="/billing-accounting/invoices/create" className="ui-btn ui-btn-primary bdash-cta-glow">
              <motion.span
                animate={{ rotate: [0, 12, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-flex' }}
              >
                <Sparkles size={16} />
              </motion.span>
              New Invoice
            </Link>
          </div>
        }
      />

      <div className="bdash-toolbar">
        <div className="bdash-mode" role="tablist" aria-label="Dashboard mode">
          {(['dashboard', 'expenses'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={`bdash-mode__btn${mode === m ? ' is-active' : ''}`}
              onClick={() => setMode(m)}
            >
              {mode === m ? (
                <motion.span
                  layoutId="bdash-mode-pill"
                  className="bdash-mode__pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              ) : null}
              {m === 'dashboard' ? 'Dashboard' : 'Expenses'}
            </button>
          ))}
        </div>
        <div className="bdash-period">
          <AppSelect
            value={period}
            onChange={(v) => setPeriod(v as DashPeriod)}
            options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            placeholder="Period"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'dashboard' ? (
          <motion.div
            key="dash"
            className="bdash-mode-pane"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="bdash-kpis">
              {kpis.map((k, i) => (
                <KpiCard key={k.id} {...k} index={i} />
              ))}
            </div>

            <motion.div
              className="bdash-banner"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28, type: 'spring', stiffness: 160, damping: 20 }}
            >
              <span className="bdash-banner__icon" aria-hidden>
                <Zap size={18} strokeWidth={2.2} />
              </span>
              <div className="bdash-banner__copy">
                <p className="bdash-banner__title">{insight.title}</p>
                <p className="bdash-banner__sub">{insight.sub}</p>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn-primary bdash-banner__cta"
                onClick={() => router.push(insight.href)}
              >
                {insight.cta}
                <ArrowUpRight size={16} />
              </button>
            </motion.div>

            <div className="bdash-grid">
              <motion.section
                className="bdash-panel bdash-panel--revenue"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                <div className="bdash-panel__head">
                  <div>
                    <h2 className="bdash-panel__title">Revenue Stats</h2>
                    <p className="bdash-panel__meta">Billed · Collected · Expense by month</p>
                  </div>
                  <div className="bdash-panel__actions">
                    <button
                      type="button"
                      className="bdash-icon-btn"
                      aria-label="Download revenue stats"
                      onClick={() =>
                        downloadCsv('revenue-stats.csv', [
                          ['Month', 'Billed', 'Collected', 'Expense'],
                          ...model.revenue.map((r) => [
                            r.label,
                            String(r.billed),
                            String(r.collected),
                            String(r.expense),
                          ]),
                        ])
                      }
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
                <div className="bdash-panel__body">
                  <RevenueBars
                    points={model.revenue}
                    series={series}
                    onSeries={setSeries}
                  />
                </div>
              </motion.section>

              <motion.section
                className="bdash-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
              >
                <div className="bdash-panel__head">
                  <div>
                    <h2 className="bdash-panel__title">Payment in last 14 days</h2>
                    <p className="bdash-panel__meta">Latest family remittances</p>
                  </div>
                  <button
                    type="button"
                    className="bdash-link"
                    onClick={() => router.push('/billing-accounting/payments')}
                  >
                    View All
                  </button>
                </div>
                <div className="bdash-panel__body">
                  {model.recentPayments.length === 0 ? (
                    <div className="bdash-empty">No payments recorded in the last 14 days.</div>
                  ) : (
                    <ul className="bdash-list">
                      {model.recentPayments.map((p, i) => (
                        <motion.li
                          key={p.id}
                          className="bdash-list__row"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.06 }}
                          whileHover={{ scale: 1.015 }}
                          onClick={() => router.push(`/billing-accounting/invoices/${p.invoiceId}`)}
                        >
                          <span className="bdash-avatar bdash-avatar--ring">{initials(p.studentName)}</span>
                          <div>
                            <p className="bdash-list__name">{p.studentName}</p>
                            <p className="bdash-list__meta">
                              <span className="bdash-badge bdash-badge--mint">
                                {formatInvoicePaymentMode(p.mode)}
                              </span>
                              <span>· {formatShortDate(p.date)}</span>
                            </p>
                          </div>
                          <p className="bdash-list__amt">{formatInr(p.amount)}</p>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.section>
            </div>

            <div className="bdash-grid bdash-grid--bottom">
              <motion.section
                className="bdash-panel bdash-panel--urgent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
              >
                <div className="bdash-panel__head">
                  <div>
                    <h2 className="bdash-panel__title">Overdue Invoices</h2>
                    <p className="bdash-panel__meta">Prioritized for follow-up</p>
                  </div>
                  <button
                    type="button"
                    className="bdash-link"
                    onClick={() => router.push('/billing-accounting/invoices?status=Overdue')}
                  >
                    View All
                  </button>
                </div>
                <div className="bdash-panel__body">
                  {model.overdueInvoices.length === 0 ? (
                    <div className="bdash-empty">No overdue invoices — great work.</div>
                  ) : (
                    <ul className="bdash-list">
                      {model.overdueInvoices.map((row, i) => {
                        const days = daysOverdue(row.dueDate);
                        const urgency = Math.min(1, days / 45);
                        return (
                          <motion.li
                            key={row.id}
                            className="bdash-list__row bdash-list__row--overdue"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 + i * 0.05 }}
                          >
                            <span
                              className="bdash-avatar bdash-avatar--ring is-danger"
                              style={{ background: '#ffeef0', color: '#e85d6c' }}
                            >
                              {initials(row.studentName)}
                            </span>
                            <div className="bdash-overdue-main">
                              <p className="bdash-list__name">{row.studentName}</p>
                              <p className="bdash-list__meta">
                                Due {formatShortDate(row.dueDate)} · {row.invoiceId}
                              </p>
                              <div className="bdash-overdue-meter" aria-label={`${days} days overdue`}>
                                <motion.span
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: Math.max(0.08, urgency) }}
                                  transition={{ delay: 0.5 + i * 0.05, duration: 0.7 }}
                                />
                                <em>{days}d overdue</em>
                              </div>
                              <div className="bdash-overdue-actions">
                                <button
                                  type="button"
                                  className="bdash-mini-btn bdash-mini-btn--primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/billing-accounting/invoices/${row.id}`);
                                  }}
                                >
                                  Pay Now
                                </button>
                                <button
                                  type="button"
                                  className="bdash-mini-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/billing-accounting/invoices/${row.id}`);
                                  }}
                                >
                                  <BellRing size={12} />
                                  Remind
                                </button>
                              </div>
                            </div>
                            <p className="bdash-list__amt is-danger">{formatInr(row.amount)}</p>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.section>

              <motion.section
                className="bdash-panel bdash-panel--ageing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
              >
                <div className="bdash-panel__head">
                  <div>
                    <h2 className="bdash-panel__title">Ageing bucket for overdue invoices</h2>
                    <p className="bdash-panel__meta">1–15 · 16–30 · 31–45 · 45+ days</p>
                  </div>
                  <button
                    type="button"
                    className="bdash-icon-btn"
                    aria-label="Download ageing report"
                    onClick={() =>
                      downloadCsv('overdue-ageing.csv', [
                        ['Bucket', 'Count', 'Amount'],
                        ...model.ageing.map((b) => [b.label, String(b.count), String(b.amount)]),
                      ])
                    }
                  >
                    <Download size={15} />
                  </button>
                </div>
                <div className="bdash-panel__body">
                  <AgeingDonut buckets={model.ageing} />
                </div>
              </motion.section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expenses"
            className="bdash-expenses"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {expenseTotal <= 0 ? (
              <motion.div
                className="bdash-exp-empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.span
                  className="bdash-exp-empty__icon"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BadgeIndianRupee size={28} />
                </motion.span>
                <h2>No expenses yet ? start tracking to unlock insights</h2>
                <p>Connect spend categories to see pulse, distribution, and daily flow analytics.</p>
                <button type="button" className="ui-btn ui-btn-primary bdash-cta-glow">
                  <Sparkles size={16} />
                  Add first expense
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="bdash-expenses__hero"
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                >
                  <span className="bdash-expenses__wave" aria-hidden />
                  <div className="bdash-expenses__hero-copy">
                    <span className="bdash-expenses__hero-icon">
                      <Zap size={18} />
                    </span>
                    <div>
                      <h2>Expense pulse</h2>
                      <p className="bdash-expenses__insight">
                        Expenses are <strong>{momDelta}%</strong> higher than last month
                      </p>
                      <p>
                        Estimated operating outflows aligned to your billing rhythm for the selected
                        period.
                      </p>
                    </div>
                  </div>
                  <div className="bdash-expenses__hero-spark">
                    <MiniSparkline values={expenseSpark} color="#f0a06a" />
                    <span>7-period trend</span>
                  </div>
                </motion.div>

                <div className="bdash-expenses__grid">
                  <motion.article
                    className="bdash-expense-card bdash-expense-card--rich"
                    style={{ ['--exp-accent' as string]: '#f0a06a' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="bdash-expense-card__head">
                      <h3>Period expenses</h3>
                      <span className="bdash-kpi__trend is-up">
                        <ArrowUpRight size={12} /> +{momDelta}%
                      </span>
                    </div>
                    <strong>
                      <AnimatedAmount value={expenseTotal} />
                    </strong>
                    <p>Modeled from collection activity for the selected period.</p>
                    <MiniSparkline values={expenseSpark} color="#f0a06a" />
                  </motion.article>

                  <motion.article
                    className="bdash-expense-card bdash-expense-card--rich"
                    style={{ ['--exp-accent' as string]: '#3db8a8' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="bdash-expense-card__head">
                      <h3>Vs collected</h3>
                      <ProgressRing value={Math.min(100, vsCollectedPct)} color="#3db8a8" />
                    </div>
                    <strong>{vsCollectedPct}%</strong>
                    <p>Expense share of collections this period.</p>
                    <MiniSparkline
                      values={expenseSpark.map((v, i) => v + i * 3)}
                      color="#3db8a8"
                    />
                  </motion.article>

                  <motion.article
                    className="bdash-expense-card bdash-expense-card--rich"
                    style={{ ['--exp-accent' as string]: '#5D5FEF' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="bdash-expense-card__head">
                      <h3>Net signal</h3>
                      <span className={`bdash-kpi__trend ${netSignal > 0 ? 'is-up' : 'is-down'}`}>
                        {netSignal > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {netSignal > 0 ? 'Healthy' : 'Tight'}
                      </span>
                    </div>
                    <strong>
                      <AnimatedAmount value={netSignal} />
                    </strong>
                    <p>Collected minus estimated expenses.</p>
                    <MiniSparkline
                      values={expenseSpark.map((v) => Math.max(0, v * 0.4))}
                      color="#5D5FEF"
                    />
                  </motion.article>
                </div>

                <motion.section
                  className="bdash-panel"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  <div className="bdash-panel__head">
                    <div>
                      <h2 className="bdash-panel__title">Expense vs billing</h2>
                      <p className="bdash-panel__meta">Bars = expense · Lines = billed / collected</p>
                    </div>
                    <span className="bdash-panel__actions">
                      <BadgeIndianRupee size={18} color="#f0a06a" />
                    </span>
                  </div>
                  <div className="bdash-panel__body">
                    <RevenueBars
                      points={model.revenue}
                      series={series}
                      onSeries={setSeries}
                      mode="combo"
                    />
                  </div>
                </motion.section>

                <motion.section
                  className="bdash-exp-insights"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bdash-panel__head" style={{ padding: '0 0 0.65rem' }}>
                    <div>
                      <h2 className="bdash-panel__title">Smart Insights</h2>
                      <p className="bdash-panel__meta">Heuristic signals from the modeled spend curve</p>
                    </div>
                  </div>
                  <div className="bdash-exp-insights__grid">
                    {[
                      {
                        icon: Flame,
                        title: 'Highest expense category: Staff Salaries',
                        sub: `${Math.round(expenseTotal * 0.42).toLocaleString('en-IN')} est. this period`,
                        tone: 'a',
                      },
                      {
                        icon: CalendarDays,
                        title: `Most expensive day: ${dailyFlow.find((d) => d.spike)?.label ?? '?'}`,
                        sub: 'Spike vs daily average in the last 14 days',
                        tone: 'b',
                      },
                      {
                        icon: TrendingUp,
                        title: 'Expense spike detected',
                        sub: `Outflows running ~${momDelta}% above last month?s pace`,
                        tone: 'c',
                      },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.article
                          key={card.title}
                          className={`bdash-insight-card tone-${card.tone}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.34 + i * 0.06 }}
                          whileHover={{ y: -3, scale: 1.01 }}
                        >
                          <span className="bdash-insight-card__icon">
                            <Icon size={16} />
                          </span>
                          <strong>{card.title}</strong>
                          <p>{card.sub}</p>
                        </motion.article>
                      );
                    })}
                  </div>
                </motion.section>

                <div className="bdash-grid bdash-grid--exp-bottom">
                  <motion.section
                    className="bdash-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36 }}
                  >
                    <div className="bdash-panel__head">
                      <div>
                        <h2 className="bdash-panel__title">Expense Distribution</h2>
                        <p className="bdash-panel__meta">Salary · Food · Utilities · Maintenance · Others</p>
                      </div>
                    </div>
                    <div className="bdash-panel__body">
                      <ExpenseCategoryDonut total={expenseTotal} />
                    </div>
                  </motion.section>

                  <motion.section
                    className="bdash-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bdash-panel__head">
                      <div>
                        <h2 className="bdash-panel__title">Daily expense flow</h2>
                        <p className="bdash-panel__meta">Last 14 days · scroll to explore</p>
                      </div>
                    </div>
                    <div className="bdash-panel__body">
                      <DailyExpenseTimeline days={dailyFlow} />
                    </div>
                  </motion.section>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
