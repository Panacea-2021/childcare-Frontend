'use client';

import { memo } from 'react';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';

type Props = {
  stages: EnquiryStageConfig[];
  value: string;
  onChange: (stageName: string) => void;
  label?: string;
  id?: string;
};

export const StageSelector = memo(function StageSelector({
  stages,
  value,
  onChange,
  label = 'Change Stage',
  id = 'enq-stage-selector',
}: Props) {
  const active = stages.filter((s) => s.active).sort((a, b) => a.order - b.order);

  return (
    <div className="ui-field enq-stage-selector">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="ui-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {active.map((stage) => (
          <option key={stage.id} value={stage.name}>
            {stage.name}
          </option>
        ))}
      </select>
    </div>
  );
});
