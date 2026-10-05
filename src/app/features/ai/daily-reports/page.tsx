import type { Metadata } from 'next';
import { AiDailyReportsExperience } from '@/components/landing/ai-daily-reports/AiDailyReportsExperience';

export const metadata: Metadata = {
  title: 'AI Daily Reports | Panacea Childcare Software',
  description:
    "The world's first AI designed for daily reports — snap photos, let Panacea write warm parent updates, and reclaim hours for teaching.",
};

export default function AiDailyReportsFeaturePage() {
  return <AiDailyReportsExperience />;
}
