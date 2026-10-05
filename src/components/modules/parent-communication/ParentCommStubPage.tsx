'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import '@/components/ui/module.css';

type Props = {
  title: string;
  description: string;
};

export function ParentCommStubPage({ title, description }: Props) {
  return (
    <div className="mod-page">
      <PageHeader
        title={title}
        description={description}
        crumbs={['Panacea', 'Parent Communication', title]}
      />
      <div className="mod-panel">
        <EmptyState
          title={`${title} workspace`}
          description="This section is available from the Parent Communication sidebar. Full content will appear here."
        />
      </div>
    </div>
  );
}
