'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppSelect } from './ui';

type Props = {
  open: boolean;
  staffNames: string[];
  onClose: () => void;
  onSave: (payload: { description: string; mediaName?: string; createdBy: string }) => void;
};

export function AddNoteModal({ open, staffNames, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [mediaName, setMediaName] = useState<string | undefined>();
  const [createdBy, setCreatedBy] = useState(staffNames[0] ?? 'Admin');

  useEffect(() => {
    if (!open) return;
    setDescription('');
    setMediaName(undefined);
    setCreatedBy(staffNames[0] ?? 'Admin');
  }, [open, staffNames]);

  return (
    <Modal
      open={open}
      title="Add note"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              if (!description.trim()) return;
              onSave({ description: description.trim(), mediaName, createdBy });
            }}
          >
            Submit
          </button>
        </>
      }
    >
      <div className="cm-modal-form">
        <div className="ui-field">
          <label className="ui-label">Created By</label>
          <AppSelect
            searchable
            searchPlaceholder="Search staff"
            value={createdBy}
            onChange={setCreatedBy}
            options={staffNames.map((name) => ({ value: name, label: name }))}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Add description</label>
          <textarea
            className="ui-textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type your message here"
          />
        </div>
        <button
          type="button"
          className="cm-attach-btn"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={16} />
          {mediaName ? mediaName : 'Click to attach media'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            setMediaName(file?.name);
            e.target.value = '';
          }}
        />
      </div>
    </Modal>
  );
}
