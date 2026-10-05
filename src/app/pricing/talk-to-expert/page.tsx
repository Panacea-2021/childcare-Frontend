import type { Metadata } from 'next';
import { TalkToExpertExperience } from '@/components/landing/talk-to-expert/TalkToExpertExperience';

export const metadata: Metadata = {
  title: 'Talk to Expert | Multi-Center Pricing | Panacea',
  description:
    'The complete childcare platform for multi-center brands — Foundation, Premium, and Plus plans with full feature comparison.',
};

export default function TalkToExpertPage() {
  return <TalkToExpertExperience />;
}
