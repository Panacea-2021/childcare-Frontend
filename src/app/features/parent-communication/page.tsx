import type { Metadata } from 'next';
import { ParentCommunicationExperience } from '@/components/landing/parent-communication/ParentCommunicationExperience';

export const metadata: Metadata = {
  title: 'Parent Communication | Panacea Childcare Software',
  description:
    'Keep families connected with Panacea — real-time updates, secure messaging, daily reports, check-in alerts, and AI-assisted parent communication.',
};

export default function ParentCommunicationFeaturePage() {
  return <ParentCommunicationExperience />;
}
