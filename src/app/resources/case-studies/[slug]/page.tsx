import type { Metadata } from 'next';
import {
  CASE_STUDIES,
  getCaseStudyBySlug,
} from '@/components/landing/case-studies/data';
import { CaseStudyDetailExperience } from '@/components/landing/case-studies/CaseStudyDetailExperience';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    return { title: 'Case study unavailable | Panacea' };
  }

  return {
    title: `${study.title} | Panacea Case Study`,
    description: study.seoDescription,
    openGraph: {
      title: `${study.title} | Panacea Case Study`,
      description: study.seoDescription,
      type: 'article',
      images: [{ url: study.heroImage, alt: study.heroCaption ?? study.customer }],
    },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug) ?? null;
  return <CaseStudyDetailExperience study={study} />;
}
