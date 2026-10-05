'use client';

import { m, useReducedMotion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

type Props = {
  onInvite: () => void;
};

export function EmptyState({ onInvite }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="pai-empty" role="status">
      <m.div
        className="pai-empty-art"
        aria-hidden
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Smartphone size={36} />
      </m.div>
      <h3>No Parent Installation Records Found</h3>
      <p>Invite your parents to install the Parent App and get started.</p>
      <m.button
        type="button"
        className="ui-btn ui-btn-primary pai-btn-glow transition-all duration-200"
        onClick={onInvite}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
      >
        Invite Parents
      </m.button>
    </div>
  );
}
