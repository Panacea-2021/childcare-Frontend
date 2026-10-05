'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { SearchBar } from '@/components/parent-communication/shared/SearchBar';
import { NOTE_CATEGORIES } from '@/lib/mock/mockNotes';
import type { NoteFilterState, NoteCategory } from '@/types/note';

interface NotesFiltersProps {
  filters: NoteFilterState;
  onChange: (next: NoteFilterState) => void;
}

export function NotesFilters({ filters, onChange }: NotesFiltersProps) {
  const set = <K extends keyof NoteFilterState>(key: K, value: NoteFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="notes-filters" aria-label="Filter notes">
      <SearchBar
        value={filters.search}
        onChange={(search) => set('search', search)}
        placeholder="Search student, parent, room, category…"
        ariaLabel="Search notes"
      />

      <div className="ui-field notes-filter-field">
        <label className="ui-label" htmlFor="notes-sort">
          Sort
        </label>
        <select
          id="notes-sort"
          className="ui-select"
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value as NoteFilterState['sort'])}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="ui-field notes-filter-field">
        <label className="ui-label" htmlFor="notes-read">
          Status
        </label>
        <select
          id="notes-read"
          className="ui-select"
          value={filters.readStatus}
          onChange={(e) => set('readStatus', e.target.value as NoteFilterState['readStatus'])}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="ui-field notes-filter-field">
        <label className="ui-label" htmlFor="notes-category">
          Category
        </label>
        <select
          id="notes-category"
          className="ui-select"
          value={filters.category}
          onChange={(e) => set('category', e.target.value as 'all' | NoteCategory)}
        >
          <option value="all">All categories</option>
          {NOTE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="ui-field notes-filter-field notes-filter-date">
        <label className="ui-label" htmlFor="notes-date">
          Date
        </label>
        <div className="notes-date-wrap">
          <Calendar size={15} className="notes-date-icon" aria-hidden />
          <input
            id="notes-date"
            type="date"
            className="ui-input"
            value={filters.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
