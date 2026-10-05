'use client';

import { memo, useMemo } from 'react';
import type { EnquirySource } from '@/lib/enquiries/types';
import { SearchableSelect } from './SearchableSelect';

type Props = {
  sources: EnquirySource[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export const DynamicSourceSelect = memo(function DynamicSourceSelect({
  sources,
  value,
  onChange,
  error,
  placeholder = 'Select source',
}: Props) {
  const options = useMemo(
    () =>
      sources
        .filter((s) => s.status === 'Active')
        .map((s) => ({ value: s.name, label: s.name })),
    [sources],
  );

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      error={error}
      searchable
    />
  );
});
