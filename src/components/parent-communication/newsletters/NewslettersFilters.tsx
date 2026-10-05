'use client';

import { Search } from 'lucide-react';
import { NEWSLETTER_STAFF } from '@/lib/mock/mockNewsletters';
import type { NewsletterFilterState } from '@/types/newsletter';

type Props = {
  filters: NewsletterFilterState;
  onChange: (next: NewsletterFilterState) => void;
};

export function NewslettersFilters({ filters, onChange }: Props) {
  return (
    <section className="nl-filters" aria-label="Filter newsletters">
      <div className="ui-field nl-field">
        <label className="ui-label" htmlFor="nl-title">
          Filter by title
        </label>
        <div className="nl-search-wrap">
          <Search size={15} className="nl-search-icon" aria-hidden />
          <input
            id="nl-title"
            className="ui-input"
            type="search"
            placeholder="Search by title..."
            value={filters.title}
            onChange={(e) => onChange({ ...filters, title: e.target.value })}
          />
        </div>
      </div>

      <div className="ui-field nl-field">
        <label className="ui-label" htmlFor="nl-created-by">
          Created by
        </label>
        <select
          id="nl-created-by"
          className="ui-select"
          value={filters.createdBy}
          onChange={(e) => onChange({ ...filters, createdBy: e.target.value })}
          title={NEWSLETTER_STAFF.find((s) => s.id === filters.createdBy)?.name ?? 'Created by'}
        >
          {NEWSLETTER_STAFF.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="ui-field nl-field">
        <label className="ui-label" htmlFor="nl-status">
          Status
        </label>
        <select
          id="nl-status"
          className="ui-select"
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as NewsletterFilterState['status'],
            })
          }
          title="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="template">Templates</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
        </select>
      </div>
    </section>
  );
}
