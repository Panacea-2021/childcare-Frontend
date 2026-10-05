'use client';

import { motion } from 'framer-motion';
import { Check, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
import { ATTENDANCE_CHECKIN_POINTS } from './data';
import { AttReveal } from './AttReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const KIDS = [
  { name: 'Sofia', status: 'present', tone: 'a' },
  { name: 'Noah', status: 'pending', tone: 'b' },
  { name: 'Ava', status: 'present', tone: 'c' },
] as const;

export function AttendanceCheckIn() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="att-split att-checkinSection">
      <AttReveal className="att-splitCopy" variants={slideFromLeft}>
        <p className="att-eyebrow">Door workflow</p>
        <h2>Contactless Check-In and Check-Out</h2>
        <p className="att-support">
          Keep arrivals calm and accurate with a digital workflow families finish in seconds.
        </p>
        <motion.ul
          className="att-featureList"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          {ATTENDANCE_CHECKIN_POINTS.map((point) => (
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

      <AttReveal className="att-splitVisual att-checkVisual" variants={slideFromRight}>
        <div className="att-checkGlow" aria-hidden />
        <div className="att-checkOrb att-checkOrb-a" aria-hidden />
        <div className="att-checkOrb att-checkOrb-b" aria-hidden />

        <motion.div
          className="att-layerDash"
          initial={reduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div {...(reduced ? {} : floatAnim(6, 5.8))}>
            <div className="att-layerDashHead">
              <strong>Room check-in</strong>
              <span className="att-live">Live</span>
            </div>
            <div className="att-layerKids" aria-hidden>
              {KIDS.map((kid, i) => (
                <motion.span
                  key={kid.name}
                  className={`is-${kid.status}`}
                  initial={reduced ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.28 + i * 0.08 }}
                >
                  <i className={`tone-${kid.tone}`}>{kid.name[0]}</i>
                  <em>{kid.name}</em>
                  <b>{kid.status === 'present' ? 'In' : 'Wait'}</b>
                </motion.span>
              ))}
            </div>
            <div className="att-miniStats">
              <em>18 present</em>
              <em>2 pending</em>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="att-layerPhone"
          initial={reduced ? false : { opacity: 0, x: 24, rotate: 4 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 120, damping: 16 }}
        >
          <motion.div {...(reduced ? {} : floatAnim(9, 5.1))}>
            <div className="att-layerPhoneInner">
              {!reduced ? (
                <span className="att-qrPulse" aria-hidden>
                  <i />
                  <i />
                </span>
              ) : null}
              <div className="att-qrFrame">
                <QrCode size={56} strokeWidth={1.5} aria-hidden />
              </div>
              <strong>Scan QR</strong>
              <span>Authorized pickup only</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="att-layerToast"
          initial={reduced ? false : { opacity: 0, y: 22, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 140, damping: 16 }}
        >
          <motion.div {...(reduced ? {} : floatAnim(5, 4.5))}>
            <span className="att-toastIcon" aria-hidden>
              <CheckCircle2 size={16} />
            </span>
            <div>
              <strong>Check-in successful</strong>
              <span>Sofia · Toddlers · 8:04 AM</span>
            </div>
            <Sparkles className="att-toastSpark" size={14} aria-hidden />
          </motion.div>
        </motion.div>
      </AttReveal>
    </div>
  );
}
