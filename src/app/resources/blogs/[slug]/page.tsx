import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticlePage } from '@/components/landing/blogs/BlogArticlePage';
import { BLOG_ARTICLES, getArticleBySlug } from '@/components/landing/blogs/data';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article | Panacea' };
  return {
    title: `${article.title} | Panacea Blogs`,
    description: article.excerpt,
  };
}

export default async function BlogArticleRoute({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  return <BlogArticlePage article={article} />;
}
