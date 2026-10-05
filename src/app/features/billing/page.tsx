import type { Metadata } from 'next';
import { BillingExperience } from '@/components/landing/billing/BillingExperience';

export const metadata: Metadata = {
  title: 'Billing & Payments | Panacea Childcare Software',
  description:
    'Automate childcare tuition, subsidies, invoices and payment reminders with Panacea Billing & Payments — flexible schedules, clear revenue, less chasing.',
};

export default function BillingFeaturePage() {
  return <BillingExperience />;
}
