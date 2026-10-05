'use client';

import { LandingFaq } from '../faq/LandingFaq';
import { ATTENDANCE_FAQS } from './data';

const CHIPS = ['Attendance', 'Check-In', 'Billing', 'Safety'] as const;

export function AttendanceFaq() {
  return (
    <LandingFaq
      titleId="att-faq-title"
      description="Answers to common questions about Panacea attendance, check-in, billing, and compliance."
      items={ATTENDANCE_FAQS}
      chips={CHIPS}
    />
  );
}
