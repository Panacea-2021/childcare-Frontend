'use client';

import Image from 'next/image';
import { Check, Cloud, Lock, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { DC_SECURITY } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function DcSecurity() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 18, reduced ? 0 : -14]);

  return (
    <div ref={ref} className="dc-split dc-security">
      <motion.div
        className="dc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="dc-eyebrow" variants={fadeUp}>
          {DC_SECURITY.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{DC_SECURITY.title}</motion.h2>
        <motion.p className="dc-sectionLead" variants={fadeUp}>
          {DC_SECURITY.lead}
        </motion.p>
        <ul className="dc-checkList">
          {DC_SECURITY.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="dc-check" aria-hidden>
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
        className="dc-splitVisual"
        variants={slideFromRight}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="dc-secureStage">
          <motion.div className="dc-securePhoto" style={{ y }}>
            <Image
              src={DC_SECURITY.image}
              alt="Secure daycare data and reliable backups"
              fill
              sizes="(max-width: 900px) 90vw, 420px"
              className="dc-cover"
            />
            <span className="dc-secureGlow" aria-hidden>
              <Cloud size={34} strokeWidth={1.5} />
              <Lock size={16} strokeWidth={2.4} />
            </span>
          </motion.div>
          <motion.div
            className="dc-secureBadge"
            {...(reduced ? {} : floatAnim(7, 5.8, 0.2))}
          >
            <ShieldCheck size={15} aria-hidden />
            Data Backup
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
