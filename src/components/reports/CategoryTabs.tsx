'use client';

import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { ReportCategory, ReportCategoryId } from './data/reportCatalog';
import { REPORT_ICONS } from './reportIcons';

type Props = {
  categories: ReportCategory[];
  active: ReportCategoryId;
  counts: Partial<Record<ReportCategoryId, number>>;
  onChange: (id: ReportCategoryId) => void;
};

function CategoryTabsBase({ categories, active, counts, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  return (
    <div className="rp-category-scroll" ref={scrollerRef} role="tablist" aria-label="Report categories">
      {categories.map((cat) => {
        const Icon = cat.id === 'favorites' ? Star : REPORT_ICONS[cat.icon];
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`rp-pill${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(cat.id)}
            whileTap={{ scale: 0.97 }}
          >
            <Icon size={15} strokeWidth={isActive ? 2.25 : 1.75} fill={cat.id === 'favorites' && isActive ? 'currentColor' : 'none'} />
            {cat.id === 'favorites' ? `★ ${cat.label}` : cat.label}
            <span className="rp-pill-count">{counts[cat.id] ?? 0}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export const CategoryTabs = memo(CategoryTabsBase);
