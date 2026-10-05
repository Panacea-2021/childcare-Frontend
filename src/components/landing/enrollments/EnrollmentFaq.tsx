'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { ENROLLMENT_FAQS } from './data';

const CHIPS = ['Inquiries', 'Tours', 'Waitlists', 'Registration'] as const;

export function EnrollmentFaq() {
  return (
    <LandingFaq
      titleId="en-faq-title"
      description="Everything childcare directors and owners ask before choosing an enrollment platform."
      items={ENROLLMENT_FAQS}
      chips={CHIPS}
    />
  );
}
