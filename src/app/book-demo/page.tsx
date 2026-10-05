import type { Metadata } from 'next';
import { BookDemoPageExperience } from '@/components/landing/enrollments/BookDemoPageExperience';

export const metadata: Metadata = {
  title: 'Book a Demo | Panacea Childcare Software',
  description:
    'Book a live Panacea demo — tailored walkthrough for enrollments, tours, waitlists, and parent experience.',
};

export default function BookDemoPage() {
  return <BookDemoPageExperience />;
}
