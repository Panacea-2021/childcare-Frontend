'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Star,
  Megaphone,
  Camera,
  Video,
  BookOpen,
  Apple,
  Bath,
  Hospital,
  Smile,
  Clock,
  FolderOpen,
  Moon,
  Siren,
  Milk,
  FlaskConical,
  Rainbow,
  Sparkles,
  PersonStanding,
  Bandage,
  PenTool,
  Theater,
  CircleDot,
  User,
  Blocks,
  Languages,
  Calculator,
  Music,
  Palette,
  Atom,
  Cpu,
  BookMarked,
  Flag,
  Trophy,
  Pill,
  Search,
  Paintbrush,
  Microscope,
  Leaf,
  Briefcase,
  Music2,
  Gamepad2,
  Check,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { ACTIVITY_TYPES } from '@/lib/mock/mockActivityTypes';
import type { ActivityCategoryName } from '@/types/activity';
import './activities.css';

export type ActivityCardOption = {
  id: string;
  name: string;
  category: ActivityCategoryName;
  iconName: string;
  color: string;
  bgColor: string;
};

/** Lucide icons referenced in mockActivityTypes */
export const ACTIVITY_ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Megaphone,
  Camera,
  Video,
  BookOpen,
  Apple,
  Bath,
  Hospital,
  Smile,
  Clock,
  FolderOpen,
  Moon,
  Siren,
  Milk,
  FlaskConical,
  Rainbow,
  Sparkles,
  PersonStanding,
  Bandage,
  PenTool,
  Theater,
  CircleDot,
  User,
  Blocks,
  Languages,
  Calculator,
  Music,
  Palette,
  Atom,
  Cpu,
  BookMarked,
  Flag,
  Trophy,
  Pill,
  Search,
  Paintbrush,
  Microscope,
  Leaf,
  Briefcase,
  Music2,
  Gamepad2,
};

const PAGE_SIZES = [10, 20, 30] as const;
const ease = [0.22, 1, 0.36, 1] as const;

const CATEGORIES: Array<'All' | ActivityCategoryName> = [
  'All',
  'Communication',
  'Care & Health',
  'Learning & Development',
  'Creative & Play',
];

function toCardOption(type: (typeof ACTIVITY_TYPES)[number]): ActivityCardOption {
  return {
    id: type.id,
    name: type.name,
    category: type.category,
    iconName: type.icon,
    color: type.color,
    bgColor: type.bgColor,
  };
}

interface ActivitySelectorProps {
  selectedId: string | null;
  onSelect: (opt: ActivityCardOption) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedId,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20);

  const options = useMemo(() => ACTIVITY_TYPES.map(toCardOption), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((opt) => {
      if (category !== 'All' && opt.category !== category) return false;
      if (!q) return true;
      return (
        opt.name.toLowerCase().includes(q) ||
        opt.category.toLowerCase().includes(q)
      );
    });
  }, [options, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, category, pageSize]);

  return (
    <div className="act-step act-selector-step">
      <div className="act-audience-header act-selector-head">
        <div className="act-selector-head-copy">
          <span className="act-step-kicker">Step 1</span>
          <h4 className="act-step-title">Select Activity</h4>
        </div>
        <span className="act-results-count">
          <strong>{filtered.length}</strong>
          {filtered.length === 1 ? ' activity' : ' activities'}
          {category !== 'All' || query ? ` of ${ACTIVITY_TYPES.length}` : ''}
        </span>
      </div>

      <div className="act-filter-field act-search-box act-selector-search">
        <Search size={16} className="act-search-icon" aria-hidden />
        <input
          type="text"
          className="act-search-input"
          placeholder="Search activities by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search activities"
        />
      </div>

      <div className="act-category-chips" role="tablist" aria-label="Activity categories">
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              className={`act-category-chip${active ? ' is-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <motion.div
        className="act-type-grid"
        key={`${category}-${pageSafe}-${pageSize}-${query}`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 },
          },
        }}
      >
        <AnimatePresence mode="popLayout">
          {paged.map((opt) => {
            const isSelected = selectedId === opt.id;
            const Icon = ACTIVITY_ICON_MAP[opt.iconName] ?? Star;

            return (
              <motion.button
                key={opt.id}
                type="button"
                layout
                variants={{
                  hidden: { opacity: 0, y: 12, scale: 0.97 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.32, ease },
                  },
                }}
                whileHover={{ y: -3, scale: isSelected ? 1.01 : 1.02 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSelect(opt)}
                className={`act-type-card${isSelected ? ' act-type-card-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="act-type-card-shine" aria-hidden />
                <div
                  className="act-type-icon"
                  style={
                    isSelected
                      ? undefined
                      : { background: opt.bgColor, color: opt.color }
                  }
                >
                  <Icon size={20} strokeWidth={2.25} />
                </div>

                <div className="act-type-copy">
                  <p className="act-type-name">{opt.name}</p>
                  <p className="act-type-category">{opt.category}</p>
                </div>

                {isSelected ? (
                  <motion.div
                    className="act-type-check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                ) : null}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="act-empty-desc act-selector-empty">No activities match your search.</p>
      ) : (
        <div className="act-selector-pagination">
          <div className="act-selector-page-size">
            <span className="act-selector-page-label">Rows</span>
            <select
              className="act-selector-page-select"
              value={pageSize}
              onChange={(e) =>
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])
              }
              aria-label="Activities per page"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <span className="act-selector-page-meta">
              {filtered.length === 0
                ? '0-0 of 0'
                : `${(pageSafe - 1) * pageSize + 1}-${Math.min(pageSafe * pageSize, filtered.length)} of ${filtered.length}`}
            </span>
          </div>
          <div className="act-selector-pager" role="navigation" aria-label="Activity pages">
            <button
              type="button"
              className="act-selector-page-btn"
              disabled={pageSafe <= 1}
              onClick={() => setPage(pageSafe - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} strokeWidth={2.25} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - pageSafe) <= 1;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const gap = prev && p - prev > 1;
                return (
                  <span key={p} className="act-selector-page-chunk">
                    {gap ? <span className="act-selector-ellipsis">…</span> : null}
                    <button
                      type="button"
                      className={`act-selector-page-btn${p === pageSafe ? ' is-active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-current={p === pageSafe ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
            <button
              type="button"
              className="act-selector-page-btn"
              disabled={pageSafe >= totalPages}
              onClick={() => setPage(pageSafe + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
