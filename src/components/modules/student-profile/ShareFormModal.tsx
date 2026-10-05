'use client';

import { memo } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SHAREABLE_FORMS } from '@/lib/students/profileTypes';

type Props = {
  open: boolean;
  selected: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onShare: () => void;
};

export const ShareFormModal = memo(function ShareFormModal({
  open,
  selected,
  onChange,
  onClose,
  onShare,
}: Props) {
  return (
    <Modal
      open={open}
      title="Share New Form"
      subtitle="Select a form to share with this student"
      onClose={onClose}
      icon={<FileText size={18} />}
      iconClose
      autoHeight
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected}
            onClick={onShare}
          >
            Share Form
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label" htmlFor="sp-share-form">
          Select Form
        </label>
        <select
          id="sp-share-form"
          className="ui-select"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose a form…</option>
          {SHAREABLE_FORMS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
});
