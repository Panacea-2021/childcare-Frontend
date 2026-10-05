'use client';

import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { STAFF_DEPARTMENTS } from './types';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function DepartmentMultiSelect({
  value,
  onChange,
  placeholder = 'Leave blank to include all departments.',
}: Props) {
  return (
    <AsrDropdown
      multiple
      label="Select Department"
      placeholder={placeholder}
      searchPlaceholder="Search departments…"
      value={value}
      onChange={onChange}
      options={STAFF_DEPARTMENTS.map((department) => ({
        value: department,
        label: department,
      }))}
    />
  );
}
