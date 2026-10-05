import type { Metadata } from 'next';
import { ResourceCenterExperience } from '@/components/landing/resource-center/ResourceCenterExperience';

export const metadata: Metadata = {
  title: 'Resource Center | Panacea Childcare Software',
  description:
    'Expert-created checklists, templates, and cheatsheets for early years — marketing, AI, operations, finance, and more.',
};

export default function ResourcesPage() {
  return <ResourceCenterExperience />;
}
