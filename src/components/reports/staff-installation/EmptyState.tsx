'use client';

import { Briefcase } from 'lucide-react';

type Props = {
  onInvite: () => void;
};

export function EmptyState({ onInvite }: Props) {
  return (
    <div className="pai-empty" role="status">
      <div className="pai-empty-art" aria-hidden>
        <Briefcase size={36} />
      </div>
      <h3>No Staff Installation Records</h3>
      <p>Invite your staff members to install the Staff App.</p>
      <button type="button" className="ui-btn ui-btn-primary" onClick={onInvite}>
        Invite Staff
      </button>
    </div>
  );
}
