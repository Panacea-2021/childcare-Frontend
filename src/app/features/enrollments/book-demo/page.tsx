import type { Metadata } from 'next';
import { DemoScheduleExperience } from '@/components/landing/enrollments/DemoScheduleExperience';

export const metadata: Metadata = {
  title: 'Book a Demo | Panacea Childcare Software',
  description:
    'Pick a time for your custom Panacea enrollment demo — calendar, timezone, and personalized walkthrough.',
};

export default function BookDemoPage() {
  return <DemoScheduleExperience />;
}
