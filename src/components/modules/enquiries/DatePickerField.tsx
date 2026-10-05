'use client';

import { memo } from 'react';
import { CalendarDays } from 'lucide-react';

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
};

export const DatePickerField = memo(function DatePickerField({
  id,
  value,
  onChange,
  error,
  min,
  max,
}: Props) {
  return (
    <div className="ui-field">
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="date"
          className="ui-input"
          value={value}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingRight: 40 }}
        />
        <CalendarDays
          size={16}
          aria-hidden
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
      </div>
      {error ? <p className="enq-error">{error}</p> : null}
    </div>
  );
});
