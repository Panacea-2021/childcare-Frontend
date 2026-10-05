'use client';

import { useEffect, useState } from 'react';
import { Pencil, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import type { FormCategory, FormItem, FormStatus, FormType } from './types';

type Props = {
  open: boolean;
  form: FormItem | null;
  onClose: () => void;
  onSave: (next: FormItem) => void;
  onOpenBuilder: (form: FormItem) => void;
};

const CATEGORIES: FormCategory[] = [
  'Admissions',
  'Operations',
  'Parent Communication',
  'Staff Management',
];

const TYPES: FormType[] = ['Student', 'Staff', 'Enquiry'];
const STATUSES: FormStatus[] = ['Live', 'Draft'];

export function EditFormModal({ open, form, onClose, onSave, onOpenBuilder }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<FormStatus>('Draft');
  const [type, setType] = useState<FormType>('Student');
  const [category, setCategory] = useState<FormCategory>('Operations');
  const [durationMin, setDurationMin] = useState('');
  const [openUntil, setOpenUntil] = useState('');

  useEffect(() => {
    if (!open || !form) return;
    setName(form.name);
    setStatus(form.status);
    setType(form.type);
    setCategory(form.category);
    setDurationMin(form.durationMin != null ? String(form.durationMin) : '');
    setOpenUntil(form.openUntil ?? '');
  }, [open, form]);

  if (!form) return null;

  const trimmed = name.trim();
  const canSave = Boolean(trimmed);

  const buildUpdated = (): FormItem => ({
    ...form,
    name: trimmed,
    status,
    type,
    category,
    durationMin: durationMin.trim() ? Number(durationMin) : undefined,
    openUntil: openUntil.trim() || undefined,
  });

  return (
    <Modal
      open={open}
      title="Edit Form"
      subtitle="Update form details or open the full builder"
      icon={<Pencil size={18} />}
      wide
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-secondary"
            onClick={() => onOpenBuilder(buildUpdated())}
          >
            <Wrench size={15} aria-hidden />
            Open Builder
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave(buildUpdated());
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="ui-grid-2 efm-grid">
        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label" htmlFor="efm-name">
            Form Name
          </label>
          <input
            id="efm-name"
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter form name"
            autoFocus
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="efm-status">
            Status
          </label>
          <SearchableSelect
            id="efm-status"
            value={status}
            onChange={(v) => setStatus(v as FormStatus)}
            options={STATUSES}
            searchable={false}
            ariaLabel="Form status"
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="efm-type">
            Form Type
          </label>
          <SearchableSelect
            id="efm-type"
            value={type}
            onChange={(v) => setType(v as FormType)}
            options={TYPES}
            searchable={false}
            ariaLabel="Form type"
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="efm-category">
            Category
          </label>
          <SearchableSelect
            id="efm-category"
            value={category}
            onChange={(v) => setCategory(v as FormCategory)}
            options={CATEGORIES}
            searchPlaceholder="Search category…"
            ariaLabel="Form category"
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="efm-duration">
            Duration (minutes)
          </label>
          <input
            id="efm-duration"
            className="ui-input"
            type="number"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>

        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label" htmlFor="efm-until">
            Open Until
          </label>
          <input
            id="efm-until"
            className="ui-input"
            value={openUntil}
            onChange={(e) => setOpenUntil(e.target.value)}
            placeholder="DD/MM/YYYY"
          />
        </div>
      </div>
    </Modal>
  );
}
