'use client';

import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { RenameTarget } from './types';

type Props = {
  open: boolean;
  target: RenameTarget | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
};

export function RenameDialog({ open, target, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !target) return;
    setName(target.item.name);
    setError('');
    setBusy(false);
  }, [open, target]);

  const submit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await onSave(name.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={target?.kind === 'folder' ? 'Rename Folder' : 'Rename Document'}
      onClose={onClose}
      icon={<Pencil size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Rename'}
          </button>
        </>
      }
    >
      <div className={`ui-field${error ? ' ui-field-error' : ''}`}>
        <label className="ui-label" htmlFor="cd-rename">
          Name <span className="req">*</span>
        </label>
        <input
          id="cd-rename"
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void submit();
            }
          }}
          autoFocus
        />
        {error ? <p className="ui-error-text">{error}</p> : null}
      </div>
    </Modal>
  );
}
