import type { Metadata } from 'next';
import { CaseStudiesExperience } from '@/components/landing/case-studies/CaseStudiesExperience';

export const metadata: Metadata = {
  title: 'Case Studies | Panacea Childcare Software',
  description:
    'See why educators love using Panacea — real stories from childcare centers that streamlined billing, attendance, enrollment, and parent communication.',
  openGraph: {
    title: 'Case Studies | Panacea',
    description:
      'Real success stories from childcare centers growing with Panacea.',
    type: 'website',
  },
};

export default function CaseStudiesPage() {
  return <CaseStudiesExperience />;
}
