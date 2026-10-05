'use client';

import { motion } from 'framer-motion';
import { Check, MapPin, Shield, ShieldCheck } from 'lucide-react';
import { ATTENDANCE_SAFETY_POINTS } from './data';
import { AttReveal } from './AttReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AttendanceSafety() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="att-split att-safetySection">
      <AttReveal className="att-splitCopy" variants={slideFromLeft}>
        <p className="att-eyebrow">Safety &amp; compliance</p>
        <h2>Enhanced Safety and Compliance</h2>
        <p className="att-support">
          Keep presence, pickups, and audit history organized so directors can act with confidence.
        </p>
        <motion.ul
          className="att-featureList"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {ATTENDANCE_SAFETY_POINTS.map((point) => (
            <motion.li key={point.title} variants={fadeUp}>
              <span className="att-featureIcon" aria-hidden>
                <Check size={14} strokeWidth={2.6} />
              </span>
              <div>
                <strong>{point.title}</strong>
                <p>{point.detail}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </AttReveal>

      <AttReveal className="att-splitVisual att-safetyVisual" variants={slideFromRight}>
        <div className="att-safetyGlow" aria-hidden />
        <div className="att-safetyOrb att-safetyOrb-a" aria-hidden />
        <div className="att-safetyOrb att-safetyOrb-b" aria-hidden />

        <motion.div
          className="att-safetyPhone"
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div {...(reduced ? {} : floatAnim(8, 5.4))}>
            <div className="att-safetyPhoneInner">
              <div className="att-childHero">
                <span aria-hidden>S</span>
                <div>
                  <strong>Sofia Patel</strong>
                  <em>
                    <i className="att-presentDot" /> Present · Room B
                  </em>
                </div>
                <ShieldCheck className="att-childShield" size={18} aria-hidden />
              </div>
              <div className="att-timeline">
                {[
                  { title: '8:04 AM', detail: 'Checked in by Maya P.' },
                  { title: 'Authorized', detail: 'Parent · Maya Patel' },
                  { title: 'Ratio', detail: 'Toddlers 1:5 · Healthy' },
                ].map((row, i) => (
                  <motion.div
                    key={row.title}
                    initial={reduced ? false : { opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.22 + i * 0.08 }}
                  >
                    <strong>{row.title}</strong>
                    <span>{row.detail}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="att-safetyChip f1"
          initial={reduced ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28, type: 'spring', stiffness: 130, damping: 16 }}
        >
          <motion.div {...(reduced ? {} : floatAnim(6, 4.6))}>
            <MapPin size={14} aria-hidden />
            Track presence in real time
          </motion.div>
        </motion.div>

        <motion.div
          className="att-safetyChip f2"
          initial={reduced ? false : { opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.38, type: 'spring', stiffness: 130, damping: 16 }}
        >
          <motion.div {...(reduced ? {} : floatAnim(5, 5.1))}>
            <Shield size={14} aria-hidden />
            Pickup verified
          </motion.div>
        </motion.div>
      </AttReveal>
    </div>
  );
}
