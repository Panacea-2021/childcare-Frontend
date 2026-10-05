'use client';

import { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, RotateCcw } from 'lucide-react';
import type { EnquiryFilters, EnquiryViewMode, ListColumnKey, EnquiryRecord } from '../types';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { BoardSearch } from './board-search';
import { ViewModeToggle } from './board-header';
import { FACULTY_OPTIONS, PROGRAM_OPTIONS } from '../mockData';
import { ImportDropdown } from '../import-dropdown';
import { ExportDropdown } from '../export-dropdown';
import { ColumnsDropdown } from '../columns-dropdown';
import { interactiveBtn } from '../animations';


type Props = {
  filters: EnquiryFilters;
  stages: EnquiryStageConfig[];
  sources: string[];
  viewMode: EnquiryViewMode;
  visibleColumns: Record<ListColumnKey, boolean>;
  currentViewItems: EnquiryRecord[];
  filteredItems: EnquiryRecord[];
  allItems: EnquiryRecord[];
  onChange: (next: Partial<EnquiryFilters>) => void;
  onReset: () => void;
  onViewModeChange: (mode: EnquiryViewMode) => void;
  onColumnsChange: (next: Record<ListColumnKey, boolean>) => void;
  onImport: () => void;
  onAdd: () => void;
};

export const BoardFilters = memo(function BoardFilters({
  filters,
  stages,
  sources,
  viewMode,
  visibleColumns,
  currentViewItems,
  filteredItems,
  allItems,
  onChange,
  onReset,
  onViewModeChange,
  onColumnsChange,
  onImport,
  onAdd,
}: Props) {
  const activeStages = stages.filter((s) => s.active).sort((a, b) => a.order - b.order);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const openPicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.focus();
    }
  };

  return (
    <div className="enq-toolbar enq-board-toolbar enq-main-toolbar">
      <div className="enq-toolbar-cluster enq-toolbar-filters">
        <BoardSearch
          value={filters.search}
          onChange={(search) => onChange({ search })}
        />

        <select
          className="ui-filter enq-filter-control"
          value={filters.stage}
          onChange={(e) => onChange({ stage: e.target.value as EnquiryFilters['stage'] })}
          aria-label="Filter by stage"
        >
          <option value="All">All stages</option>
          {activeStages.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="ui-filter enq-filter-control"
          value={filters.assignedTo}
          onChange={(e) => onChange({ assignedTo: e.target.value })}
          aria-label="Filter by assigned faculty"
        >
          <option value="All">All faculty</option>
          {FACULTY_OPTIONS.map((f) => (
            <option key={f.id} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>

        <select
          className="ui-filter enq-filter-control"
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value })}
          aria-label="Filter by source"
        >
          <option value="All">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="ui-filter enq-filter-control"
          value={filters.program}
          onChange={(e) => onChange({ program: e.target.value })}
          aria-label="Filter by program"
        >
          <option value="All">All programs</option>
          {PROGRAM_OPTIONS.map((p) => (
            <option key={p.value} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="enq-date-filter enq-date-filter-interactive">
          <span>From</span>
          <div className="enq-date-wrap">
            <input
              ref={fromRef}
              type="date"
              className="ui-input"
              value={filters.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              aria-label="Created from date"
            />
            <button
              type="button"
              className="enq-date-icon-btn"
              aria-label="Open from date calendar"
              onClick={() => openPicker(fromRef.current)}
            >
              <CalendarDays size={15} aria-hidden />
            </button>
          </div>
        </label>

        <label className="enq-date-filter enq-date-filter-interactive">
          <span>To</span>
          <div className="enq-date-wrap">
            <input
              ref={toRef}
              type="date"
              className="ui-input"
              value={filters.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              aria-label="Created to date"
            />
            <button
              type="button"
              className="enq-date-icon-btn"
              aria-label="Open to date calendar"
              onClick={() => openPicker(toRef.current)}
            >
              <CalendarDays size={15} aria-hidden />
            </button>
          </div>
        </label>

        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-reset-btn enq-interactive-btn"
          onClick={onReset}
          {...interactiveBtn}
        >
          <RotateCcw size={15} aria-hidden />
          Reset
        </motion.button>
      </div>

      <div className="enq-toolbar-cluster enq-toolbar-actions">
        <ImportDropdown onImportEnquiries={onImport} />
        <ExportDropdown
          currentViewItems={currentViewItems}
          filteredItems={filteredItems}
          allItems={allItems}
        />
        <ViewModeToggle mode={viewMode} onModeChange={onViewModeChange} />
        <ColumnsDropdown
          visible={visibleColumns}
          onChange={onColumnsChange}
        />
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary enq-interactive-btn"
          onClick={onAdd}
          {...interactiveBtn}
        >
          <Plus size={16} aria-hidden />
          Add Enquiry
        </motion.button>
      </div>
    </div>
  );
});
