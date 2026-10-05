import type { Metadata } from 'next';
import { BlogsExperience } from '@/components/landing/blogs/BlogsExperience';

export const metadata: Metadata = {
  title: 'Blogs | Panacea Childcare Software',
  description:
    'Early childhood education insights designed to help childcare centers grow — teachers, classrooms, marketing, AI, and more.',
};

export default function BlogsPage() {
  return <BlogsExperience />;
}
