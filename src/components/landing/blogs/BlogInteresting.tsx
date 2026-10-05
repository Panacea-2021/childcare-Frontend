'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, ClipboardList, MessagesSquare } from 'lucide-react';
import { BLOG_INTERESTING, categoryLabel, getArticleBySlug } from './data';
import { BlReveal } from './BlReveal';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

const ICONS = [ClipboardList, CalendarDays, MessagesSquare] as const;

function InterestingCard({
  item,
  index,
}: {
  item: (typeof BLOG_INTERESTING)[number];
  index: number;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.32);
  const article = getArticleBySlug(item.slug);
  const Icon = ICONS[index] ?? ClipboardList;
  const href = `/resources/blogs/${item.slug}`;

  return (
    <motion.article className={`bl-resourceCard bl-resourceCard--${item.tone}`} variants={fadeUp}>
      <Link
        href={href}
        className="bl-resourceLink"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div
          ref={ref}
          className="bl-resourceSurface"
          style={{
            rotateX: reduced ? 0 : `${tilt.rx}deg`,
            rotateY: reduced ? 0 : `${tilt.ry}deg`,
            transformStyle: 'preserve-3d',
            perspective: 900,
          }}
        >
          <div className="bl-resourceVisual" aria-hidden>
            <span className="bl-resourceGlow" />
            <motion.span
              className="bl-resourceIconWrap"
              {...(reduced ? {} : floatAnim(5, 5.8 + index * 0.4, index * 0.25))}
            >
              <Icon size={34} strokeWidth={1.55} />
            </motion.span>
            <span className="bl-resourceDecor bl-resourceDecor--a" />
            <span className="bl-resourceDecor bl-resourceDecor--b" />
          </div>

          <div className="bl-resourceBody">
            {article ? (
              <span className="bl-resourceMeta">
                <em className="bl-cat">{categoryLabel(article.category)}</em>
                <span className="bl-read">{article.readTime.replace(' read', '')}</span>
              </span>
            ) : null}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <span className="bl-resourceCta">
              {item.cta}
              <ArrowUpRight size={15} aria-hidden />
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}

export function BlogInteresting() {
  return (
    <section className="bl-interesting">
      <BlReveal className="bl-interestingHead">
        <p className="bl-interestingKicker">Free resources</p>
        <h2>You may find these interesting</h2>
        <p className="bl-interestingLead">
          Practical guides tied to our latest articles — open any card to keep reading.
        </p>
      </BlReveal>

      <motion.div
        className="bl-interestingTrack"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {BLOG_INTERESTING.map((item, i) => (
          <InterestingCard key={item.id} item={item} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
