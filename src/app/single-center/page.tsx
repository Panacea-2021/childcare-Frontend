import type { Metadata } from 'next';
import { SingleCenterExperience } from '@/components/landing/single-center/SingleCenterExperience';

export const metadata: Metadata = {
  title: 'Single Center | Panacea Childcare Software',
  description:
    'Simplified operations for small childcare centers — attendance, billing, parent updates, and secure daily care in one Panacea platform.',
};

export default function SingleCenterPage() {
  return <SingleCenterExperience />;
}
