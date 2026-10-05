'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { PC_FAQS } from './data';

const CHIPS = ['Messaging', 'Daily Reports', 'Check-In', 'AI Updates'] as const;

export function PcFaq() {
  return (
    <LandingFaq
      titleId="pc-faq-title"
      description="Answers to common questions about Panacea parent communication, daily reports, messaging, and family updates."
      items={PC_FAQS}
      chips={CHIPS}
    />
  );
}
