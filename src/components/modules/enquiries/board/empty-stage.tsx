'use client';

import { memo } from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  stageName: string;
};

export const EmptyStage = memo(function EmptyStage({ stageName }: Props) {
  return (
    <div className="enq-empty-stage">
      <span className="enq-empty-stage-icon" aria-hidden>
        <Inbox size={22} />
      </span>
      <p className="enq-empty-stage-title">No enquiries</p>
      <p className="enq-empty-stage-sub">
        Cards moved to <strong>{stageName}</strong> will appear here.
      </p>
    </div>
  );
});
