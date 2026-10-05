import type { Metadata } from 'next';
import { AboutExperience } from '@/components/landing/about/AboutExperience';

export const metadata: Metadata = {
  title: 'About Us | Panacea Childcare Software',
  description:
    'At Panacea, we are passionate about transforming the way childcare centers operate — simplifying operations, supporting teachers, and connecting families.',
};

export default function AboutPage() {
  return <AboutExperience />;
}
