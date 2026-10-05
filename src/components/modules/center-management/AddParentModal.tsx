'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentRole, StudentParent } from '@/lib/center-management/types';
import { initials, pin } from '@/lib/center-management/studentsStore';
import { AppSelect } from './ui';
import { readImageAsDataUrl } from './photoUpload';

type Props = {
  open: boolean;
  role: ParentRole;
  initial?: StudentParent | null;
  siblings?: { id: string; name: string }[];
  onClose: () => void;
  onSave: (parent: Omit<StudentParent, 'id'> & { id?: string; applySiblingIds?: string[] }) => void;
};

export function AddParentModal({ open, role, initial, siblings, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [allowPickup, setAllowPickup] = useState('yes');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [selectedSiblingIds, setSelectedSiblingIds] = useState<string[]>([]);
  const [applyToAllSiblings, setApplyToAllSiblings] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setPhone(initial?.phone ?? '');
    setEmail(initial?.email ?? '');
    setCompany(initial?.company ?? '');
    setAllowPickup(initial?.allowPickup === false ? 'no' : 'yes');
    setPhotoUrl(initial?.photoUrl);

    if (siblings && siblings.length > 0) {
      const allIds = siblings.map((s) => s.id);
      setSelectedSiblingIds(allIds);
      setApplyToAllSiblings(true);
    } else {
      setSelectedSiblingIds([]);
      setApplyToAllSiblings(false);
    }
  }, [open, initial, siblings]);

  return (
    <Modal
      open={open}
      title={initial ? `Edit ${role}` : `Add ${role}`}
      wide
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
              if (!name.trim()) return;
              onSave({
                id: initial?.id,
                name: name.trim(),
                role,
                phone: phone.trim(),
                email: email.trim(),
                company: company.trim(),
                allowPickup: allowPickup === 'yes',
                kioskPin: initial?.kioskPin ?? pin(),
                photoUrl,
                applySiblingIds: selectedSiblingIds,
              });
            }}
          >
            Submit
          </button>
        </>
      }
    >
      <div className="cm-modal-form">
        <div className="cm-photo-upload">
          <button
            type="button"
            className="cm-photo-circle"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload profile photo"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" />
            ) : (
              <span className="cm-photo-placeholder">{name ? initials(name) : <Camera size={22} />}</span>
            )}
            <span className="cm-photo-cam">
              <Camera size={12} />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPhotoUrl(await readImageAsDataUrl(file));
              e.target.value = '';
            }}
          />
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              <span className="req">*</span> {role} Name
            </label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${role.toLowerCase()} name`}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Relation</label>
            <input className="ui-input" value={role} disabled />
          </div>
          <div className="ui-field">
            <label className="ui-label">Phone</label>
            <div className="cm-phone-row">
              <span className="cm-phone-code">🇮🇳 +91</span>
              <input
                className="ui-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div className="ui-field">
            <label className="ui-label">Email</label>
            <input
              className="ui-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Company Name</label>
            <input
              className="ui-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Allow child pickup</label>
            <AppSelect
              value={allowPickup}
              onChange={setAllowPickup}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>
        </div>

        {siblings && siblings.length > 0 ? (
          <div className="cm-apply-siblings-box">
            <label className="cm-apply-siblings-header">
              <input
                type="checkbox"
                className="cm-check"
                checked={applyToAllSiblings}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setApplyToAllSiblings(checked);
                  setSelectedSiblingIds(checked ? siblings.map((s) => s.id) : []);
                }}
              />
              <span>Apply this change to sibling profiles</span>
            </label>
            <div className="cm-apply-siblings-list">
              {siblings.map((sib) => (
                <label key={sib.id} className="cm-apply-sibling-item">
                  <input
                    type="checkbox"
                    className="cm-check"
                    checked={selectedSiblingIds.includes(sib.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      let next: string[];
                      if (checked) {
                        next = [...selectedSiblingIds, sib.id];
                      } else {
                        next = selectedSiblingIds.filter((id) => id !== sib.id);
                      }
                      setSelectedSiblingIds(next);
                      setApplyToAllSiblings(next.length === siblings.length);
                    }}
                  />
                  <span>{sib.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
