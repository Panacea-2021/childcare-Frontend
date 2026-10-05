'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { customFieldSchema, type CustomFieldFormValues } from './schema';
import type { CustomFieldDef, CustomFieldCategory, CustomFieldType } from './types';
import { CUSTOM_FIELD_TYPES } from './types';

type Props = {
  open: boolean;
  category: CustomFieldCategory;
  editing: CustomFieldDef | null;
  onClose: () => void;
  onSave: (field: Omit<CustomFieldDef, 'id'> & { id?: string }) => void;
};

const CATEGORY_LABEL: Record<CustomFieldCategory, string> = {
  child: 'Child Information',
  enquiry: 'Enquiry Information',
  parent: 'Parent Information',
};

export function CustomFieldBuilder({ open, category, editing, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema) as Resolver<CustomFieldFormValues>,
    defaultValues: {
      label: '',
      type: 'Text',
      required: false,
      placeholder: '',
      optionsText: '',
    },
  });

  const type = watch('type');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        label: editing.label,
        type: editing.type,
        required: editing.required,
        placeholder: editing.placeholder ?? '',
        optionsText: (editing.options ?? []).join('\n'),
      });
    } else {
      reset({
        label: '',
        type: 'Text',
        required: false,
        placeholder: '',
        optionsText: '',
      });
    }
  }, [open, editing, reset]);

  const submit = handleSubmit((values) => {
    const options =
      values.type === 'Dropdown' || values.type === 'Radio Button'
        ? values.optionsText
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined;

    onSave({
      id: editing?.id,
      category,
      label: values.label,
      type: values.type as CustomFieldType,
      required: values.required,
      placeholder: values.placeholder,
      options,
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      title={editing ? 'Edit Custom Field' : 'Add Custom Field'}
      subtitle={CATEGORY_LABEL[category]}
      onClose={onClose}
      elevated
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit}>
            Save
          </button>
        </>
      }
    >
      <div className="enq-builder ui-grid-2">
        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label" htmlFor="cf-label">
            Field Label *
          </label>
          <input id="cf-label" className="ui-input" {...register('label')} />
          {errors.label ? <p className="enq-error">{errors.label.message}</p> : null}
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cf-type">
            Field Type *
          </label>
          <select id="cf-type" className="ui-select" {...register('type')}>
            {CUSTOM_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label">&nbsp;</label>
          <label className="enq-check">
            <input type="checkbox" {...register('required')} />
            Required
          </label>
        </div>

        <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
          <label className="ui-label" htmlFor="cf-placeholder">
            Placeholder
          </label>
          <input id="cf-placeholder" className="ui-input" {...register('placeholder')} />
        </div>

        {type === 'Dropdown' || type === 'Radio Button' ? (
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="cf-options">
              Options (one per line) *
            </label>
            <textarea id="cf-options" className="ui-textarea" rows={4} {...register('optionsText')} />
            {errors.optionsText ? <p className="enq-error">{errors.optionsText.message}</p> : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
