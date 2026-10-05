'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductGuideShell } from './ProductGuideShell';
import { PgHero } from './PgHero';
import { ArticleRenderer, RelatedArticles } from './ArticleRenderer';
import { ArticleTOC, ArticleReadingProgress } from './ArticleTOC';
import { ArticleNavigation } from './ArticleNavigation';
import { ArticleReaction } from './ArticleReaction';
import { getGuideArticle } from './service';
import type { GuideStep, ProductGuide } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { pgFadeUp } from './motion';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function GuideArticlePage({
  guideSlug,
  stepSlug,
}: {
  guideSlug: string;
  stepSlug: string;
}) {
  const [data, setData] = useState<
    { guide: ProductGuide; step: GuideStep; index: number } | null | undefined
  >(undefined);
  const reduced = usePrefersReducedMotion();

  const load = () => {
    setData(undefined);
    getGuideArticle(guideSlug, stepSlug).then(setData);
  };

  useEffect(() => {
    load();
  }, [guideSlug, stepSlug]);

  useEffect(() => {
    if (!data) return;
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (!hash) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }, [data]);

  if (data === undefined) {
    return (
      <ProductGuideShell>
        <ArticleReadingProgress />
        <PgHero compact />
        <div className="pg-article-layout">
          <div>
            <div className="pg-skeleton-card" style={{ height: 80, marginBottom: 16 }} />
            <div className="pg-skeleton-card" style={{ height: 400 }} />
          </div>
        </div>
      </ProductGuideShell>
    );
  }

  if (!data) {
    return (
      <ProductGuideShell>
        <div className="pg-error">
          <h2>Article unavailable</h2>
          <p>We couldn&apos;t find this step. It may have been moved.</p>
          <div className="pg-error-actions">
            <button type="button" className="pg-btn pg-btn-primary" onClick={load}>
              Try Again
            </button>
            <Link href={`/resources/product-guide/${guideSlug}`} className="pg-btn pg-btn-outline">
              Back to guide
            </Link>
          </div>
        </div>
      </ProductGuideShell>
    );
  }

  const { guide, step, index } = data;
  const total = guide.steps.length;
  const next = index < total - 1 ? guide.steps[index + 1] : undefined;

  return (
    <ProductGuideShell>
      <ArticleReadingProgress />
      <PgHero compact />
      <div className="pg-article-layout">
        <motion.article
          className="pg-article"
          variants={pgFadeUp}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <nav className="pg-breadcrumb" aria-label="Breadcrumb">
            <Link href="/resources/product-guide">All Collections</Link>
            <span className="pg-breadcrumb-sep" aria-hidden>
              ›
            </span>
            <Link href={`/resources/product-guide/${guide.slug}`}>{guide.title}</Link>
            <span className="pg-breadcrumb-sep" aria-hidden>
              ›
            </span>
            <span>
              Step {index + 1}/{total}
            </span>
            <span className="pg-breadcrumb-sep" aria-hidden>
              ›
            </span>
            <span aria-current="page">{step.title}</span>
          </nav>

          <ArticleTOC sections={step.sections} variant="mobile" />

          <p className="pg-article-kicker">
            <span className="pg-article-pill">
              Step {index + 1} of {total}
            </span>
          </p>
          <h1 className="pg-article-title">{step.title}</h1>

          <div className="pg-article-author">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={step.author.avatarUrl} alt="" />
            <div>
              <div>
                Written by <strong>{step.author.name}</strong>
              </div>
              <div>
                Updated {formatDate(step.updatedAt)}
                {step.estimatedReadTime ? ` · ${step.estimatedReadTime} read` : ''}
              </div>
            </div>
          </div>

          {step.intro ? <p className="pg-article-intro">{step.intro}</p> : null}

          <ArticleRenderer sections={step.sections} />

          {next ? (
            <Link
              href={`/resources/product-guide/${guide.slug}/${next.slug}`}
              className="pg-continue"
            >
              <span className="pg-continue-label">Continue to next step</span>
              <span className="pg-continue-title">
                Step {index + 2}/{total}: {next.title}
              </span>
              <span className="pg-continue-arrow" aria-hidden>
                →
              </span>
            </Link>
          ) : null}

          {step.helpCta ? (
            <div className="pg-help-card">
              <h3>{step.helpCta.title}</h3>
              <p>{step.helpCta.body}</p>
              <Link href={step.helpCta.href}>{step.helpCta.label}</Link>
            </div>
          ) : null}

          <ArticleNavigation guide={guide} index={index} />
          <RelatedArticles items={step.relatedArticles} />
          <ArticleReaction articleId={step.id} />
        </motion.article>

        <ArticleTOC sections={step.sections} variant="desktop" />
      </div>
    </ProductGuideShell>
  );
}
