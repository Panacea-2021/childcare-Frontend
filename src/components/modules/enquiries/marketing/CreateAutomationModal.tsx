'use client';

import { FilePlus2, LayoutTemplate } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onScratch: () => void;
  onTemplate: () => void;
};

export function CreateAutomationModal({ open, onClose, onScratch, onTemplate }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Automation"
      subtitle="How would you like to start?"
      wide
      footer={
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Cancel
        </button>
      }
    >
      <div className="ma-choice-grid">
        <button type="button" className="ma-choice-card" onClick={onScratch}>
          <span className="ma-choice-icon" aria-hidden>
            <FilePlus2 size={22} />
          </span>
          <h3>Create From Scratch</h3>
          <p>Build your automation step by step with triggers, conditions, and actions.</p>
        </button>
        <button type="button" className="ma-choice-card" onClick={onTemplate}>
          <span className="ma-choice-icon" aria-hidden>
            <LayoutTemplate size={22} />
          </span>
          <h3>Use a Template</h3>
          <p>Start with a pre-built automation and customize it to your process.</p>
        </button>
      </div>
    </Modal>
  );
}
