'use client';

import { memo, useMemo } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';
import type { CustomFieldDef } from './types';
import type { EnquiryStageConfig, LostReason } from '@/lib/enquiries/types';
import { GENDER_OPTIONS } from './types';
import { SCHOOL_OPTIONS, SUB_PARENT_OPTIONS } from './mockData';
import { SearchableSelect } from './SearchableSelect';
import { DatePickerField } from './DatePickerField';
import { DynamicCustomFields } from './DynamicCustomFields';
import { DynamicStageSelect } from './dynamic-stage-select';
import { DynamicLostReasonSelect } from './dynamic-lost-reason-select';

type Props = {
  control: Control<EnquiryFormValues>;
  errors: FieldErrors<EnquiryFormValues>;
  customFields: CustomFieldDef[];
  stages: EnquiryStageConfig[];
  lostReasons: LostReason[];
  onClearLostReason: () => void;
};

export const ChildInformation = memo(function ChildInformation({
  control,
  errors,
  customFields,
  stages,
  lostReasons,
  onClearLostReason,
}: Props) {
  const genderOptions = useMemo(
    () => GENDER_OPTIONS.map((g) => ({ value: g, label: g })),
    [],
  );
  const customValues = useWatch({ control, name: 'customValues' });
  const stageValue = useWatch({ control, name: 'stage' }) ?? '';
  const lostReasonValue = useWatch({ control, name: 'lostReason' }) ?? '';

  return (
    <div className="ui-grid-2">
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-student-name">
          Student Name *
        </label>
        <Controller
          name="studentName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-student-name"
              className="ui-input"
              placeholder="Enter student name"
              aria-invalid={Boolean(errors.studentName)}
            />
          )}
        />
        {errors.studentName ? <p className="enq-error">{errors.studentName.message}</p> : null}
      </div>

      <div className="ui-field">
        <label className="ui-label">Stage *</label>
        <Controller
          name="stage"
          control={control}
          render={({ field }) => (
            <DynamicStageSelect
              stages={stages}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                if (v.trim().toLowerCase() !== 'lost') onClearLostReason();
              }}
              error={errors.stage?.message}
            />
          )}
        />
      </div>

      <Controller
        name="lostReason"
        control={control}
        render={({ field }) => (
          <DynamicLostReasonSelect
            stageName={stageValue}
            reasons={lostReasons}
            value={field.value || lostReasonValue}
            onChange={field.onChange}
            onClear={onClearLostReason}
            error={errors.lostReason?.message}
          />
        )}
      />

      <div className="ui-field">
        <label className="ui-label">Gender *</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              options={genderOptions}
              placeholder="Select gender"
              error={errors.gender?.message}
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-dob">
          Date of Birth
        </label>
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="enq-dob"
              value={field.value ?? ''}
              onChange={field.onChange}
              max={new Date().toISOString().slice(0, 10)}
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-preferred">
          Preferred Name
        </label>
        <Controller
          name="preferredName"
          control={control}
          render={({ field }) => (
            <input {...field} id="enq-preferred" className="ui-input" placeholder="Nickname" />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-emergency-name">
          Emergency Contact Name
        </label>
        <Controller
          name="emergencyContactName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-emergency-name"
              className="ui-input"
              placeholder="Contact person"
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-emergency-phone">
          Emergency Contact Number
        </label>
        <Controller
          name="emergencyContactNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-emergency-phone"
              className="ui-input"
              type="tel"
              placeholder="+91 …"
              aria-invalid={Boolean(errors.emergencyContactNumber)}
            />
          )}
        />
        {errors.emergencyContactNumber ? (
          <p className="enq-error">{errors.emergencyContactNumber.message}</p>
        ) : null}
      </div>

      <div className="ui-field">
        <label className="ui-label">School</label>
        <Controller
          name="school"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              options={SCHOOL_OPTIONS}
              placeholder="Search school"
              searchable
            />
          )}
        />
      </div>

      <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
        <label className="ui-label" htmlFor="enq-address">
          Address
        </label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="enq-address"
              className="ui-textarea"
              rows={3}
              placeholder="Residential address"
            />
          )}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label">Sub Parent</label>
        <Controller
          name="subParent"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              options={SUB_PARENT_OPTIONS}
              placeholder="Select sub parent"
              searchable
            />
          )}
        />
      </div>

      <DynamicCustomFields fields={customFields} values={customValues} control={control} />
    </div>
  );
});
