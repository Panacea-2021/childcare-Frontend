'use client';

import { memo, useEffect, useMemo } from 'react';
import type { EnquirySource } from '@/lib/enquiries/types';
import { SearchableSelect } from './SearchableSelect';

type Props = {
  sources: EnquirySource[];
  sourceName: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  error?: string;
  required?: boolean;
};

export const DynamicSubSourceSelect = memo(function DynamicSubSourceSelect({
  sources,
  sourceName,
  value,
  onChange,
  onClear,
  error,
  required = true,
}: Props) {
  const options = useMemo(() => {
    const src = sources.find((s) => s.name === sourceName && s.status === 'Active');
    return (src?.subSources ?? []).map((s) => ({ value: s.name, label: s.name }));
  }, [sources, sourceName]);

  useEffect(() => {
    if (!options.length) {
      if (value) onClear?.();
      return;
    }
    if (value && !options.some((o) => o.value === value)) {
      onClear?.();
    }
  }, [options, value, onClear]);

  if (!sourceName || !options.length) return null;

  return (
    <div className="ui-field">
      <label className="ui-label">
        Sub Source{required ? ' *' : ''}
      </label>
      <SearchableSelect
        key={sourceName}
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Select sub source"
        error={error}
        searchable
      />
    </div>
  );
});
