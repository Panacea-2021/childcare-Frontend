'use client';

import { memo, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { EnquiryStageConfig, StageIconKey } from '@/lib/enquiries/types';
import { STAGE_ICON_OPTIONS } from '@/lib/enquiries/stagesStore';
import { StageColorPicker } from './stage-color-picker';
import { getStageIcon } from './stage-icon';

type Props = {
  open: boolean;
  initial?: EnquiryStageConfig | null;
  defaultColor: string;
  existingNames: string[];
  /** When editing Admitted, lock name/active. */
  lockSystemFields?: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    color: string;
    icon: StageIconKey;
    description: string;
    active: boolean;
  }) => void;
};

type FormErrors = {
  name?: string;
  color?: string;
};

export const StageFormDialog = memo(function StageFormDialog({
  open,
  initial,
  defaultColor,
  existingNames,
  lockSystemFields = false,
  onClose,
  onSave,
}: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? defaultColor);
  const [icon, setIcon] = useState<StageIconKey>(initial?.icon ?? 'flag');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const title = useMemo(() => (isEdit ? 'Edit Stage' : 'Add Stage'), [isEdit]);
  const IconPreview = getStageIcon(icon);

  const validate = () => {
    const next: FormErrors = {};
    const trimmed = name.trim();
    if (!trimmed) next.name = 'Stage name is required';
    else if (
      existingNames.some(
        (n) =>
          n.toLowerCase() === trimmed.toLowerCase() &&
          n.toLowerCase() !== (initial?.name ?? '').toLowerCase(),
      )
    ) {
      next.name = 'A stage with this name already exists';
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      next.color = 'Enter a valid hex color (e.g. #5D5FEF)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      color,
      icon,
      description: description.trim(),
      active: lockSystemFields ? true : active,
    });
  };

  return (
    <Modal
      open={open}
      title={title}
      subtitle={isEdit ? 'Update how this stage appears in the pipeline' : 'Create a new enquiry stage'}
      onClose={onClose}
      elevated
      lg
      autoHeight
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
          <label className="ui-label" htmlFor="stage-name">
            Stage Name <span className="req">*</span>
          </label>
          <input
            id="stage-name"
            className="ui-input"
            value={name}
            disabled={lockSystemFields}
            placeholder="e.g. Tour Scheduled"
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? <p className="enq-error">{errors.name}</p> : null}
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="stage-icon">
            Icon
          </label>
          <div className="enq-icon-select-row">
            <span className="enq-icon-preview" style={{ color }}>
              <IconPreview size={18} aria-hidden />
            </span>
            <select
              id="stage-icon"
              className="ui-select"
              value={icon}
              onChange={(e) => setIcon(e.target.value as StageIconKey)}
            >
              {STAGE_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label">Stage Color</label>
          <StageColorPicker value={color} onChange={setColor} />
          {errors.color ? <p className="enq-error">{errors.color}</p> : null}
        </div>

        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label" htmlFor="stage-desc">
            Description
          </label>
          <textarea
            id="stage-desc"
            className="ui-textarea"
            rows={3}
            value={description}
            placeholder="Optional short description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {!lockSystemFields ? (
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="enq-stage-toggle enq-stage-toggle-lg">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Active — show this stage in forms and filters</span>
            </label>
          </div>
        ) : (
          <p className="enq-system-note">
            This is a system stage. Renaming and disabling are locked for now.
          </p>
        )}
      </div>
    </Modal>
  );
});
