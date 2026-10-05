'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { SC_SOLUTION } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

function IntegrationOrb({
  label,
  domain,
  index,
  reduced,
}: {
  label: string;
  domain: string;
  index: number;
  reduced: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : `https://logo.clearbit.com/${domain}`;

  return (
    <motion.span
      className={`sc-ecoOrb sc-ecoOrb--${index}`}
      aria-hidden
      {...(reduced ? {} : floatAnim(5 + (index % 3), 5.4 + index * 0.35, index * 0.28))}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      <em>{label}</em>
    </motion.span>
  );
}

export function ScSolution() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="sc-split sc-solution">
      <motion.div
        className="sc-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="sc-ecoPanel">
          <div className="sc-ecoStage" aria-hidden>
            <motion.div
              className="sc-ecoCore"
              {...(reduced ? {} : floatAnim(6, 6.4, 0.2))}
            >
              <Image
                src="/brand/panacea-mark.png"
                alt=""
                width={56}
                height={56}
                priority={false}
              />
            </motion.div>
            {SC_SOLUTION.integrations.map((item, i) => (
              <IntegrationOrb
                key={item.id}
                label={item.label}
                domain={item.domain}
                index={i}
                reduced={reduced}
              />
            ))}
          </div>
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
        <motion.h2 variants={fadeUp}>{SC_SOLUTION.title}</motion.h2>
        <motion.p className="sc-solutionLead" variants={fadeUp}>
          {SC_SOLUTION.lead}
        </motion.p>
        <motion.hr className="sc-solutionRule" variants={fadeUp} />
        <ul className="sc-checkList sc-solutionList">
          {SC_SOLUTION.points.map((p) => (
            <motion.li key={p.title} variants={slideFromRight}>
              <span className="sc-check is-mint" aria-hidden>
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
