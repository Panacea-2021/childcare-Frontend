'use client';

import { motion } from 'framer-motion';
import { Check, FileText, Sparkles } from 'lucide-react';
import { ATTENDANCE_BILLING_POINTS } from './data';
import { AttReveal } from './AttReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ROWS = [
  { name: 'Liam Chen', hours: '8.0 hrs', status: 'Paid', amount: '$185', tone: 'good' },
  { name: 'Ava Brooks', hours: '6.5 hrs', status: 'Pending', amount: '$148', tone: 'warn' },
  { name: 'Noah Diaz', hours: '7.25 hrs', status: 'Paid', amount: '$170', tone: 'good' },
  { name: 'Mia Okonkwo', hours: '4.0 hrs', status: 'Due', amount: '$92', tone: 'due' },
] as const;

export function AttendanceBilling() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="att-split is-reverse att-billingSection">
      <AttReveal className="att-splitVisual att-billVisual" variants={slideFromLeft}>
        <div className="att-billGlow" aria-hidden />
        <div className="att-billOrb att-billOrb-a" aria-hidden />
        <div className="att-billOrb att-billOrb-b" aria-hidden />

        <motion.div
          className="att-billCard"
          initial={reduced ? false : { opacity: 0, y: 26, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div {...(reduced ? {} : floatAnim(7, 5.9))}>
            <div className="att-billHead">
              <strong>Attendance-based billing</strong>
              <span>Current month</span>
            </div>
            <div className="att-billTable">
              <div className="att-billRow is-head">
                <span>Child</span>
                <span>Hours</span>
                <span>Status</span>
                <span>Amount</span>
              </div>
              {ROWS.map((row, i) => (
                <motion.div
                  key={row.name}
                  className="att-billRow"
                  initial={reduced ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.16 + i * 0.08 }}
                  whileHover={reduced ? undefined : { x: 3, backgroundColor: '#f1f5f9' }}
                >
                  <span>{row.name}</span>
                  <span>{row.hours}</span>
                  <em className={`att-pill tone-${row.tone}`}>{row.status}</em>
                  <strong>{row.amount}</strong>
                </motion.div>
              ))}
            </div>
            <div className="att-billFooter">
              <em>Synced from attendance</em>
              <strong>$595 collected</strong>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="att-invoiceFloat"
          initial={reduced ? false : { opacity: 0, y: 18, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 140, damping: 16 }}
        >
          <motion.div {...(reduced ? {} : floatAnim(5, 4.6))}>
            <span className="att-invoiceIcon" aria-hidden>
              <FileText size={15} />
            </span>
            Invoice generated
            <Sparkles size={13} className="att-invoiceSpark" aria-hidden />
          </motion.div>
        </motion.div>
      </AttReveal>

      <AttReveal className="att-splitCopy" variants={slideFromRight}>
        <p className="att-eyebrow">Smart billing</p>
        <h2>Make Billing Effortless &amp; Error-Free</h2>
        <p className="att-support">
          Connect attendance with billing so your center spends less time correcting records and
          more time focusing on children.
        </p>
        <motion.ul
          className="att-featureList"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          {ATTENDANCE_BILLING_POINTS.map((point) => (
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
    </div>
  );
}
