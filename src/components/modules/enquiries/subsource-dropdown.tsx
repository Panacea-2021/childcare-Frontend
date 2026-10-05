'use client';

import { memo, useMemo } from 'react';
import type { EnquirySource } from '@/lib/enquiries/types';

type Props = {
  sources: EnquirySource[];
  sourceName: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
};

export const SubSourceDropdown = memo(function SubSourceDropdown({
  sources,
  sourceName,
  value,
  onChange,
  error,
  id = 'enquiry-sub-source',
}: Props) {
  const options = useMemo(() => {
    const src = sources.find(
      (s) => s.name === sourceName && s.status === 'Active',
    );
    return src?.subSources ?? [];
  }, [sources, sourceName]);

  return (
    <div className="ui-field enq-field-stack">
      <label className="ui-label" htmlFor={id}>
        Sub Source <span className="req">*</span>
      </label>
      <select
        id={id}
        className="ui-select"
        value={value}
        disabled={!sourceName || !options.length}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      >
        <option value="">
          {sourceName ? 'Select sub source' : 'Select a source first'}
        </option>
        {options.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      {error ? <p className="enq-error">{error}</p> : null}
    </div>
  );
});
