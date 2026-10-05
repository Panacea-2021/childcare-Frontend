'use client';

import { useEffect, useMemo, useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FOLDER_COLORS, FOLDER_ICONS } from './constants';
import { FolderGlyph } from './icons';
import type { CurriculumFolder, FolderFormState, FolderIconKey } from './types';
import { emptyFolderForm } from './types';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  folders: CurriculumFolder[];
  initial?: CurriculumFolder | null;
  defaultParentId?: string;
  excludeFolderIds?: Set<string>;
  onClose: () => void;
  onSave: (form: FolderFormState) => Promise<void> | void;
};

export function FolderFormModal({
  open,
  mode,
  folders,
  initial,
  defaultParentId = '',
  excludeFolderIds,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<FolderFormState>(emptyFolderForm(defaultParentId));
  const [errors, setErrors] = useState<Partial<Record<keyof FolderFormState, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setErrors({});
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name,
        parentId: initial.parentId ?? '',
        description: initial.description,
        color: initial.color,
        icon: initial.icon,
      });
      return;
    }
    setForm(emptyFolderForm(defaultParentId));
  }, [open, mode, initial, defaultParentId]);

  const parentOptions = useMemo(() => {
    return folders.filter((f) => {
      if (excludeFolderIds?.has(f.id)) return false;
      if (mode === 'edit' && initial && f.id === initial.id) return false;
      return true;
    });
  }, [folders, excludeFolderIds, mode, initial]);

  const validate = () => {
    const next: Partial<Record<keyof FolderFormState, string>> = {};
    if (!form.name.trim()) next.name = 'Folder name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate() || busy) return;
    setBusy(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Folder' : 'Add Folder'}
      onClose={onClose}
      icon={<FolderPlus size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Folder'}
          </button>
        </>
      }
    >
      <div className="ui-grid-2">
        <div className={`ui-field${errors.name ? ' ui-field-error' : ''}`}>
          <label className="ui-label" htmlFor="cd-folder-name">
            Folder Name <span className="req">*</span>
          </label>
          <input
            id="cd-folder-name"
            className="ui-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Mathematics"
            autoFocus
          />
          {errors.name ? <p className="ui-error-text">{errors.name}</p> : null}
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cd-folder-parent">
            Parent Folder
          </label>
          <select
            id="cd-folder-parent"
            className="ui-select"
            value={form.parentId}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
          >
            <option value="">None (Library root)</option>
            {parentOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field cd-span-2">
          <label className="ui-label" htmlFor="cd-folder-desc">
            Description
          </label>
          <textarea
            id="cd-folder-desc"
            className="ui-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>

        <div className="ui-field">
          <span className="ui-label">Color Label</span>
          <div className="cd-color-grid" role="listbox" aria-label="Folder color">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`cd-color-swatch${form.color === color ? ' is-on' : ''}`}
                style={{ background: color }}
                aria-label={`Color ${color}`}
                aria-selected={form.color === color}
                onClick={() => setForm((f) => ({ ...f, color }))}
              />
            ))}
          </div>
        </div>

        <div className="ui-field">
          <span className="ui-label">Folder Icon</span>
          <div className="cd-icon-grid" role="listbox" aria-label="Folder icon">
            {FOLDER_ICONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`cd-icon-swatch${form.icon === opt.value ? ' is-on' : ''}`}
                aria-label={opt.label}
                aria-selected={form.icon === opt.value}
                onClick={() => setForm((f) => ({ ...f, icon: opt.value as FolderIconKey }))}
              >
                <FolderGlyph icon={opt.value} size={18} color={form.color} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
