'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ATTENDANCE_TESTIMONIALS } from './data';
import { AttReveal } from './AttReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const AVATARS = ATTENDANCE_TESTIMONIALS.slice(0, 5);

export function AttendanceCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <AttReveal className="att-cta" variants={fadeUp} amount={0.25}>
      <div className="att-ctaGlow" aria-hidden />
      <div className="att-ctaOrb att-ctaOrb-a" aria-hidden />
      <div className="att-ctaOrb att-ctaOrb-b" aria-hidden />
      <div className="att-ctaOrb att-ctaOrb-c" aria-hidden />

      <motion.div
        className="att-ctaInner"
        animate={
          reduced
            ? undefined
            : {
                backgroundPosition: ['0% 40%', '100% 60%', '0% 40%'],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      >
        <div className="att-ctaSheen" aria-hidden />

        <motion.div
          className="att-ctaCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p className="att-eyebrow" variants={fadeUp}>
            <Sparkles size={13} aria-hidden /> Start with Panacea
          </motion.p>
          <motion.h2 variants={fadeUp}>
            Ready for attendance that stays accurate all day?
          </motion.h2>
          <motion.p className="att-ctaLead" variants={fadeUp}>
            See how Panacea brings check-in, occupancy, safety, compliance, and billing together in
            one connected experience.
          </motion.p>

          <motion.div className="att-ctaSocial" variants={fadeUp}>
            <div className="att-ctaAvatars" aria-hidden>
              {AVATARS.map((person, i) => (
                <img
                  key={person.id}
                  src={person.avatar}
                  alt=""
                  width={40}
                  height={40}
                  style={{ zIndex: AVATARS.length - i }}
                />
              ))}
            </div>
            <p>Trusted by directors who want calmer mornings and cleaner records.</p>
          </motion.div>

          <motion.div className="att-ctaActions" variants={fadeUp}>
            <Link href="/book-demo" className="ui-btn ui-btn-primary att-btnPrimary">
              Book a Demo
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/features/enrollments" className="ui-btn ui-btn-outline att-btnGhost">
              Explore Panacea
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </AttReveal>
  );
}
