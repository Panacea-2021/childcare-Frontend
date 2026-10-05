'use client';

import Image from 'next/image';
import { Check, Cloud, Lock, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SC_RELIABLE } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function ScReliable() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 20, reduced ? 0 : -16]);

  return (
    <div ref={ref} className="sc-split sc-reliable">
      <motion.div
        className="sc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="sc-eyebrow" variants={fadeUp}>
          {SC_RELIABLE.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{SC_RELIABLE.title}</motion.h2>
        <motion.p className="sc-sectionLead" variants={fadeUp}>
          {SC_RELIABLE.lead}
        </motion.p>
        <ul className="sc-checkList">
          {SC_RELIABLE.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="sc-check" aria-hidden>
                <Check size={14} strokeWidth={2.8} />
              </span>
              <div>
                <strong>{p.title}</strong>
                <em>{p.detail}</em>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="sc-splitVisual"
        variants={slideFromRight}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="sc-secureStage">
          <motion.div className="sc-securePhoto" style={{ y }}>
            <Image
              src={SC_RELIABLE.image}
              alt="Secure childcare data and reliable backups"
              fill
              sizes="(max-width: 900px) 90vw, 420px"
              className="sc-cover"
            />
            <span className="sc-secureGlow" aria-hidden>
              <Cloud size={34} strokeWidth={1.5} />
              <Lock size={16} strokeWidth={2.4} />
            </span>
          </motion.div>
          <motion.div
            className="sc-secureBadge"
            {...(reduced ? {} : floatAnim(7, 5.8, 0.25))}
          >
            <ShieldCheck size={15} aria-hidden />
            Data Backup
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
