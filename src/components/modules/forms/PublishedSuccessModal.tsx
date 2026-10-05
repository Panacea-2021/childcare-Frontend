'use client';

import { CheckCircle2, QrCode, Share2, X } from 'lucide-react';

type Props = {
  open: boolean;
  shareUrl: string;
  onClose: () => void;
  onOk: () => void;
  onCopy: () => void;
  onQr: () => void;
};

export function PublishedSuccessModal({ open, shareUrl, onClose, onOk, onCopy, onQr }: Props) {
  if (!open) return null;
  return (
    <div className="psm-backdrop" role="presentation" onClick={onClose}>
      <div className="psm-modal" role="dialog" aria-modal="true" aria-label="Published" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="psm-x" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div className="psm-icon" aria-hidden>
          <CheckCircle2 size={42} />
        </div>
        <h2>Your form has been published successfully!</h2>
        <p>Share it using the options below</p>
        <div className="psm-actions">
          <button type="button" onClick={onCopy}>
            <Share2 size={15} />
            Share URL
          </button>
          <button type="button" onClick={onQr}>
            <QrCode size={15} />
            Download QR code
          </button>
        </div>
        <p className="psm-url">{shareUrl}</p>
        <div className="psm-footer">
          <button type="button" className="spm-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="spm-btn primary" onClick={onOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
