'use client';

import type { InstallationStatus, InvitationStatus } from './types';

export function InstallationStatusBadge({ status }: { status: InstallationStatus }) {
  return (
    <span className={`pai-badge pai-badge-install-${status}`}>
      <span className="pai-badge-dot" aria-hidden />
      {status === 'installed' ? 'Installed' : 'Pending'}
    </span>
  );
}

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span className={`pai-badge pai-badge-invite-${status}`}>
      {status === 'sent' ? 'Sent' : 'Not Sent'}
    </span>
  );
}
