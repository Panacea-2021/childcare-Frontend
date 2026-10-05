'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ResourceItem } from './data';
import { ResourceCoverArt } from './ResourceCoverArt';
import { fadeUp } from './motion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  item: ResourceItem;
  compact?: boolean;
};

export function ResourceCard({ item, compact = false }: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.32);
  const href = `/resources/${item.slug}`;

  return (
    <motion.article className={`rc-card${compact ? ' rc-card--compact' : ''}`} variants={fadeUp}>
      <Link
        href={href}
        className="rc-cardLink"
        onMouseMove={(e) => {
          if (window.innerWidth < 900) return;
          onMove(e);
        }}
        onMouseLeave={onLeave}
      >
        <motion.div
          ref={ref}
          className="rc-cardMedia"
          style={{
            rotateX: reduced ? 0 : `${tilt.rx}deg`,
            rotateY: reduced ? 0 : `${tilt.ry}deg`,
            transformStyle: 'preserve-3d',
            perspective: 900,
          }}
        >
          <ResourceCoverArt item={item} />
        </motion.div>
        <div className="rc-cardBody">
          <span className="rc-cardCat">{item.category}</span>
          <div className="rc-cardRow">
            <h3>{item.title}</h3>
            <span className="rc-getIt">
              Get it <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
