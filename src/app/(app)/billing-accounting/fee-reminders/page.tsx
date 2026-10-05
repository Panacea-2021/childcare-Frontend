'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const EmailTemplatesPage = dynamic(
  () =>
    import('@/components/modules/center-management/EmailTemplatesPage').then(
      (m) => m.EmailTemplatesPage,
    ),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function BillingFeeRemindersRoute() {
  return <EmailTemplatesPage context="billing" />;
}
