import type { Metadata } from 'next';
import { AiPoweredExperience } from '@/components/landing/ai-powered/AiPoweredExperience';

export const metadata: Metadata = {
  title: 'AI-powered Features | Panacea Childcare Software',
  description:
    'Step into the future of childcare with Panacea AI — parent communication, personalized learning, smarter facilities, and childcare-specific intelligence.',
};

export default function AiPoweredFeaturePage() {
  return <AiPoweredExperience />;
}
