'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import type { ResourceItem, ResourceType, ResourceAudience, ResourceStatus } from '@/types/resourceCenter';
import { RESOURCE_CATEGORIES } from '@/lib/mock/mockResources';

type Props = {
  open: boolean;
  editing: ResourceItem | null;
  onClose: () => void;
  onSave: (item: ResourceItem, isEdit: boolean) => void;
};

type FormState = {
  title: string;
  category: string;
  type: ResourceType;
  audience: ResourceAudience;
  description: string;
  url: string;
  size: string;
  status: ResourceStatus;
};

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: 'PDF', label: 'PDF document' },
  { value: 'DOC', label: 'Word document' },
  { value: 'Link', label: 'Web link' },
  { value: 'Video', label: 'Video' },
];

const AUDIENCE_OPTIONS: { value: ResourceAudience; label: string }[] = [
  { value: 'All', label: 'All families' },
  { value: 'Toddler', label: 'Toddler' },
  { value: 'Primary', label: 'Primary' },
  { value: 'Elementary', label: 'Elementary' },
];

const STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const CATEGORY_OPTIONS = RESOURCE_CATEGORIES.filter((c) => c !== 'All').map((c) => ({
  value: c,
  label: c,
}));

const emptyForm = (): FormState => ({
  title: '',
  category: RESOURCE_CATEGORIES[1],
  type: 'PDF',
  audience: 'All',
  description: '',
  url: '',
  size: '',
  status: 'published',
});

export function ResourceModal({ open, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        category: editing.category,
        type: editing.type,
        audience: editing.audience,
        description: editing.description,
        url: editing.url ?? '',
        size: editing.size ?? '',
        status: editing.status,
      });
    } else {
      setForm(emptyForm());
    }
    setError('');
  }, [open, editing]);

  const handleSave = () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if ((form.type === 'Link' || form.type === 'Video') && !form.url.trim()) {
      setError('A URL is required for links and videos.');
      return;
    }
    onSave(
      {
        id: editing?.id ?? '',
        title: form.title.trim(),
        category: form.category,
        type: form.type,
        audience: form.audience,
        description: form.description.trim(),
        url: form.url.trim() || undefined,
        size: form.size.trim() || undefined,
        updated: editing?.updated ?? new Date().toISOString().slice(0, 10),
        status: form.status,
      },
      Boolean(editing),
    );
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit resource' : 'Add resource'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
            {editing ? 'Save changes' : 'Add resource'}
          </button>
        </>
      }
    >
      <div className="ui-form-grid">
        <div className="ui-field rc-form-field">
          <label className="ui-label">Title</label>
          <input
            className="ui-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Nutrition Guide for Toddlers"
          />
        </div>

        <div className="ui-field rc-form-field">
          <label className="ui-label">Type</label>
          <SearchableSelect
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value as ResourceType })}
            options={TYPE_OPTIONS}
            searchable={false}
            placeholder="Select type"
            ariaLabel="Resource type"
          />
        </div>

        <div className="ui-field rc-form-field">
          <label className="ui-label">Category</label>
          <SearchableSelect
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            options={CATEGORY_OPTIONS}
            searchable
            searchPlaceholder="Search categories…"
            placeholder="Select category"
            ariaLabel="Resource category"
          />
        </div>

        <div className="ui-field rc-form-field">
          <label className="ui-label">Audience</label>
          <SearchableSelect
            value={form.audience}
            onChange={(value) => setForm({ ...form, audience: value as ResourceAudience })}
            options={AUDIENCE_OPTIONS}
            searchable={false}
            placeholder="Select audience"
            ariaLabel="Resource audience"
          />
        </div>

        <div className="ui-field rc-form-field">
          <label className="ui-label">Status</label>
          <SearchableSelect
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value as ResourceStatus })}
            options={STATUS_OPTIONS}
            searchable={false}
            placeholder="Select status"
            ariaLabel="Resource status"
          />
        </div>

        {form.type === 'PDF' || form.type === 'DOC' ? (
          <div className="ui-field rc-form-field">
            <label className="ui-label">Size</label>
            <input
              className="ui-input"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="e.g. 1.2 MB"
            />
          </div>
        ) : (
          <div className="ui-field rc-form-field">
            <label className="ui-label">URL</label>
            <input
              className="ui-input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://…"
            />
          </div>
        )}

        <div className="ui-field rc-form-field rc-form-full">
          <label className="ui-label">Description</label>
          <textarea
            className="ui-textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short summary families will see…"
            rows={3}
          />
        </div>
      </div>

      {error ? <p className="ui-field-error">{error}</p> : null}
    </Modal>
  );
}
