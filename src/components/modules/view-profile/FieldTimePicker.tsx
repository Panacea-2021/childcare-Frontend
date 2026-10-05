'use client';

import { Clock3 } from 'lucide-react';
import './field-picker.css';

type Props = {
  id?: string;
  value: string; // HH:mm
  onChange: (value: string) => void;
  ariaLabel?: string;
};

export function FieldTimePicker({ id, value, onChange, ariaLabel }: Props) {
  return (
    <div className="vp-fp-timeWrap">
      <input
        id={id}
        className="vp-fp-timeInput"
        type="time"
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="vp-fp-timeIcon" aria-hidden>
        <Clock3 size={18} strokeWidth={2.1} />
      </span>
    </div>
  );
}
