'use client';

import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';

type Props = {
  startDate: string;
  endDate: string;
  error?: string;
  /** Field label above the range pickers. Defaults to Attendance Date. */
  label?: string;
  startAriaLabel?: string;
  endAriaLabel?: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
};

export function DateRangeField({
  startDate,
  endDate,
  error,
  label = 'Attendance Date',
  startAriaLabel = 'Start date',
  endAriaLabel = 'End date',
  onChange,
}: Props) {
  return (
    <div className="asr-field">
      <label className="ui-label">
        {label} <span className="asr-req">*</span>
      </label>
      <div className="asr-range">
        <div className="asr-range-item">
          <label htmlFor="asr-start">Start Date</label>
          <FieldDatePicker
            value={startDate}
            onChange={(value) => onChange({ startDate: value, endDate })}
            ariaLabel={startAriaLabel}
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div className="asr-range-item">
          <label htmlFor="asr-end">End Date</label>
          <FieldDatePicker
            value={endDate}
            onChange={(value) => onChange({ startDate, endDate: value })}
            ariaLabel={endAriaLabel}
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>
      {error ? <p className="asr-error">{error}</p> : null}
    </div>
  );
}
