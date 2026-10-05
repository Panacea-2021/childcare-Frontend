'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Folder, Globe, MessageCircle, Play, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ProductGuideShell } from './ProductGuideShell';
import { PgHero } from './PgHero';
import { getProductGuide } from './service';
import {
  articleCount,
  authorSummary,
  type ProductGuide,
} from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { pgFadeUp, pgStagger, pgStepVariants } from './motion';

const ICONS: Record<ProductGuide['icon'], LucideIcon> = {
  book: BookOpen,
  play: Play,
  folder: Folder,
  users: Users,
  chat: MessageCircle,
  globe: Globe,
};

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

export function ProductGuideDetail({ guideSlug }: { guideSlug: string }) {
  const [guide, setGuide] = useState<ProductGuide | null | undefined>(undefined);
  const reduced = usePrefersReducedMotion();

  const load = () => {
    setGuide(undefined);
    getProductGuide(guideSlug).then(setGuide);
  };

  useEffect(() => {
    load();
  }, [guideSlug]);

  if (guide === undefined) {
    return (
      <ProductGuideShell>
        <PgHero compact />
        <main className="pg-main">
          <div className="pg-skeleton-card" style={{ height: 120, marginBottom: 20 }} />
          <div className="pg-skeleton-card" style={{ height: 320 }} />
        </main>
      </ProductGuideShell>
    );
  }

  if (!guide) {
    return (
      <ProductGuideShell>
        <div className="pg-error">
          <h2>We couldn&apos;t load this guide</h2>
          <p>This Product Guide may have moved or is unavailable.</p>
          <div className="pg-error-actions">
            <button type="button" className="pg-btn pg-btn-primary" onClick={load}>
              Try Again
            </button>
            <Link href="/resources/product-guide" className="pg-btn pg-btn-outline">
              Back to Product Guides
            </Link>
          </div>
        </div>
      </ProductGuideShell>
    );
  }

  const Icon = ICONS[guide.icon];
  const total = guide.steps.length;
  const count = articleCount(guide);

  return (
    <ProductGuideShell>
      <PgHero compact />
      <main className="pg-main pg-detail-main">
        <motion.nav
          className="pg-breadcrumb"
          aria-label="Breadcrumb"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/resources/product-guide">All Collections</Link>
          <span className="pg-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span aria-current="page">{guide.title}</span>
        </motion.nav>

        <motion.header
          className="pg-guide-header"
          variants={pgFadeUp}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <div className="pg-guide-header-glow" aria-hidden />
          <span className="pg-card-icon pg-guide-icon" aria-hidden>
            <Icon size={24} />
          </span>
          <h1 className="pg-guide-title">{guide.title}</h1>
          <p className="pg-guide-desc">{guide.description}</p>
          <div className="pg-card-meta">
            <AuthorAvatars guide={guide} />
            <span>{authorSummary(guide.authors)}</span>
            <span aria-hidden>•</span>
            <span>
              {count} article{count === 1 ? '' : 's'}
            </span>
          </div>
        </motion.header>

        {total === 0 ? (
          <div className="pg-empty">
            <h2>No steps yet</h2>
            <p>This guide doesn&apos;t have articles published yet.</p>
          </div>
        ) : (
          <motion.div
            className="pg-steps"
            role="list"
            variants={pgStagger}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            {guide.steps.map((step, index) => (
              <motion.div key={step.id} variants={pgStepVariants} role="listitem">
                <Link
                  href={`/resources/product-guide/${guide.slug}/${step.slug}`}
                  className="pg-step-row"
                >
                  <span className="pg-step-rail" aria-hidden>
                    <span className="pg-step-num">{String(index + 1).padStart(2, '0')}</span>
                    {index < total - 1 ? <span className="pg-step-connector" /> : null}
                  </span>
                  <div className="pg-step-body">
                    <div className="pg-step-label">
                      Step {index + 1}/{total}
                    </div>
                    <div className="pg-step-title">{step.title}</div>
                    {step.estimatedReadTime ? (
                      <div className="pg-step-time">{step.estimatedReadTime} read</div>
                    ) : null}
                  </div>
                  <span className="pg-step-go">
                    <ArrowRight size={18} aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </ProductGuideShell>
  );
}
