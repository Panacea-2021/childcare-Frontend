'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  ariaLabel = 'Search',
}: SearchBarProps) {
  return (
    <div className="pc-search">
      <Search size={16} className="pc-search-icon" aria-hidden />
      <input
        type="search"
        className="ui-input pc-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {value ? (
        <button
          type="button"
          className="pc-search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
