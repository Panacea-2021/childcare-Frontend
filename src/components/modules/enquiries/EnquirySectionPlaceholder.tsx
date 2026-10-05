'use client';

import { memo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import '@/components/ui/module.css';

type Props = {
  title: string;
  description: string;
};

export const EnquirySectionPlaceholder = memo(function EnquirySectionPlaceholder({
  title,
  description,
}: Props) {
  return (
    <div className="mod-page">
      <PageHeader
        title={title}
        description={description}
        crumbs={['Panacea', 'Enquiries', title]}
      />
      <div className="mod-panel">
        <div className="mod-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            This section is ready for content. Navigation and layout match the Calendar module.
          </p>
        </div>
      </div>
    </div>
  );
});
