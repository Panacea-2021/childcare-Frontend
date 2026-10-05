'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Filter,
  Hourglass,
  TrendingUp,
} from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const REVENUE_FEATURES = [
  {
    id: 'status',
    icon: BarChart3,
    title: 'Track billing status',
    detail: 'See collected, pending, and overdue amounts across every center.',
  },
  {
    id: 'reports',
    icon: Filter,
    title: 'Build custom reports',
    detail: 'Filter by room, program, or date range without exporting to spreadsheets.',
  },
  {
    id: 'summary',
    icon: Hourglass,
    title: 'Billing summary',
    detail: 'Weekly snapshots keep directors aligned on cash flow and follow-ups.',
  },
  {
    id: 'integrations',
    icon: TrendingUp,
    title: 'Integrations',
    detail: 'Connect payment processors and keep remittances reconciled in one place.',
  },
] as const;

const GROUPED_BARS = [
  { month: 'Jan', c1: 72, c2: 48, c3: 36 },
  { month: 'Feb', c1: 80, c2: 55, c3: 40 },
  { month: 'Mar', c1: 68, c2: 62, c3: 44 },
  { month: 'Apr', c1: 88, c2: 58, c3: 50 },
  { month: 'May', c1: 96, c2: 70, c3: 52 },
] as const;

const COLLECTION_RATES = [
  { id: 'c1', label: 'Centre 1', value: 92, tone: 'a' },
  { id: 'c2', label: 'Centre 2', value: 78, tone: 'b' },
  { id: 'c3', label: 'Centre 3', value: 65, tone: 'c' },
] as const;

export function BillingRevenue() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="bl-revenue">
      <div className="bl-sectionCopy bl-center">
        <h2>Know your revenue, in real time.</h2>
        <p>
          Collections, outstanding balances, subsidy payments, and trends — one dashboard
          directors can trust.
        </p>
      </div>

      <div className="bl-revenueSplit">
        <ul className="bl-revenueFeatures">
          {REVENUE_FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                initial={reduced ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <span className="bl-revenueFeatIcon" aria-hidden>
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <motion.div
          className="bl-revenueDash"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <div className="bl-revPanel bl-revAcross">
            <div className="bl-revPanelHead">
              <strong>Revenue Across Centres</strong>
              <div className="bl-revLegend" aria-hidden>
                <span>
                  <i className="t1" /> Centre 1
                </span>
                <span>
                  <i className="t2" /> Centre 2
                </span>
                <span>
                  <i className="t3" /> Centre 3
                </span>
              </div>
            </div>

            <div className="bl-revGrouped" aria-hidden="true">
              <div className="bl-revY">
                <span>$500K</span>
                <span>$300K</span>
                <span>$100K</span>
              </div>
              <div className="bl-revGroupedBars">
                {GROUPED_BARS.map((row, i) => (
                  <div key={row.month} className="bl-revGroupCol">
                    <div className="bl-revGroupStack">
                      <motion.i
                        className="t1"
                        initial={reduced ? false : { height: 0 }}
                        whileInView={{ height: `${row.c1}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 + i * 0.05, duration: 0.55 }}
                      />
                      <motion.i
                        className="t2"
                        initial={reduced ? false : { height: 0 }}
                        whileInView={{ height: `${row.c2}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 + i * 0.05, duration: 0.55 }}
                      />
                      <motion.i
                        className="t3"
                        initial={reduced ? false : { height: 0 }}
                        whileInView={{ height: `${row.c3}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.16 + i * 0.05, duration: 0.55 }}
                      />
                    </div>
                    <span>{row.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bl-revCallout is-good" aria-hidden>
              <CheckCircle2 size={14} />
              Centre 1 is the top contributor
            </div>
          </div>

          <div className="bl-revBottom">
            <div className="bl-revPanel bl-revShare">
              <strong>Revenue Share</strong>
              <div className="bl-revDonut" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="40" className="bl-revDonutHole" />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    className="bl-revDonutSeg s1"
                    strokeDasharray="150.8 100.5"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    className="bl-revDonutSeg s2"
                    strokeDasharray="62.8 188.5"
                    strokeDashoffset="-150.8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    className="bl-revDonutSeg s3"
                    strokeDasharray="37.7 213.6"
                    strokeDashoffset="-213.6"
                  />
                </svg>
                <div className="bl-revDonutLabels">
                  <span>60%</span>
                  <span>25%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            <div className="bl-revPanel bl-revRates">
              <strong>Collection Rate by Centre</strong>
              <ul>
                {COLLECTION_RATES.map((row) => (
                  <li key={row.id}>
                    <div className="bl-revRateRow">
                      <em>{row.label}</em>
                      <span>{row.value}%</span>
                    </div>
                    <div className="bl-revRateTrack">
                      <motion.i
                        className={`t${row.tone}`}
                        initial={reduced ? false : { width: 0 }}
                        whileInView={{ width: `${row.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bl-revCallout is-warn" aria-hidden>
                <AlertCircle size={14} />
                Centre 3 needs follow-up
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
