'use client';

import { SegmentedControl } from '@/components/reports/shared/SegmentedControl';
import type { StaffFilterBy } from './types';

type Props = {
  value: StaffFilterBy;
  onChange: (value: StaffFilterBy) => void;
};

export function StaffFilterByRadios({ value, onChange }: Props) {
  return (
    <div className="asr-field">
      <SegmentedControl
        label="Filter By"
        ariaLabel="Filter by"
        name="staff-att-filter-by"
        value={value}
        onChange={onChange}
        options={[
          { id: 'department', label: 'Department' },
          { id: 'staff', label: 'Staff' },
        ]}
      />
    </div>
  );
}
