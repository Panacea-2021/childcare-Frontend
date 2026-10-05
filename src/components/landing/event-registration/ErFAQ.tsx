'use client';

import { LandingFaq } from '../faq/LandingFaq';
import type { EventFaq } from './data';

type Props = {
  faqs: EventFaq[];
};

const CHIPS = ['Registration', 'Certificate', 'Recording', 'Platform'] as const;

export function ErFAQ({ faqs }: Props) {
  if (!faqs.length) return null;

  const items = faqs.map((faq, i) => ({
    id: `er-faq-${i + 1}`,
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <section className="er-faq">
      <div className="er-wrap">
        <LandingFaq
          titleId="er-faq-title"
          description="Everything you need to know about the webinar."
          items={items}
          chips={CHIPS}
          className="er-lfFaq"
        />
      </div>
    </section>
  );
}
