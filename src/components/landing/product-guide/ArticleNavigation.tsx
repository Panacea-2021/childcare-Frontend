'use client';

import Link from 'next/link';
import type { GuideStep, ProductGuide } from './data';

export function ArticleNavigation({
  guide,
  index,
}: {
  guide: ProductGuide;
  index: number;
}) {
  const total = guide.steps.length;
  const prev: GuideStep | undefined = index > 0 ? guide.steps[index - 1] : undefined;
  const next: GuideStep | undefined = index < total - 1 ? guide.steps[index + 1] : undefined;

  if (!prev && !next) return null;

  return (
    <nav className="pg-step-nav" aria-label="Step navigation">
      {prev ? (
        <Link
          href={`/resources/product-guide/${guide.slug}/${prev.slug}`}
          className="pg-step-nav-link is-prev"
        >
          <span className="pg-step-nav-dir">← Previous</span>
          <span className="pg-step-nav-title">
            Step {index}/{total}: {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/resources/product-guide/${guide.slug}/${next.slug}`}
          className="pg-step-nav-link is-next"
        >
          <span className="pg-step-nav-dir">Next →</span>
          <span className="pg-step-nav-title">
            Step {index + 2}/{total}: {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
