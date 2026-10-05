'use client';

import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';

interface ConcernHeaderProps {
  resolvedCount?: number;
}

export function ConcernHeader({ resolvedCount = 0 }: ConcernHeaderProps) {
  return (
    <ParentCommunicationPageHeader
      title="Parent Concerns"
      description="Concerns raised by parents requiring staff attention. Update status, advance the timeline, and review resolved cases in the Resolved tab."
      icon={<ShieldAlert />}
      actions={
        <div className="pc-meta-pill" aria-label={`${resolvedCount} resolved concerns`}>
          <CheckCircle2 size={15} aria-hidden />
          <span>{resolvedCount} resolved</span>
        </div>
      }
    />
  );
}
