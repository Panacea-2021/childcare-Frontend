'use client';

import { memo, useEffect, useMemo } from 'react';
import type { LostReason } from '@/lib/enquiries/types';
import { activeLostReasons, isLostStageName } from '@/lib/enquiries/stagesStore';
import { SearchableSelect } from './SearchableSelect';

type Props = {
  stageName: string;
  reasons: LostReason[];
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  error?: string;
};

export const DynamicLostReasonSelect = memo(function DynamicLostReasonSelect({
  stageName,
  reasons,
  value,
  onChange,
  onClear,
  error,
}: Props) {
  const show = isLostStageName(stageName);

  const options = useMemo(
    () => activeLostReasons(reasons).map((r) => ({ value: r.name, label: r.name })),
    [reasons],
  );

  useEffect(() => {
    if (!show && value) onClear?.();
  }, [show, value, onClear]);

  if (!show) return null;

  return (
    <div className="ui-field">
      <label className="ui-label">Reason *</label>
      <SearchableSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Select lost reason"
        error={error}
        searchable
      />
    </div>
  );
});
