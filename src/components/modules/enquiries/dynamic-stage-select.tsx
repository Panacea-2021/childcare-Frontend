'use client';

import { memo, useMemo } from 'react';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { activeStages } from '@/lib/enquiries/stagesStore';
import { SearchableSelect } from './SearchableSelect';
import { getStageIcon } from './stage-icon';

type Props = {
  stages: EnquiryStageConfig[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export const DynamicStageSelect = memo(function DynamicStageSelect({
  stages,
  value,
  onChange,
  error,
  placeholder = 'Select stage',
}: Props) {
  const options = useMemo(
    () =>
      activeStages(stages).map((s) => {
        const Icon = getStageIcon(s.icon);
        return {
          value: s.name,
          label: s.name,
          node: (
            <span className="enq-stage-option">
              <span
                className="enq-stage-option-dot"
                style={{ background: s.color }}
                aria-hidden
              />
              <Icon size={14} style={{ color: s.color }} aria-hidden />
              {s.name}
            </span>
          ),
        };
      }),
    [stages],
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
