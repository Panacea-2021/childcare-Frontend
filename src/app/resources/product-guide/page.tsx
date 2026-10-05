import type { Metadata } from 'next';
import { ProductGuideHome } from '@/components/landing/product-guide/ProductGuideHome';

export const metadata: Metadata = {
  title: 'Product Guide | Panacea Help Center',
  description:
    'Advice and answers from the Panacea team — setup guides, training, FAQs, and product documentation.',
};

export default function ProductGuidePage() {
  return <ProductGuideHome />;
}
