'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createLostReasonId } from '@/lib/enquiries/stagesStore';
import type { LostReason } from '@/lib/enquiries/types';
import { LostReasonList } from './lost-reason-list';

type Props = {
  open: boolean;
  reasons: LostReason[];
  onClose: () => void;
  onChange: (reasons: LostReason[]) => void;
};

type FormErrors = {
  name?: string;
};

export const LostReasonDialog = memo(function LostReasonDialog({
  open,
  reasons,
  onClose,
  onChange,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LostReason | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<LostReason | null>(null);

  const existingNames = useMemo(() => reasons.map((r) => r.name), [reasons]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setName('');
    setDescription('');
    setActive(true);
    setErrors({});
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((reason: LostReason) => {
    setEditing(reason);
    setName(reason.name);
    setDescription(reason.description);
    setActive(reason.active);
    setErrors({});
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const saveForm = useCallback(() => {
    const nextErr: FormErrors = {};
    const trimmed = name.trim();
    if (!trimmed) nextErr.name = 'Reason name is required';
    else if (
      existingNames.some(
        (n) =>
          n.toLowerCase() === trimmed.toLowerCase() &&
          n.toLowerCase() !== (editing?.name ?? '').toLowerCase(),
      )
    ) {
      nextErr.name = 'A reason with this name already exists';
    }
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;

    if (editing) {
      onChange(
        reasons.map((r) =>
          r.id === editing.id
            ? {
                ...r,
                name: trimmed,
                description: description.trim(),
                active,
              }
            : r,
        ),
      );
    } else {
      onChange([
        ...reasons,
        {
          id: createLostReasonId(),
          name: trimmed,
          description: description.trim(),
          active,
          order: reasons.length,
        },
      ]);
    }
    closeForm();
  }, [active, closeForm, description, editing, existingNames, name, onChange, reasons]);

  const reorder = useCallback(
    (from: number, to: number) => {
      const next = [...reasons];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(to, 0, moved);
      onChange(next.map((r, i) => ({ ...r, order: i })));
    },
    [onChange, reasons],
  );

  const toggle = useCallback(
    (reason: LostReason) => {
      onChange(
        reasons.map((r) => (r.id === reason.id ? { ...r, active: !r.active } : r)),
      );
    },
    [onChange, reasons],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    onChange(reasons.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget, onChange, reasons]);

  return (
    <>
      <Modal
        open={open}
        title="Configure Lost Reasons"
        subtitle="These reasons appear when an enquiry is moved to Lost."
        onClose={onClose}
        elevated
        xl
        autoHeight
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="enq-source-toolbar">
          <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
            {reasons.length} reason{reasons.length === 1 ? '' : 's'} configured
          </p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
            + Add Reason
          </button>
        </div>
        <LostReasonList
          reasons={reasons}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onReorder={reorder}
          onToggle={toggle}
        />
      </Modal>

      <Modal
        key={formKey}
        open={formOpen}
        title={editing ? 'Edit Lost Reason' : 'Add Lost Reason'}
        onClose={closeForm}
        elevated
        autoHeight
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeForm}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveForm}>
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="lost-reason-name">
              Reason Name <span className="req">*</span>
            </label>
            <input
              id="lost-reason-name"
              className="ui-input"
              value={name}
              placeholder="e.g. Fee Too High"
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name ? <p className="enq-error">{errors.name}</p> : null}
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="lost-reason-desc">
              Description
            </label>
            <textarea
              id="lost-reason-desc"
              className="ui-textarea"
              rows={3}
              value={description}
              placeholder="Optional details"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="enq-stage-toggle enq-stage-toggle-lg">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Active</span>
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Reason?"
        onClose={() => setDeleteTarget(null)}
        elevated
        autoHeight
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
          This action cannot be undone.
          {deleteTarget ? (
            <>
              {' '}
              Remove <strong>{deleteTarget.name}</strong>?
            </>
          ) : null}
        </p>
      </Modal>
    </>
  );
});
