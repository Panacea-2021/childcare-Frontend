'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import './landing-faq.css';

export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  titleId: string;
  description: string;
  items: readonly LandingFaqItem[];
  chips: readonly string[];
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

export function LandingFaq({ titleId, description, items, chips, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const openIndex = Math.max(
    0,
    items.findIndex((item) => item.id === openId),
  );
  const progressLabel = `${String(openIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const floatY = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -18]);

  return (
    <section
      ref={sectionRef}
      className={`lf-faq${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
    >
      <div className="lf-faqBlob lf-faqBlob-a" aria-hidden />
      <div className="lf-faqBlob lf-faqBlob-b" aria-hidden />

      <aside className="lf-faqIntro">
        <motion.div className="lf-faqIntroFloat" style={reduced ? undefined : { y: floatY }}>
          <motion.div
            className="lf-faqIntroInner"
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
          >
            <p className="lf-faqEyebrow">FAQ</p>
            <h2 id={titleId}>
              Frequently Asked
              <br />
              Questions
            </h2>
            <p className="lf-faqLead">{description}</p>

            <div className="lf-faqChips" aria-hidden>
              {chips.map((chip) => (
                <span key={chip} className="lf-faqChip">
                  <Check size={12} strokeWidth={2.6} />
                  {chip}
                </span>
              ))}
            </div>

            <div className="lf-faqProgress" aria-live="polite">
              <span className="lf-faqProgressLine" aria-hidden />
              <em>{progressLabel}</em>
              <span>Explore common questions</span>
            </div>
          </motion.div>
        </motion.div>
      </aside>

      <motion.div
        className="lf-faqList"
        variants={stagger}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
      >
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <motion.div
              key={item.id}
              className={`lf-faqItem${open ? ' is-open' : ''}`}
              variants={fadeUp}
            >
              <button
                type="button"
                className="lf-faqQuestion"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <motion.span
                  className="lf-faqToggle"
                  aria-hidden
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {open ? <Minus size={16} /> : <Plus size={16} />}
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    className="lf-faqAnswer"
                    initial={{ height: 0, opacity: 0, y: -5 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -5 }}
                    transition={{ duration: 0.32, ease }}
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
