'use client';

import Image from 'next/image';
import { Check, Cookie } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SC_SECURE_DAY } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function ScSecureDay() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 16, reduced ? 0 : -16]);

  return (
    <div ref={ref} className="sc-split sc-secureDay is-reverse">
      <motion.div
        className="sc-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="sc-phoneStage">
          <motion.div className="sc-phone" style={{ y }} {...(reduced ? {} : floatAnim(5, 6, 0.2))}>
            <div className="sc-phoneHead">
              <strong>Meal Update</strong>
              <em>Maya · Room A</em>
            </div>
            <div className="sc-phoneMedia">
              <Image
                src={SC_SECURE_DAY.mealImage}
                alt="Meal update shared with parents"
                fill
                sizes="240px"
                className="sc-cover"
              />
            </div>
            <p>Enjoyed yogurt and fruit after outdoor play — great appetite today.</p>
            <div className="sc-phoneMeta">
              <Cookie size={14} aria-hidden /> Food · 12:15 PM
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="sc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="sc-eyebrow" variants={fadeUp}>
          {SC_SECURE_DAY.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{SC_SECURE_DAY.title}</motion.h2>
        <motion.p className="sc-sectionLead" variants={fadeUp}>
          {SC_SECURE_DAY.lead}
        </motion.p>
        <ul className="sc-checkList">
          {SC_SECURE_DAY.points.map((p) => (
            <motion.li key={p.title} variants={slideFromRight}>
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
    </div>
  );
}
