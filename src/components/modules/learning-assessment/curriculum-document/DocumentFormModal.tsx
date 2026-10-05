'use client';

import { useEffect, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DOC_TYPES } from './constants';
import { FileUploadZone } from './FileUploadZone';
import type { CurriculumDocument, CurriculumFolder, DocumentFormState, DocStatus, DocType } from './types';
import { emptyDocumentForm } from './types';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  folders: CurriculumFolder[];
  initial?: CurriculumDocument | null;
  defaultFolderId?: string;
  onClose: () => void;
  onSave: (form: DocumentFormState) => Promise<void> | void;
};

export function DocumentFormModal({
  open,
  mode,
  folders,
  initial,
  defaultFolderId = '',
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<DocumentFormState>(emptyDocumentForm(defaultFolderId));
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadOk, setUploadOk] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setErrors({});
    setProgress(0);
    setUploadOk(false);
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name,
        folderId: initial.folderId,
        description: initial.description,
        type: initial.type,
        tags: initial.tags.join(', '),
        status: initial.status,
        fileName: initial.fileName,
        fileUrl: initial.fileUrl,
        size: initial.size,
        sizeBytes: initial.sizeBytes,
      });
      setUploadOk(Boolean(initial.fileName));
      setProgress(initial.fileName ? 100 : 0);
      return;
    }
    setForm(emptyDocumentForm(defaultFolderId));
  }, [open, mode, initial, defaultFolderId]);

  const validate = () => {
    const next: Partial<Record<keyof DocumentFormState, string>> = {};
    if (!form.name.trim()) next.name = 'Document name is required';
    if (!form.folderId) next.folderId = 'Select a folder';
    if (mode === 'create' && !form.fileName) next.fileName = 'Please upload a document';
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
      title={mode === 'edit' ? 'Edit Document' : 'Add Document'}
      onClose={onClose}
      wide
      icon={<FilePlus2 size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Upload'}
          </button>
        </>
      }
    >
      <div className="ui-grid-2">
        <div className={`ui-field${errors.name ? ' ui-field-error' : ''}`}>
          <label className="ui-label" htmlFor="cd-doc-name">
            Document Name <span className="req">*</span>
          </label>
          <input
            id="cd-doc-name"
            className="ui-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Numbers.pdf"
            autoFocus
          />
          {errors.name ? <p className="ui-error-text">{errors.name}</p> : null}
        </div>

        <div className={`ui-field${errors.folderId ? ' ui-field-error' : ''}`}>
          <label className="ui-label" htmlFor="cd-doc-folder">
            Select Folder <span className="req">*</span>
          </label>
          <select
            id="cd-doc-folder"
            className="ui-select"
            value={form.folderId}
            onChange={(e) => setForm((f) => ({ ...f, folderId: e.target.value }))}
          >
            <option value="">Select folder…</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {errors.folderId ? <p className="ui-error-text">{errors.folderId}</p> : null}
        </div>

        <div className="ui-field cd-span-2">
          <label className="ui-label" htmlFor="cd-doc-desc">
            Description
          </label>
          <textarea
            id="cd-doc-desc"
            className="ui-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cd-doc-type">
            Document Type
          </label>
          <select
            id="cd-doc-type"
            className="ui-select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DocType }))}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cd-doc-status">
            Status
          </label>
          <select
            id="cd-doc-status"
            className="ui-select"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DocStatus }))}
          >
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="ui-field cd-span-2">
          <label className="ui-label" htmlFor="cd-doc-tags">
            Tags
          </label>
          <input
            id="cd-doc-tags"
            className="ui-input"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="Comma-separated tags, e.g. math, grade-1"
          />
        </div>

        <div className={`ui-field cd-span-2${errors.fileName ? ' ui-field-error' : ''}`}>
          <span className="ui-label">
            Upload Document {mode === 'create' ? <span className="req">*</span> : null}
          </span>
          <FileUploadZone
            fileName={form.fileName}
            progress={progress}
            success={uploadOk}
            disabled={busy}
            onProgress={setProgress}
            onSuccessChange={setUploadOk}
            onFile={(result) => {
              setForm((f) => ({
                ...f,
                fileName: result.fileName,
                fileUrl: result.fileUrl,
                size: result.size,
                sizeBytes: result.sizeBytes,
                type: result.type,
                name: f.name.trim() ? f.name : result.fileName,
              }));
              setErrors((e) => ({ ...e, fileName: undefined }));
            }}
          />
          {errors.fileName ? <p className="ui-error-text">{errors.fileName}</p> : null}
        </div>
      </div>
    </Modal>
  );
}
