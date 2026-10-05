import type { Metadata } from 'next';
import { DaycareExperience } from '@/components/landing/daycare/DaycareExperience';

export const metadata: Metadata = {
  title: 'Daycare | Panacea Childcare Software',
  description:
    'Designed for daycare centers to thrive — streamline operations, ensure compliance, and provide personalized care with Panacea.',
};

export default function DaycarePage() {
  return <DaycareExperience />;
}
