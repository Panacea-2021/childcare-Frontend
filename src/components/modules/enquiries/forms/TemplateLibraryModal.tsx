'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Eye, Heart, Search, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { btnMotion, cardHover, staggerContainer, staggerItem } from './animations';
import { formatDateLabel } from './mockData';
import type { StudentTemplate, TemplateCategory } from './types';

type FilterTab = 'all' | 'recent' | 'favorites' | 'mine' | 'builtin';

type Props = {
  open: boolean;
  templates: StudentTemplate[];
  onClose: () => void;
  onUse: (tpl: StudentTemplate) => void;
  onPreview: (tpl: StudentTemplate) => void;
  onFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
};

const CATEGORIES: TemplateCategory[] = ['All', 'Events', 'Feedback', 'Operations', 'Documents', 'Attendance'];

export function TemplateLibraryModal({
  open,
  templates,
  onClose,
  onUse,
  onPreview,
  onFavorite,
  onDuplicate,
}: Props) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('All');
  const [tab, setTab] = useState<FilterTab>('all');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (tab === 'favorites' && !t.favorite) return false;
      if (tab === 'mine' && t.builtIn) return false;
      if (tab === 'builtin' && !t.builtIn) return false;
      if (tab === 'recent') {
        /* keep all; sorted below */
      }
      if (!query) return true;
      return (
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }).sort((a, b) => {
      if (tab === 'recent') return b.updatedAt.localeCompare(a.updatedAt);
      return a.title.localeCompare(b.title);
    });
  }, [templates, q, category, tab]);

  return (
    <Modal
      open={open}
      title="Template Library"
      subtitle="Browse student form templates"
      onClose={onClose}
      xl
      autoHeight
    >
      <div className="sf-tpl-toolbar">
        <label className="sf-tpl-search">
          <Search size={16} aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates…"
            aria-label="Search templates"
          />
        </label>
        <div className="sf-tpl-filters" role="tablist" aria-label="Template collections">
          {(
            [
              ['all', 'All'],
              ['recent', 'Recent'],
              ['favorites', 'Favorites'],
              ['mine', 'My Templates'],
              ['builtin', 'Built-in'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`sf-chip ${tab === id ? 'is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="sf-tpl-cats">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`sf-chip ${category === c ? 'is-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="sf-empty">No templates match your filters.</div>
      ) : (
        <motion.div className="sf-grid" variants={staggerContainer} initial="hidden" animate="show">
          {rows.map((tpl) => (
            <motion.article key={tpl.id} className="sf-tpl-card" variants={staggerItem} {...cardHover}>
              <div
                className="sf-tpl-thumb"
                style={{
                  background: `linear-gradient(135deg, hsl(${tpl.thumbnailHue} 70% 52%), hsl(${tpl.thumbnailHue + 40} 65% 42%))`,
                }}
              >
                <Sparkles size={18} />
                &nbsp;{tpl.category}
              </div>
              <div className="sf-tpl-body">
                <h4>{tpl.title}</h4>
                <p>{tpl.description}</p>
                <div className="sf-meta">
                  <span>{tpl.builtIn ? 'Built-in' : 'My Template'}</span>
                  <span>Updated {formatDateLabel(tpl.updatedAt)}</span>
                </div>
                <div className="sf-card-actions">
                  <motion.button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => onUse(tpl)}
                    {...btnMotion}
                  >
                    Use Template
                  </motion.button>
                  <button type="button" className="sf-icon-btn" aria-label="Preview" onClick={() => onPreview(tpl)}>
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    className={`sf-icon-btn ${tpl.favorite ? 'is-fav' : ''}`}
                    aria-label="Favorite"
                    onClick={() => onFavorite(tpl.id)}
                  >
                    <Heart size={15} fill={tpl.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" className="sf-icon-btn" aria-label="Duplicate" onClick={() => onDuplicate(tpl.id)}>
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </Modal>
  );
}
