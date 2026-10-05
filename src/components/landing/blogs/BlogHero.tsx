'use client';

import { motion } from 'framer-motion';
import { BookOpen, School, Star } from 'lucide-react';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function BlogHero() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="bl-hero">
      <div className="bl-heroGlow" aria-hidden />
      <motion.span
        className="bl-heroDecor bl-heroDecor--school"
        aria-hidden
        {...(reduced ? {} : floatAnim(8, 7.5, 0.2))}
      >
        <School size={28} strokeWidth={1.5} />
      </motion.span>
      <motion.span
        className="bl-heroDecor bl-heroDecor--book"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 6.2, 0.8))}
      >
        <BookOpen size={22} strokeWidth={1.5} />
      </motion.span>
      <motion.span
        className="bl-heroDecor bl-heroDecor--star"
        aria-hidden
        {...(reduced ? {} : floatAnim(5, 5.5, 1.2))}
      >
        <Star size={16} fill="currentColor" strokeWidth={0} />
      </motion.span>

      <motion.div
        className="bl-wrap bl-heroCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate="show"
      >
        <motion.h1 variants={fadeUp}>Early Childhood Education insights</motion.h1>
        <motion.p variants={fadeUp}>designed to help you grow</motion.p>
      </motion.div>
    </section>
  );
}
