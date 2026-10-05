'use client';

import { memo, useMemo } from 'react';
import type { EnquirySource } from '@/lib/enquiries/types';

type Props = {
  sources: EnquirySource[];
  value: string;
  onChange: (value: string) => void;
  onManage: () => void;
  error?: string;
  id?: string;
};

export const SourceDropdown = memo(function SourceDropdown({
  sources,
  value,
  onChange,
  onManage,
  error,
  id = 'enquiry-source',
}: Props) {
  const active = useMemo(
    () => sources.filter((s) => s.status === 'Active'),
    [sources],
  );

  return (
    <div className="ui-field enq-field-stack">
      <label className="ui-label" htmlFor={id}>
        Source <span className="req">*</span>
      </label>
      <select
        id={id}
        className="ui-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      >
        <option value="">Select source</option>
        {active.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <button type="button" className="enq-manage-link" onClick={onManage}>
        + Manage Sources
      </button>
      {error ? <p className="enq-error">{error}</p> : null}
    </div>
  );
});
