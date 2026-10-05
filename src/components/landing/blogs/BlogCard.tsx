'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { categoryLabel, type BlogArticle } from './data';
import { BlogCoverArt } from './BlogCoverArt';
import { fadeUp } from './motion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  article: BlogArticle;
  variant?: 'grid' | 'related';
};

export function BlogCard({ article, variant = 'grid' }: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.35);
  const href = `/resources/blogs/${article.slug}`;

  return (
    <motion.article className={`bl-card bl-card--${variant}`} variants={fadeUp}>
      <Link
        href={href}
        className="bl-cardLink"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div
          ref={ref}
          className="bl-cardSurface"
          style={{
            rotateX: reduced ? 0 : `${tilt.rx}deg`,
            rotateY: reduced ? 0 : `${tilt.ry}deg`,
            transformStyle: 'preserve-3d',
            perspective: 900,
          }}
        >
          <div className="bl-cardMedia">
            <BlogCoverArt article={article} size={variant === 'related' ? 'sm' : 'md'} />
          </div>
          <div className="bl-cardMeta">
            <span className="bl-cat">{categoryLabel(article.category)}</span>
            <span className="bl-read">{article.readTime.replace(' read', '')}</span>
          </div>
          <h3 className="bl-cardTitle">{article.title}</h3>
          {variant === 'grid' ? <p className="bl-cardExcerpt">{article.excerpt}</p> : null}
          {variant === 'related' ? <span className="bl-readMore">Read more</span> : null}
        </motion.div>
      </Link>
    </motion.article>
  );
}
