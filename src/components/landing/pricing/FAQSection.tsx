'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { PRICING_FAQS } from './data';

const CHIPS = ['Contracts', 'Billing', 'Migration', 'APIs'] as const;

const ITEMS = PRICING_FAQS.map((faq, i) => ({
  id: `px-faq-${i + 1}`,
  question: faq.question,
  answer: faq.answer,
}));

export function FAQSection() {
  return (
    <section className="px-faq">
      <div className="px-wrap">
        <LandingFaq
          titleId="px-faq-title"
          description="Clear answers about contracts, billing, setup, and migrating your center to Panacea."
          items={ITEMS}
          chips={CHIPS}
          className="px-lfFaq"
        />
      </div>
    </section>
  );
}
