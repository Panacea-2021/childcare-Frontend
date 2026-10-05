'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ENT_JOURNEY } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, floatAnim, slideLeft, slideRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function EntJourney() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  return (
    <section className="ent-journey" aria-labelledby="ent-journey-heading">
      <div className="ent-journeyGrid">
        <EntReveal className="ent-journeyCopy" variants={slideLeft}>
          <h2 id="ent-journey-heading">{ENT_JOURNEY.title}</h2>
          <p className="ent-journeyLead">{ENT_JOURNEY.lead}</p>
          <motion.ul
            className="ent-journeyBullets"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            {ENT_JOURNEY.bullets.map((item) => (
              <motion.li key={item.title} variants={fadeUp}>
                <span className="ent-journeyCheck" aria-hidden>
                  <Check size={14} strokeWidth={2.6} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </EntReveal>

        <EntReveal className="ent-journeyVisual" variants={slideRight} amount={0.25}>
          <div className="ent-journeyStage">
            <span className="ent-journeyGlow" aria-hidden />
            {ENT_JOURNEY.stack.map((card, i) => (
              <motion.article
                key={card.title}
                className={`ent-journeyFloat ent-journeyFloat-${card.tone}`}
                style={{ ['--ent-stack' as string]: i }}
                {...(live ? floatAnim(5 + i, 5.2 + i * 0.4) : {})}
              >
                <strong>{card.title}</strong>
                <span>{card.meta}</span>
              </motion.article>
            ))}
          </div>
        </EntReveal>
      </div>
    </section>
  );
}
