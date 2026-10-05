'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { floatAnim } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AipPromo() {
  const reduced = usePrefersReducedMotion();
  const live = !reduced;

  return (
    <motion.div
      className="aip-promo"
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="aip-promoMedia">
        <img
          src="/images/parent-communication/learning.jpg"
          alt=""
          width={720}
          height={400}
          loading="lazy"
        />
        <div className="aip-promoOverlay" aria-hidden>
          <motion.div
            className="aip-promoFloat a"
            {...(live ? floatAnim(5, 5.2) : {})}
          >
            <strong>Daily report</strong>
            <p>Emma · Nap · Meals · Mood</p>
          </motion.div>
          <motion.div
            className="aip-promoFloat b"
            {...(live ? floatAnim(4, 6) : {})}
          >
            <img
              src="/images/parent-communication/teacher.jpg"
              alt=""
              width={40}
              height={40}
              loading="lazy"
            />
            <span>AI draft ready</span>
          </motion.div>
        </div>
      </div>

      <div className="aip-promoCopy">
        <h2>What If AI Wrote Your Daily Reports?</h2>
        <div className="aip-promoActions">
          <Link href="/book-demo" className="aip-promoWatch">
            <Play size={15} aria-hidden />
            Watch Now
          </Link>
          <Link href="/features/ai/daily-reports" className="aip-promoMore">
            Learn More
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
