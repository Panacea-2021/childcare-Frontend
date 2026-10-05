'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpSupportSection } from '@/components/modules/HelpSupportSection';
import { HelpProductGuideSection } from '@/components/modules/HelpProductGuideSection';
import { PageLoader } from '@/components/ui/loading';
import '@/components/ui/module.css';

type HelpSection = 'product-guide' | 'support';

function sectionFromParam(raw: string | null): HelpSection {
  if (raw === 'support') return 'support';
  return 'product-guide';
}

function HelpPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = sectionFromParam(searchParams.get('section'));

  useEffect(() => {
    if (!searchParams.get('section')) {
      router.replace('/help?section=product-guide');
    }
  }, [router, searchParams]);

  if (section === 'support') {
    return (
      <div className="mod-page">
        <HelpSupportSection />
      </div>
    );
  }

  return (
    <div className="mod-page">
      <HelpProductGuideSection />
    </div>
  );
}

export function HelpPage() {
  return (
    <Suspense fallback={<PageLoader context="default" title="Loading help…" />}>
      <HelpPageInner />
    </Suspense>
  );
}
