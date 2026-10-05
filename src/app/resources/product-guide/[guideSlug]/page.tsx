import type { Metadata } from 'next';
import { ProductGuideDetail } from '@/components/landing/product-guide/ProductGuideDetail';
import { PRODUCT_GUIDES } from '@/components/landing/product-guide/data';

type Props = { params: Promise<{ guideSlug: string }> };

export async function generateStaticParams() {
  return PRODUCT_GUIDES.map((g) => ({ guideSlug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guideSlug } = await params;
  const guide = PRODUCT_GUIDES.find((g) => g.slug === guideSlug);
  return {
    title: guide ? `${guide.title} | Product Guide` : 'Product Guide',
    description: guide?.description,
  };
}

export default async function ProductGuideDetailPage({ params }: Props) {
  const { guideSlug } = await params;
  return <ProductGuideDetail guideSlug={guideSlug} />;
}
