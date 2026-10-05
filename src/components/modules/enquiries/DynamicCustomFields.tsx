'use client';

import { memo } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';
import type { CustomFieldDef } from './types';

type Props = {
  control: Control<EnquiryFormValues>;
  fields: CustomFieldDef[];
  values: EnquiryFormValues['customValues'];
};

export const DynamicCustomFields = memo(function DynamicCustomFields({
  control,
  fields,
}: Props) {
  if (!fields.length) return null;

  return (
    <>
      {fields.map((field) => {
        const name = `customValues.${field.id}` as const;
        const label = `${field.label}${field.required ? ' *' : ''}`;

        if (field.type === 'Textarea') {
          return (
            <div key={field.id} className="ui-field" style={{ gridColumn: '1 / -1' }}>
              <label className="ui-label">{label}</label>
              <Controller
                name={name}
                control={control}
                render={({ field: f }) => (
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder={field.placeholder}
                    value={String(f.value ?? '')}
                    onChange={(e) => f.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          );
        }

        if (field.type === 'Checkbox') {
          return (
            <div key={field.id} className="ui-field">
              <label className="enq-check">
                <Controller
                  name={name}
                  control={control}
                  render={({ field: f }) => (
                    <input
                      type="checkbox"
                      checked={Boolean(f.value)}
                      onChange={(e) => f.onChange(e.target.checked)}
                    />
                  )}
                />
                {label}
              </label>
            </div>
          );
        }

        if (field.type === 'Radio Button') {
          return (
            <div key={field.id} className="ui-field" style={{ gridColumn: '1 / -1' }}>
              <span className="ui-label">{label}</span>
              <div className="enq-radio-group">
                <Controller
                  name={name}
                  control={control}
                  render={({ field: f }) => (
                    <>
                      {(field.options ?? []).map((opt) => (
                        <label key={opt} className="enq-check">
                          <input
                            type="radio"
                            name={field.id}
                            checked={f.value === opt}
                            onChange={() => f.onChange(opt)}
                          />
                          {opt}
                        </label>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>
          );
        }

        if (field.type === 'Dropdown') {
          return (
            <div key={field.id} className="ui-field">
              <label className="ui-label">{label}</label>
              <Controller
                name={name}
                control={control}
                render={({ field: f }) => (
                  <select
                    className="ui-select"
                    value={String(f.value ?? '')}
                    onChange={(e) => f.onChange(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          );
        }

        const inputType =
          field.type === 'Number'
            ? 'number'
            : field.type === 'Email'
              ? 'email'
              : field.type === 'Phone'
                ? 'tel'
                : field.type === 'Date'
                  ? 'date'
                  : 'text';

        return (
          <div key={field.id} className="ui-field">
            <label className="ui-label">{label}</label>
            <Controller
              name={name}
              control={control}
              render={({ field: f }) => (
                <input
                  className="ui-input"
                  type={inputType}
                  placeholder={field.placeholder}
                  value={String(f.value ?? '')}
                  onChange={(e) => f.onChange(e.target.value)}
                />
              )}
            />
          </div>
        );
      })}
    </>
  );
});
