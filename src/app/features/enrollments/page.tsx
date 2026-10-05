import type { Metadata } from 'next';
import { EnrollmentExperience } from '@/components/landing/enrollments/EnrollmentExperience';

export const metadata: Metadata = {
  title: 'Enrollments | Panacea Childcare Software',
  description:
    'Capture every family inquiry automatically with Panacea enrollment — AI lead capture, tour scheduling, waitlists, registrations and multi-site admissions.',
};

export default function EnrollmentsFeaturePage() {
  return <EnrollmentExperience />;
}
