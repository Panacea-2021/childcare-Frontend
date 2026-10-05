'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/ui/loading';

const SettingsPage = dynamic(
  () => import('@/components/modules/SettingsPage').then((m) => m.SettingsPage),
  { ssr: false, loading: () => <PageLoader context="app" inset /> },
);

export default function Page() {
  return <SettingsPage />;
}
