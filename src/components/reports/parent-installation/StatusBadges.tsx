'use client';

import { m, useReducedMotion } from 'framer-motion';
import type { InstallationStatus, InvitationStatus } from './types';

export function InstallationStatusBadge({ status }: { status: InstallationStatus }) {
  const reduce = useReducedMotion();
  return (
    <m.span
      className={`pai-badge pai-badge-install-${status}`}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      <span className={`pai-badge-dot${status === 'installed' ? ' is-pulse' : ' is-pulse-soft'}`} aria-hidden />
      {status === 'installed' ? 'Installed' : 'Pending'}
    </m.span>
  );
}

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  const reduce = useReducedMotion();
  return (
    <m.span
      className={`pai-badge pai-badge-invite-${status}`}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      {status === 'sent' ? 'Sent' : 'Not Sent'}
    </m.span>
  );
}
