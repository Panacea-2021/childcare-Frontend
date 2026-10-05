'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { AuthorizedPickup } from '@/lib/center-management/types';
import { PICKUP_RELATIONS } from '@/lib/center-management/types';
import { initials } from '@/lib/center-management/studentsStore';
import { AppSelect } from './ui';
import { readImageAsDataUrl } from './photoUpload';

type Props = {
  open: boolean;
  initial?: AuthorizedPickup | null;
  onClose: () => void;
  onSave: (pickup: Omit<AuthorizedPickup, 'id'> & { id?: string }) => void;
};

export function AddPickupModal({ open, initial, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setRelation(initial?.relation ?? '');
    setPhone(initial?.phone ?? '');
    setEmail(initial?.email ?? '');
    setAddress(initial?.address ?? '');
    setPhotoUrl(initial?.photoUrl);
  }, [open, initial]);

  return (
    <Modal
      open={open}
      title="Additional Authorized Pickup"
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
              if (!name.trim() || !relation) return;
              onSave({
                id: initial?.id,
                name: name.trim(),
                relation,
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
                photoUrl,
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
              Name <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
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
          <div className="ui-field">
            <label className="ui-label">Phone Number</label>
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
          <div className="ui-field">
            <label className="ui-label">Email</label>
            <input
              className="ui-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
        </div>
        <div className="ui-field" style={{ marginTop: 12 }}>
          <label className="ui-label">Address</label>
          <input
            className="ui-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />
        </div>
      </div>
    </Modal>
  );
}
