import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceArticlePage } from '@/components/landing/resource-center/ResourceArticlePage';
import {
  RESOURCE_CENTER_ITEMS,
  getResourceBySlug,
} from '@/components/landing/resource-center/data';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RESOURCE_CENTER_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getResourceBySlug(slug);
  if (!item) return { title: 'Resource | Panacea' };
  return {
    title: `${item.title} | Panacea Resource Center`,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
    },
  };
}

export default async function ResourceSlugPage({ params }: Props) {
  const { slug } = await params;
  // Static routes take precedence; still guard reserved slugs.
  if (slug === 'blogs' || slug === 'product-guide' || slug === 'case-studies' || slug === 'events-webinars') {
    notFound();
  }
  const item = getResourceBySlug(slug);
  if (!item) notFound();
  return <ResourceArticlePage item={item} />;
}
