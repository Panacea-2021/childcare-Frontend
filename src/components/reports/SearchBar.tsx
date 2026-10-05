'use client';

import { memo, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function SearchBarBase({
  value,
  onChange,
  placeholder = 'Search reports by name or category…',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="rp-search-wrap">
      <label className="rp-search">
        <Search size={18} strokeWidth={1.75} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search reports"
        />
        <span className="rp-kbd" aria-hidden>
          Ctrl + K
        </span>
      </label>
    </div>
  );
}

export const SearchBar = memo(SearchBarBase);
