'use client';

import { useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Folder, Globe, MessageCircle, Play, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  articleCount,
  authorSummary,
  type ProductGuide,
} from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { pgCardVariants, pgStagger } from './motion';

const ICONS: Record<ProductGuide['icon'], LucideIcon> = {
  book: BookOpen,
  play: Play,
  folder: Folder,
  users: Users,
  chat: MessageCircle,
  globe: Globe,
};

const ACCENTS = [
  'pg-card--violet',
  'pg-card--rose',
  'pg-card--sky',
  'pg-card--mint',
  'pg-card--amber',
] as const;

function AuthorAvatars({ guide }: { guide: ProductGuide }) {
  const shown = guide.authors.slice(0, 3);
  const extra = guide.authors.length - shown.length;
  return (
    <div className="pg-avatars" aria-hidden>
      {shown.map((a) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={a.id} className="pg-avatar" src={a.avatarUrl} alt="" />
      ))}
      {extra > 0 ? <span className="pg-avatar-more">+{extra}</span> : null}
    </div>
  );
}

function GuideCard({ guide, index }: { guide: ProductGuide; index: number }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const Icon = ICONS[guide.icon];
  const count = articleCount(guide);
  const accent = ACCENTS[index % ACCENTS.length];

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 200, damping: 24 });
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 200, damping: 24 });

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px);
    my.set(py);
    ref.current.style.setProperty('--mx', `${px * 100}%`);
    ref.current.style.setProperty('--my', `${py * 100}%`);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    if (ref.current) {
      ref.current.style.setProperty('--mx', '50%');
      ref.current.style.setProperty('--my', '50%');
    }
  };

  return (
    <motion.div variants={pgCardVariants} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        className={`pg-card-tilt ${accent}`}
        style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={reduced ? undefined : { y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <Link href={`/resources/product-guide/${guide.slug}`} className="pg-card">
          <span className="pg-card-shine" aria-hidden />
          <span className="pg-card-top">
            <span className="pg-card-icon" aria-hidden>
              <Icon size={20} />
            </span>
            <span className="pg-card-badge">
              {count} article{count === 1 ? '' : 's'}
            </span>
          </span>
          <h2 className="pg-card-title">
            <span>{guide.title}</span>
            <ArrowRight className="pg-card-arrow" size={18} aria-hidden />
          </h2>
          <p className="pg-card-desc">{guide.description}</p>
          <div className="pg-card-meta">
            <AuthorAvatars guide={guide} />
            <span>{authorSummary(guide.authors)}</span>
          </div>
          <span className="pg-card-cta">
            Open guide <ArrowRight size={14} aria-hidden />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function GuideGrid({ guides }: { guides: ProductGuide[] }) {
  const reduced = usePrefersReducedMotion();

  if (!guides.length) {
    return (
      <div className="pg-empty">
        <h2>No Product Guides yet</h2>
        <p>Check back soon for setup guides and training resources.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="pg-grid"
      variants={pgStagger}
      initial={reduced ? false : 'hidden'}
      animate="show"
    >
      {guides.map((g, i) => (
        <GuideCard key={g.id} guide={g} index={i} />
      ))}
    </motion.div>
  );
}
