'use client';

import { memo, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createSubSourceId } from '@/lib/enquiries/sourcesStore';
import type { EnquirySource, SubSource } from '@/lib/enquiries/types';
import { SubSourceBuilder } from './subsource-builder';

type Props = {
  open: boolean;
  initial?: EnquirySource | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    status: EnquirySource['status'];
    subSources: SubSource[];
  }) => void;
};

type FormErrors = {
  name?: string;
  subSources?: string;
};

export const SourceForm = memo(function SourceForm({
  open,
  initial,
  existingNames,
  onClose,
  onSave,
}: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [status, setStatus] = useState<EnquirySource['status']>(initial?.status ?? 'Active');
  const [subSources, setSubSources] = useState<SubSource[]>(
    initial?.subSources?.length
      ? initial.subSources
      : [{ id: createSubSourceId(), name: '' }],
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset when opening with different initial (key-based parent handles remount)

  const title = useMemo(
    () => (isEdit ? 'Edit Source' : 'Add Source'),
    [isEdit],
  );

  const validate = () => {
    const next: FormErrors = {};
    const trimmed = name.trim();
    if (!trimmed) next.name = 'Source name is required';
    else if (
      existingNames.some(
        (n) => n.toLowerCase() === trimmed.toLowerCase() && n.toLowerCase() !== (initial?.name ?? '').toLowerCase(),
      )
    ) {
      next.name = 'A source with this name already exists';
    }

    const cleaned = subSources
      .map((s) => ({ ...s, name: s.name.trim() }))
      .filter((s) => s.name);

    if (!cleaned.length) {
      next.subSources = 'At least one sub source is required';
    } else {
      const seen = new Set<string>();
      for (const s of cleaned) {
        const key = s.name.toLowerCase();
        if (seen.has(key)) {
          next.subSources = 'Sub source names must be unique';
          break;
        }
        seen.add(key);
      }
    }

    setErrors(next);
    return { ok: Object.keys(next).length === 0, cleaned };
  };

  const save = () => {
    const { ok, cleaned } = validate();
    if (!ok) return;
    onSave({
      name: name.trim(),
      status,
      subSources: cleaned,
    });
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      elevated
      autoHeight
      lg
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="ui-grid-2">
        <div className="ui-field">
          <label className="ui-label">
            Source Name <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            value={name}
            placeholder="e.g. Facebook Ads"
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? <p className="enq-error">{errors.name}</p> : null}
        </div>
        <div className="ui-field">
          <label className="ui-label">Status</label>
          <select
            className="ui-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as EnquirySource['status'])}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <SubSourceBuilder
          items={subSources}
          onChange={setSubSources}
          error={errors.subSources}
          allowReorder={isEdit || subSources.length > 1}
        />
      </div>
    </Modal>
  );
});
