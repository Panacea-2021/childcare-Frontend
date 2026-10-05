'use client';

import Image from 'next/image';
import { Check, Cloud, Lock, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PS_SECURITY } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function PsSecurity() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 22, reduced ? 0 : -16]);

  return (
    <div ref={ref} className="ps-split ps-security is-reverse">
      <motion.div
        className="ps-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="ps-secureStage">
          <motion.div className="ps-securePhoto" style={{ y }}>
            <Image
              src={PS_SECURITY.image}
              alt="Trusted preschool educator in a secure learning environment"
              fill
              sizes="(max-width: 900px) 90vw, 420px"
              className="ps-coverImg"
            />
            <span className="ps-secureGlow" aria-hidden>
              <Cloud size={36} strokeWidth={1.5} />
              <Lock size={18} strokeWidth={2.4} />
            </span>
          </motion.div>

          <motion.div
            className="ps-secureBadge"
            {...(reduced ? {} : floatAnim(7, 6, 0.2))}
          >
            <ShieldCheck size={16} aria-hidden />
            Data Backup
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="ps-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="ps-eyebrow" variants={fadeUp}>
          {PS_SECURITY.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{PS_SECURITY.title}</motion.h2>
        <motion.p className="ps-sectionLead" variants={fadeUp}>
          {PS_SECURITY.lead}
        </motion.p>
        <ul className="ps-checkList">
          {PS_SECURITY.points.map((p) => (
            <motion.li key={p.title} variants={slideFromRight}>
              <span className="ps-check is-accent" aria-hidden>
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
    </div>
  );
}
