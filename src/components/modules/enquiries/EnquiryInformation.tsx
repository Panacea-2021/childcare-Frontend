'use client';

import { memo, useMemo } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';
import type { CustomFieldDef } from './types';
import type { EnquirySource } from '@/lib/enquiries/types';
import { FACULTY_OPTIONS, PROGRAM_OPTIONS } from './mockData';
import { SearchableSelect } from './SearchableSelect';
import { DatePickerField } from './DatePickerField';
import { DynamicSubSource } from './DynamicSubSource';
import { DynamicCustomFields } from './DynamicCustomFields';

type Props = {
  control: Control<EnquiryFormValues>;
  errors: FieldErrors<EnquiryFormValues>;
  customFields: CustomFieldDef[];
  sources: EnquirySource[];
  onClearSubSource: () => void;
  onManageSources: () => void;
};

export const EnquiryInformation = memo(function EnquiryInformation({
  control,
  errors,
  customFields,
  sources,
  onClearSubSource,
  onManageSources,
}: Props) {
  const notes = useWatch({ control, name: 'additionalNotes' }) ?? '';
  const customValues = useWatch({ control, name: 'customValues' });

  const facultyOptions = useMemo(
    () =>
      FACULTY_OPTIONS.map((f) => ({
        value: f.id,
        label: f.name,
        node: (
          <span className="enq-assignee">
            <span className="enq-avatar" aria-hidden>
              {f.initials}
            </span>
            <span>
              {f.name}
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                {f.role}
              </span>
            </span>
          </span>
        ),
      })),
    [],
  );

  const sourceOptions = useMemo(
    () =>
      sources
        .filter((s) => s.status === 'Active')
        .map((s) => ({ value: s.name, label: s.name })),
    [sources],
  );

  return (
    <div className="ui-grid-2">
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-created-on">
          Created On *
        </label>
        <Controller
          name="createdOn"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="enq-created-on"
              value={field.value}
              onChange={field.onChange}
              error={errors.createdOn?.message}
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label">Assigned To *</label>
        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              options={facultyOptions}
              placeholder="Select faculty"
              searchable
              error={errors.assignedTo?.message}
            />
          )}
        />
      </div>

      <div className="ui-field enq-field-stack">
        <label className="ui-label">Source *</label>
        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                onClearSubSource();
              }}
              options={sourceOptions}
              placeholder="Select source"
              error={errors.source?.message}
            />
          )}
        />
        <button type="button" className="enq-manage-link" onClick={onManageSources}>
          + Manage Sources
        </button>
      </div>

      <DynamicSubSource
        control={control}
        sources={sources}
        errors={errors}
        onSourceClearsSub={onClearSubSource}
      />

      <div className="ui-field">
        <label className="ui-label">Program *</label>
        <Controller
          name="program"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              options={PROGRAM_OPTIONS}
              placeholder="Search program"
              searchable
              error={errors.program?.message}
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-start-date">
          Expected Start Date
        </label>
        <Controller
          name="expectedStartDate"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="enq-start-date"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
        <label className="ui-label" htmlFor="enq-notes">
          Additional Notes
        </label>
        <Controller
          name="additionalNotes"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="enq-notes"
              className="ui-textarea"
              rows={4}
              maxLength={1000}
              placeholder="Add any relevant notes…"
            />
          )}
        />
        <p className="enq-char">{notes.length}/1000</p>
        {errors.additionalNotes ? (
          <p className="enq-error">{errors.additionalNotes.message}</p>
        ) : null}
      </div>

      <DynamicCustomFields fields={customFields} values={customValues} control={control} />
    </div>
  );
});
