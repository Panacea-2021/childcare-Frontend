import type { Metadata } from 'next';
import { CustomerStoryExperience } from '@/components/landing/enrollments/CustomerStoryExperience';
import { CUSTOMER_STORIES, getCustomerStory } from '@/components/landing/enrollments/demoScheduleData';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CUSTOMER_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getCustomerStory(slug);
  return {
    title: story
      ? `${story.title} | Panacea Customer Story`
      : 'Customer Story | Panacea',
    description: story?.summary ?? 'Panacea childcare customer success stories.',
  };
}

export default async function CustomerStoryPage({ params }: Props) {
  const { slug } = await params;
  return <CustomerStoryExperience slug={slug} />;
}
