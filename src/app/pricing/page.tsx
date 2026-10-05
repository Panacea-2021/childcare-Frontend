import type { Metadata } from 'next';
import { PricingExperience } from '@/components/landing/pricing/PricingExperience';

export const metadata: Metadata = {
  title: 'Pricing | Panacea Childcare Software',
  description:
    'Transparent childcare software pricing with Standard, Business, and Enterprise plans — zero hidden fees.',
};

export default function PricingPage() {
  return <PricingExperience />;
}
