import type { Metadata } from 'next';
import { PreschoolExperience } from '@/components/landing/preschool/PreschoolExperience';

export const metadata: Metadata = {
  title: 'Preschool | Panacea Childcare Software',
  description:
    'Foster learning and growth at your preschool with Panacea — attendance, billing, AI tools, parent communication, and secure operations in one platform.',
};

export default function PreschoolPage() {
  return <PreschoolExperience />;
}
