'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Star } from 'lucide-react';
import { getFeaturedCaseStudy } from './data';
import { fadeScale, fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function CsHero() {
  const reduced = usePrefersReducedMotion();
  const featured = getFeaturedCaseStudy();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.28);
  const href = `/resources/case-studies/${featured.slug}`;

  return (
    <section className="cs-hero">
      <div className="cs-heroGlow cs-heroGlow--a" aria-hidden />
      <div className="cs-heroGlow cs-heroGlow--b" aria-hidden />

      <motion.span
        className="cs-deco cs-deco--star"
        aria-hidden
        {...(reduced ? {} : floatAnim(8, 6.2, 0.1))}
      >
        <Star size={12} fill="currentColor" strokeWidth={0} />
      </motion.span>
      <motion.span
        className="cs-deco cs-deco--spark"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 7.1, 0.4))}
      >
        <Sparkles size={14} />
      </motion.span>
      <motion.span
        className="cs-deco cs-deco--dot a"
        aria-hidden
        {...(reduced ? {} : floatAnim(5, 5.4, 0.2))}
      />
      <motion.span
        className="cs-deco cs-deco--dot b"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 6.8, 0.8))}
      />

      <div className="cs-wrap cs-heroGrid">
        <motion.div
          className="cs-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.h1 variants={fadeUp}>
            See why educators love
            <br />
            using Panacea
          </motion.h1>
          <motion.p variants={fadeUp}>
            Real stories from childcare centers that simplified billing, attendance, enrollment,
            and parent communication with Panacea.
          </motion.p>
        </motion.div>

        <motion.div
          className="cs-heroVisual"
          variants={fadeScale}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <div
            ref={ref}
            className="cs-featuredWrap"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={
              reduced
                ? undefined
                : {
                    transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  }
            }
          >
            <Link
              href={href}
              className="cs-featured"
              aria-label={`Read case study: ${featured.title}`}
            >
              <div className="cs-featuredMedia">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.heroImage}
                  alt=""
                  width={480}
                  height={520}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="cs-featuredMeta">
                <p>{featured.heroCaption ?? `Customer Spotlight: ${featured.customer}`}</p>
                <p className="cs-featuredLoc">
                  <MapPin size={12} aria-hidden />
                  {featured.location}
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
