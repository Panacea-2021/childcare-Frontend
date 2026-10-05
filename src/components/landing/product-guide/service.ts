import {
  PRODUCT_GUIDES,
  type ArticleReactionKind,
  type GuideStep,
  type ProductGuide,
} from './data';

export type SearchHitKind = 'guide' | 'step' | 'section';

export type SearchHit = {
  id: string;
  kind: SearchHitKind;
  title: string;
  subtitle?: string;
  href: string;
  matchSnippet?: string;
};

function delay(ms = 180) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getProductGuides(): Promise<ProductGuide[]> {
  await delay();
  return PRODUCT_GUIDES;
}

export async function getProductGuide(slug: string): Promise<ProductGuide | null> {
  await delay();
  return PRODUCT_GUIDES.find((g) => g.slug === slug) ?? null;
}

export async function getGuideArticle(
  guideSlug: string,
  stepSlug: string,
): Promise<{ guide: ProductGuide; step: GuideStep; index: number } | null> {
  await delay();
  const guide = PRODUCT_GUIDES.find((g) => g.slug === guideSlug);
  if (!guide) return null;
  const index = guide.steps.findIndex((s) => s.slug === stepSlug);
  if (index < 0) return null;
  return { guide, step: guide.steps[index], index };
}

export async function searchProductGuides(query: string): Promise<SearchHit[]> {
  await delay(120);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const guide of PRODUCT_GUIDES) {
    if (
      guide.title.toLowerCase().includes(q) ||
      guide.description.toLowerCase().includes(q)
    ) {
      hits.push({
        id: `g-${guide.id}`,
        kind: 'guide',
        title: guide.title,
        subtitle: 'Product Guide',
        href: `/resources/product-guide/${guide.slug}`,
        matchSnippet: guide.description,
      });
    }

    for (const step of guide.steps) {
      const stepMatch =
        step.title.toLowerCase().includes(q) ||
        (step.intro?.toLowerCase().includes(q) ?? false) ||
        step.sections.some(
          (s) =>
            (s.title?.toLowerCase().includes(q) ?? false) ||
            (s.content?.toLowerCase().includes(q) ?? false) ||
            (s.items?.some((i) => i.toLowerCase().includes(q)) ?? false),
        );

      if (stepMatch) {
        hits.push({
          id: `s-${step.id}`,
          kind: 'step',
          title: step.title,
          subtitle: guide.title,
          href: `/resources/product-guide/${guide.slug}/${step.slug}`,
          matchSnippet: step.intro ?? step.shortDescription,
        });
      }

      for (const section of step.sections) {
        if (section.type !== 'HEADING' || !section.title) continue;
        if (!section.title.toLowerCase().includes(q)) continue;
        const anchor = section.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        hits.push({
          id: `sec-${section.id}`,
          kind: 'section',
          title: section.title,
          subtitle: `${guide.title} · ${step.title}`,
          href: `/resources/product-guide/${guide.slug}/${step.slug}#${anchor}`,
        });
      }
    }
  }

  return hits.slice(0, 24);
}

/** Ready for POST /product-guide/articles/:articleId/reaction */
export async function submitArticleReaction(
  articleId: string,
  reaction: ArticleReactionKind,
): Promise<{ ok: boolean }> {
  await delay(200);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`pg-reaction:${articleId}`, reaction);
    } catch {
      /* ignore */
    }
  }
  return { ok: true };
}

export function getStoredReaction(articleId: string): ArticleReactionKind | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(`pg-reaction:${articleId}`);
    if (v === 'NOT_HELPFUL' || v === 'NEUTRAL' || v === 'HELPFUL') return v;
  } catch {
    /* ignore */
  }
  return null;
}
