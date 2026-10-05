'use client';

import { SegmentedControl } from '@/components/reports/shared/SegmentedControl';
import type { FilterBy } from './types';

type Props = {
  value: FilterBy;
  onChange: (value: FilterBy) => void;
};

export function FilterByRadios({ value, onChange }: Props) {
  return (
    <div className="asr-field">
      <SegmentedControl
        label="Filter By"
        ariaLabel="Filter by"
        name="asr-filter-by"
        value={value}
        onChange={onChange}
        options={[
          { id: 'classroom', label: 'Classroom' },
          { id: 'student', label: 'Student' },
        ]}
      />
    </div>
  );
}
