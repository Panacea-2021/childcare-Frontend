'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { EmergencyContact } from '@/lib/center-management/types';
import { PICKUP_RELATIONS } from '@/lib/center-management/types';
import { AppSelect } from './ui';

type Props = {
  open: boolean;
  initial?: EmergencyContact | null;
  onClose: () => void;
  onSave: (contact: Omit<EmergencyContact, 'id'> & { id?: string }) => void;
};

export function AddEmergencyModal({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setPhone(initial?.phone ?? '');
    setRelation(initial?.relation ?? '');
  }, [open, initial]);

  return (
    <Modal
      open={open}
      title={initial ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
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
              if (!name.trim() || !phone.trim() || !relation) return;
              onSave({
                id: initial?.id,
                name: name.trim(),
                phone: phone.trim(),
                relation,
              });
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="cm-modal-form">
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Name <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">
              Relation <span className="req">*</span>
            </label>
            <AppSelect
              searchable
              searchPlaceholder="Relation"
              placeholder="Relation"
              value={relation}
              onChange={setRelation}
              options={PICKUP_RELATIONS.map((r) => ({ value: r, label: r }))}
            />
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label">
              Phone Number <span className="req">*</span>
            </label>
            <div className="cm-phone-row">
              <span className="cm-phone-code">+91</span>
              <input
                className="ui-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
