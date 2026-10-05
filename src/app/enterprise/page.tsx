import type { Metadata } from 'next';
import { EnterpriseExperience } from '@/components/landing/enterprise/EnterpriseExperience';

export const metadata: Metadata = {
  title: 'Enterprise | Panacea Childcare Software',
  description:
    'Panacea Enterprise turns everyday childcare data into better decisions — unified operations, AI optimization, governance, and security for multi-site childcare.',
};

export default function EnterprisePage() {
  return <EnterpriseExperience />;
}
