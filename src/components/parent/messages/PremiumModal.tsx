'use client';

import { Crown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function PremiumModal({ open, onClose, onUpgrade }: Props) {
  return (
    <Modal
      open={open}
      title="Premium Feature"
      subtitle="Unlock exclusive AI communication features"
      icon={
        <span className="pmh-premium-ico" aria-hidden>
          <Crown size={16} />
        </span>
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary pmh-upgrade-btn"
            onClick={() => {
              onUpgrade();
              onClose();
            }}
          >
            Upgrade Now
          </button>
        </>
      }
    >
      <p className="pmh-premium-copy">
        AI Writing Assistant helps you refine messages with Friendly, Happy, or Formal tones —
        perfect for clear, warm parent–school communication.
      </p>
    </Modal>
  );
}
