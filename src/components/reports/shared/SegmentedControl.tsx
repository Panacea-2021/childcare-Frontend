'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

export type SegmentOption<T extends string = string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  ariaLabel?: string;
  name?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  name,
}: Props<T>) {
  const reactId = useId();
  const groupName = name ?? `segment-${reactId}`;
  const indicatorId = `seg-indicator-${reactId}`;

  return (
    <div className="asr-segment-wrap">
      {label ? <div className="ui-label">{label}</div> : null}
      <div className="asr-segment" role="radiogroup" aria-label={ariaLabel ?? label}>
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <label
              key={opt.id}
              className={`asr-segment-opt${active ? ' is-on' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                checked={active}
                onChange={() => onChange(opt.id)}
              />
              {active ? (
                <motion.span
                  layoutId={indicatorId}
                  className="asr-segment-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  aria-hidden
                />
              ) : null}
              <span className="asr-segment-label">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
