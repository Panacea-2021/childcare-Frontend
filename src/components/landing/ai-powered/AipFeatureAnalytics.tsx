'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, TrendingUp, Users } from 'lucide-react';
import { AIP_ANALYTICS_POINTS } from './data';
import { AipReveal } from './AipReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const CHART_PATH =
  'M8 78 C 40 70, 55 40, 90 48 C 125 56, 145 28, 180 34 C 210 38, 230 18, 262 22';

export function AipFeatureAnalytics() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, amount: 0.45 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;
  const draw = inView && !reduced;

  return (
    <div className="aip-featureCard">
      <div className="aip-featureSplit">
        <AipReveal className="aip-featureVisual" variants={slideFromLeft}>
          <div ref={chartRef} className="aip-analyticsStage">
            <motion.div
              className="aip-analyticsCard"
              {...(live ? floatAnim(5, 5.8) : {})}
            >
              <div className="aip-analyticsHead">
                <div>
                  <strong>Center insights</strong>
                  <em>Last 30 days</em>
                </div>
                <span className="aip-analyticsTrend">
                  <TrendingUp size={14} aria-hidden />
                  +12%
                </span>
              </div>

              <div className="aip-analyticsBody">
                <svg
                  className={`aip-lineChart${draw ? ' is-draw' : ''}`}
                  viewBox="0 0 270 96"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="aipChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(93,95,239,0.28)" />
                      <stop offset="100%" stopColor="rgba(93,95,239,0)" />
                    </linearGradient>
                  </defs>
                  <path
                    className="aip-lineFill"
                    d={`${CHART_PATH} L 262 96 L 8 96 Z`}
                    fill="url(#aipChartFill)"
                  />
                  <path className="aip-linePath" d={CHART_PATH} fill="none" />
                </svg>

                <div className="aip-analyticsBottom">
                  <div className="aip-donut" aria-hidden>
                    <svg viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="20" className="aip-donutTrack" />
                      <circle
                        cx="28"
                        cy="28"
                        r="20"
                        className={`aip-donutFill${draw ? ' is-draw' : ''}`}
                      />
                    </svg>
                    <em>84%</em>
                  </div>
                  <ul className="aip-metrics">
                    <li>
                      <Users size={13} aria-hidden />
                      <span>Staff load balanced</span>
                      <strong>Healthy</strong>
                    </li>
                    <li>
                      <TrendingUp size={13} aria-hidden />
                      <span>Enrollment forecast</span>
                      <strong>+6 seats</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </AipReveal>

        <AipReveal className="aip-featureCopy" variants={slideFromRight}>
          <h2>Accelerate Revenue with AI-Driven Analytics</h2>
          <motion.ul
            className="aip-pointList"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            {AIP_ANALYTICS_POINTS.map((point) => (
              <motion.li key={point.title} variants={fadeUp}>
                <span className="aip-pointIcon" aria-hidden>
                  <Check size={14} strokeWidth={2.6} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.detail}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </AipReveal>
      </div>
    </div>
  );
}
