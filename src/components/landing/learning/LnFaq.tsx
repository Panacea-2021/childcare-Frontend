'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { LN_FAQS } from './data';

const CHIPS = ['Planning', 'Observations', 'Frameworks', 'AI', 'Goals'] as const;

export function LnFaq() {
  return (
    <LandingFaq
      titleId="ln-faq-title"
      description="Answers to common questions about Panacea learning cycles, observations, assessments, and AI-assisted planning."
      items={LN_FAQS}
      chips={CHIPS}
    />
  );
}
