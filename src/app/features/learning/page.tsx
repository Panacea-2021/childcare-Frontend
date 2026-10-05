import type { Metadata } from 'next';
import { LearningExperience } from '@/components/landing/learning/LearningExperience';

export const metadata: Metadata = {
  title: 'Learning & Assessments | Panacea Childcare Software',
  description:
    'Save hours on lesson planning and assessments with Panacea — AI-assisted observations, framework-aligned plans, learning goals, and family progress sharing.',
};

export default function LearningFeaturePage() {
  return <LearningExperience />;
}
