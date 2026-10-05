'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { BILLING_FAQS } from './data';

const CHIPS = ['Invoices', 'Payments', 'Subsidies', 'Reminders'] as const;

export function BillingFaq() {
  return (
    <LandingFaq
      titleId="bl-faq-title"
      description="Answers directors ask before switching childcare billing to Panacea."
      items={BILLING_FAQS}
      chips={CHIPS}
    />
  );
}
