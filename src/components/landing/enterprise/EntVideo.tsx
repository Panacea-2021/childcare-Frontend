'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { CurvedBand } from '../shared/CurvedBand';
import { ENT_VIDEO } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function EntVideo() {
  const reduced = usePrefersReducedMotion();

  return (
    <CurvedBand band="#2a1748" edge="#ffffff" id="ent-video" className="ent-videoBand">
      <section className="ent-video" aria-labelledby="ent-video-heading">
        <div className="ent-wrap">
          <EntReveal className="ent-videoHead" variants={fadeUp}>
            <h2 id="ent-video-heading">{ENT_VIDEO.title}</h2>
          </EntReveal>

          <EntReveal className="ent-videoFrame" variants={scaleIn} amount={0.3}>
            <Link
              href={ENT_VIDEO.ctaHref}
              className="ent-videoPoster"
              aria-label={ENT_VIDEO.ctaLabel}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ENT_VIDEO.poster}
                alt=""
                width={1200}
                height={675}
                loading="lazy"
              />
              <span className="ent-videoShade" aria-hidden />
              <motion.span
                className="ent-videoPlay"
                aria-hidden
                whileHover={reduced ? undefined : { scale: 1.06 }}
                whileTap={reduced ? undefined : { scale: 0.96 }}
              >
                <Play size={28} fill="currentColor" />
              </motion.span>
            </Link>
          </EntReveal>
        </div>
      </section>
    </CurvedBand>
  );
}
