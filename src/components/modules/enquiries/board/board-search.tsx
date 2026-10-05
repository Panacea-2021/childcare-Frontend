'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { softInteractiveBtn } from '../animations';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const BoardSearch = memo(function BoardSearch({
  value,
  onChange,
  placeholder = 'Search by student or parent phone…',
}: Props) {
  return (
    <label className={`enq-search${value ? ' has-value' : ''}`}>
      <Search size={16} aria-hidden className="enq-search-icon" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search enquiries"
      />
      {value ? (
        <motion.button
          type="button"
          className="enq-search-clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
          {...softInteractiveBtn}
        >
          <X size={14} aria-hidden />
        </motion.button>
      ) : null}
    </label>
  );
});
