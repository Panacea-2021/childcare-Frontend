'use client';

import { Paperclip, Plus, X } from 'lucide-react';
import type { CampaignAttachment } from './types';
import { uid } from './mockData';

/** Frontend-ready attachment UI. Wire to upload API when available. */
export const MAX_ATTACHMENT_HINT = 'Maximum attachment size depends on your school email settings.';

type Props = {
  attachments: CampaignAttachment[];
  onChange: (next: CampaignAttachment[]) => void;
};

export function AttachmentUploader({ attachments, onChange }: Props) {
  const addFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.xls,.xlsx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const sizeMb = file.size / (1024 * 1024);
      const item: CampaignAttachment = {
        id: uid('att'),
        name: file.name,
        sizeBytes: file.size,
        sizeLabel: sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        mimeType: file.type || 'application/octet-stream',
      };
      onChange([...attachments, item]);
    };
    input.click();
  };

  return (
    <div>
      <button type="button" className="ui-btn ui-btn-outline" onClick={addFile}>
        <Plus size={16} />
        Attach File
      </button>
      <p className="ec-muted" style={{ marginTop: '0.55rem' }}>
        {MAX_ATTACHMENT_HINT}
      </p>
      {attachments.length > 0 ? (
        <div className="ec-attach-list" style={{ marginTop: '0.85rem' }}>
          {attachments.map((a) => (
            <div key={a.id} className="ec-attach-item">
              <div className="ec-attach-meta">
                <Paperclip size={16} color="#64748b" />
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.sizeLabel}</span>
                </div>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => onChange(attachments.filter((x) => x.id !== a.id))}
              >
                <X size={14} />
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
