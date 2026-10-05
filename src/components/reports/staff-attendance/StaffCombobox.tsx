'use client';

import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { MOCK_STAFF } from './types';

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string;
};

export function StaffCombobox({ value, onChange, error }: Props) {
  return (
    <AsrDropdown
      label={
        <>
          Select Staff <span className="asr-req">*</span>
        </>
      }
      ariaLabel="Select Staff"
      placeholder="Search and select a staff member…"
      searchPlaceholder="Search by name, employee ID, or department…"
      value={value}
      error={error}
      onChange={onChange}
      options={MOCK_STAFF.map((staff) => ({
        value: staff.id,
        label: staff.name,
        meta: `${staff.employeeId} · ${staff.department}`,
        leading: <span className={`asr-avatar ${staff.tone}`}>{staff.initials}</span>,
      }))}
    />
  );
}
