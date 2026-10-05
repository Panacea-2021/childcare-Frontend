'use client';

import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { STAFF_MEMBER_STATUSES, type StaffMemberStatus } from './types';

type Props = {
  value: StaffMemberStatus[];
  onChange: (next: StaffMemberStatus[]) => void;
  error?: string;
};

export function StaffStatusMultiSelect({ value, onChange, error }: Props) {
  return (
    <AsrDropdown
      multiple
      label={
        <>
          Staff Status <span className="asr-req">*</span>
        </>
      }
      ariaLabel="Staff Status"
      placeholder="Select status…"
      searchPlaceholder="Search status…"
      value={value}
      error={error}
      onChange={(next) => onChange(next as StaffMemberStatus[])}
      options={STAFF_MEMBER_STATUSES.map((status) => ({ value: status, label: status }))}
    />
  );
}
