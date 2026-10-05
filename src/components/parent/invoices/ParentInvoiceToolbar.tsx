'use client';

import { Filter, Search, X } from 'lucide-react';
import type { ParentInvoiceFilter, ParentInvoiceSort } from './types';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: ParentInvoiceFilter;
  onFilterChange: (value: ParentInvoiceFilter) => void;
  sort: ParentInvoiceSort;
  onSortChange: (value: ParentInvoiceSort) => void;
  resultCount: number;
};

const FILTER_OPTIONS: { value: ParentInvoiceFilter; label: string }[] = [
  { value: 'all', label: 'All Invoices' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

const SORT_OPTIONS: { value: ParentInvoiceSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'amount-high', label: 'Highest Amount' },
  { value: 'amount-low', label: 'Lowest Amount' },
  { value: 'due-date', label: 'Due Date' },
];

export function ParentInvoiceToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: Props) {
  return (
    <div className="pi-toolbar">
      <div className="pi-search-wrap">
        <Search className="pi-search-ico" size={16} strokeWidth={2} aria-hidden />
        <input
          type="search"
          className="ui-input pi-search-input"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search invoices"
        />
        {search ? (
          <button
            type="button"
            className="pi-search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div className="pi-toolbar-controls">
        <div className="pi-control">
          <label className="pi-control-label" htmlFor="pi-filter">
            <Filter size={13} strokeWidth={2} aria-hidden />
            Filter
          </label>
          <select
            id="pi-filter"
            className="ui-select pi-select"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as ParentInvoiceFilter)}
            aria-label="Filter invoices"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pi-control">
          <label className="pi-control-label" htmlFor="pi-sort">
            Sort by
          </label>
          <select
            id="pi-sort"
            className="ui-select pi-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ParentInvoiceSort)}
            aria-label="Sort invoices"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <p className="pi-result-count" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'invoice' : 'invoices'}
        </p>
      </div>
    </div>
  );
}
