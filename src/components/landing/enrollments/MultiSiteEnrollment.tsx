'use client';

import Link from 'next/link';
import {
  BarChart3,
  SlidersHorizontal,
  ShieldCheck,
  MessagesSquare,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NETWORK_CENTERS, NETWORK_PILLARS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = [BarChart3, SlidersHorizontal, ShieldCheck, MessagesSquare];

const FILTERS = ['DC-Metro', 'Midwest', 'N. Texas'];

export function MultiSiteEnrollment() {
  const reduced = usePrefersReducedMotion();
  const CHART_MAX = 120;

  return (
    <section className="en-network" aria-labelledby="en-network-title">
      <div className="en-networkTop">
        <motion.h2
          id="en-network-title"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          The Enrollment Software built for Multi-Site Childcare Organizations
        </motion.h2>

        <motion.div
          className="en-networkNote"
          initial={reduced ? false : { opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <TrendingUp size={16} aria-hidden />
          <span>Multi-site operators grow network occupancy 22% faster with Panacea.</span>
          <Link href="/features/enrollments/stories/harbor-kids-network" className="en-noteBtn">
            Read More
          </Link>
        </motion.div>
      </div>

      <div className="en-networkPillars" role="list">
        <div className="en-pillarRail" aria-hidden="true" />
        {NETWORK_PILLARS.map((pillar, i) => {
          const Icon = ICONS[i] ?? BarChart3;
          return (
            <motion.article
              key={pillar.id}
              className="en-pillar"
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduced ? undefined : { y: -4 }}
            >
              <span className="en-pillarIcon" aria-hidden="true">
                <Icon size={18} strokeWidth={2.1} />
              </span>
              <strong>{pillar.title}</strong>
              <p>{pillar.detail}</p>
            </motion.article>
          );
        })}
      </div>

      <motion.div
        className="en-msDash"
        initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="en-msDashHead">
          <strong>Multi-Site Dashboard</strong>
          <span>Live network view</span>
        </div>

        <div className="en-metricRow">
          <motion.div
            className="en-metric"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="en-metricTop">
              <strong>1,777</strong>
              <em className="en-up">+18%</em>
            </div>
            <span>New Inquiries</span>
          </motion.div>
          <motion.div
            className="en-metric"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
          >
            <strong>195</strong>
            <span>Total Conversions</span>
          </motion.div>
          <motion.div
            className="en-metric"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22 }}
          >
            <strong>23</strong>
            <span>Overdue Follow Ups</span>
          </motion.div>
        </div>

        <div className="en-filterPills">
          {FILTERS.map((f) => (
            <button type="button" key={f} className="is-on">
              {f}
              <X size={12} aria-hidden />
            </button>
          ))}
          <button type="button" className="en-filterMore">
            +4 more
          </button>
        </div>

        <div className="en-chartBlock">
          <div className="en-chartToolbar">
            <div className="en-chartLegend">
              <span>
                <i className="lg-fb" /> Facebook
              </span>
              <span>
                <i className="lg-walk" /> Walk-ins
              </span>
              <span>
                <i className="lg-other" /> Other Sources
              </span>
            </div>

            <motion.div
              className="en-chartCallout"
              initial={reduced ? false : { opacity: 0, y: -6, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <span className="en-chartCalloutIcon" aria-hidden="true">
                <CheckCircle2 size={13} strokeWidth={2.4} />
              </span>
              Center 1 is your highest-performing this quarter.
            </motion.div>
          </div>

          <div className="en-chartPlot" aria-hidden="true">
            <div className="en-chartGrid">
              {[120, 90, 60, 30, 0].map((tick) => (
                <div key={tick} className="en-chartGridRow">
                  <span>{tick}</span>
                  <i />
                </div>
              ))}
            </div>

            <div className="en-stackChart">
              {NETWORK_CENTERS.map((c, index) => {
                const total = c.facebook + c.walkins + c.other;
                const heightPct = (total / CHART_MAX) * 100;
                const fbPct = (c.facebook / total) * 100;
                const walkPct = (c.walkins / total) * 100;
                const otherPct = (c.other / total) * 100;

                return (
                  <div key={c.id} className={`en-stackCol${index === 0 ? ' is-top' : ''}`}>
                    <div className="en-stackTrack">
                      <motion.div
                        className="en-stackBars"
                        initial={reduced ? false : { height: 0 }}
                        whileInView={{ height: `${heightPct}%` }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.12 + index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <i className="fb" style={{ height: `${fbPct}%` }} />
                        <i className="walk" style={{ height: `${walkPct}%` }} />
                        <i className="other" style={{ height: `${otherPct}%` }} />
                      </motion.div>
                    </div>
                    <span>{c.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
