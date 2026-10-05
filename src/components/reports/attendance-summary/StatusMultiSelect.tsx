'use client';

import { AsrDropdown } from './AsrDropdown';
import { STUDENT_STATUSES, type StudentStatus } from './types';

type Props = {
  value: StudentStatus[];
  onChange: (next: StudentStatus[]) => void;
  error?: string;
};

export function StatusMultiSelect({ value, onChange, error }: Props) {
  return (
    <AsrDropdown
      multiple
      label={
        <>
          Student Status <span className="asr-req">*</span>
        </>
      }
      ariaLabel="Student Status"
      placeholder="Select status…"
      searchPlaceholder="Search status…"
      value={value}
      error={error}
      onChange={(next) => onChange(next as StudentStatus[])}
      options={STUDENT_STATUSES.map((status) => ({ value: status, label: status }))}
    />
  );
}
