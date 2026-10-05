'use client';

import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
};

export function SendTestModal({ open, onClose, onSend }: Props) {
  const [email, setEmail] = useState('');

  return (
    <Modal
      open={open}
      title="Send Test Email"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!email.trim()}
            onClick={() => {
              onSend(email.trim());
              setEmail('');
              onClose();
            }}
          >
            Send Test
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label">Email Address</label>
        <input
          className="ui-input"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <p className="ec-muted" style={{ marginTop: '0.75rem' }}>
        Test sending is UI-ready. Connect your email provider when backend APIs are available.
      </p>
    </Modal>
  );
}
