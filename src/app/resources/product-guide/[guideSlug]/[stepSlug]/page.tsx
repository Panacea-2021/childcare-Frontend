import type { Metadata } from 'next';
import { GuideArticlePage } from '@/components/landing/product-guide/GuideArticlePage';
import { PRODUCT_GUIDES } from '@/components/landing/product-guide/data';

type Props = { params: Promise<{ guideSlug: string; stepSlug: string }> };

export async function generateStaticParams() {
  return PRODUCT_GUIDES.flatMap((g) =>
    g.steps.map((s) => ({ guideSlug: g.slug, stepSlug: s.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guideSlug, stepSlug } = await params;
  const guide = PRODUCT_GUIDES.find((g) => g.slug === guideSlug);
  const step = guide?.steps.find((s) => s.slug === stepSlug);
  return {
    title: step ? `${step.title} | Product Guide` : 'Product Guide Article',
    description: step?.intro ?? guide?.description,
  };
}

export default async function ProductGuideArticlePage({ params }: Props) {
  const { guideSlug, stepSlug } = await params;
  return <GuideArticlePage guideSlug={guideSlug} stepSlug={stepSlug} />;
}
