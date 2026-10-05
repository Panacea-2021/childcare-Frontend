'use client';

import { useMemo, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  Archive,
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Eye,
} from 'lucide-react';
import type { FoodCategory, FoodItem } from './types';
import { CATEGORY_BADGE } from './types';
import { formatShortDate } from './mockData';

type Props = {
  foods: FoodItem[];
  categories: FoodCategory[];
  onAddFood: () => void;
  onCreateCombo: () => void;
  onEdit: (food: FoodItem) => void;
  onDuplicate: (food: FoodItem) => void;
  onArchive: (food: FoodItem) => void;
  onDelete: (food: FoodItem) => void;
  onView: (food: FoodItem) => void;
};

export function FoodLibraryTab({
  foods,
  categories,
  onAddFood,
  onCreateCombo,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onView,
}: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [combo, setCombo] = useState<'all' | 'yes' | 'no'>('all');
  const [allergen, setAllergen] = useState<'all' | 'yes' | 'no'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'archived'>('active');
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter((f) => {
      if (status !== 'all' && f.status !== status) return false;
      if (category !== 'all' && f.categoryId !== category) return false;
      if (combo === 'yes' && !f.isCombo) return false;
      if (combo === 'no' && f.isCombo) return false;
      if (allergen === 'yes' && !f.hasAllergen) return false;
      if (allergen === 'no' && f.hasAllergen) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q);
    });
  }, [foods, search, category, combo, allergen, status]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div
          className="sh-panel"
          role="tabpanel"
          id="mp-panel-food-library"
          aria-labelledby="mp-tab-food-library"
        >
          <div className="mp-section-head">
            <div>
              <h2>🥗 Food Library</h2>
              <p>Manage reusable food items, categories and combo meals.</p>
            </div>
            <div className="mp-section-actions">
              <m.button
                type="button"
                className="mp-btn-primary"
                onClick={onAddFood}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Food Item
              </m.button>
              <m.button
                type="button"
                className="mp-btn-ghost"
                onClick={onCreateCombo}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Create Combo
              </m.button>
            </div>
          </div>

          <div className="mp-filters-bar">
            <div className="mp-search-wrap" style={{ flex: '1 1 200px' }}>
              <Search size={14} aria-hidden />
              <input
                className="mp-search"
                style={{ width: '100%', minWidth: 180 }}
                type="search"
                placeholder="Search food…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search food"
              />
            </div>
            <select className="mp-filter" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter category">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className="mp-filter" value={combo} onChange={(e) => setCombo(e.target.value as typeof combo)} aria-label="Filter combo">
              <option value="all">Combo: All</option>
              <option value="yes">Combo: Yes</option>
              <option value="no">Combo: No</option>
            </select>
            <select
              className="mp-filter"
              value={allergen}
              onChange={(e) => setAllergen(e.target.value as typeof allergen)}
              aria-label="Filter allergen"
            >
              <option value="all">Allergen: All</option>
              <option value="yes">Allergen: Yes</option>
              <option value="no">Allergen: No</option>
            </select>
            <select
              className="mp-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              aria-label="Filter status"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="mp-empty">
              <m.div
                className="mp-empty-art"
                animate={{ y: [0, -5, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🧺
              </m.div>
              <h3>No food items added.</h3>
              <p>Start building your reusable food library for meal planning.</p>
              <button type="button" className="mp-btn-primary" onClick={onAddFood}>
                <Plus size={16} /> Add Food Item
              </button>
            </div>
          ) : (
            <>
              <div className="mp-table-card mp-table-desktop">
                <div className="mp-table-scroll">
                  <table className="mp-table ui-table" aria-label="Food library">
                    <thead>
                      <tr>
                        <th>Food Image</th>
                        <th>Food Name</th>
                        <th>Category</th>
                        <th>Combo</th>
                        <th>Allergen</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((food, i) => {
                        const badge = CATEGORY_BADGE[food.categoryId] ?? {
                          bg: '#F1F5F9',
                          fg: '#475569',
                          label: catName(food.categoryId),
                        };
                        return (
                          <m.tr
                            key={food.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          >
                            <td>
                              <span className="mp-food-avatar" aria-hidden>
                                {food.imageEmoji ?? '🍽️'}
                              </span>
                            </td>
                            <td>
                              <span className="mp-food-cell">{food.name}</span>
                            </td>
                            <td>
                              <span className="mp-cat-badge" style={{ background: badge.bg, color: badge.fg }}>
                                {badge.label}
                              </span>
                            </td>
                            <td>
                              <span className={`mp-yes-no${food.isCombo ? ' is-yes' : ' is-no'}`}>
                                {food.isCombo ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td>
                              <span className={`mp-yes-no${food.hasAllergen ? ' is-yes' : ' is-no'}`}>
                                {food.hasAllergen ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td>{formatShortDate(food.createdAt)}</td>
                            <td>
                              <span className={`mp-status${food.status === 'archived' ? ' is-archived' : ''}`}>
                                <span className="mp-status-dot" aria-hidden />
                                {food.status === 'active' ? 'Active' : 'Archived'}
                              </span>
                            </td>
                            <td>
                              <div className="mp-row-actions">
                                <button
                                  type="button"
                                  className="mp-icon-btn"
                                  aria-label={`Actions for ${food.name}`}
                                  aria-expanded={menuId === food.id}
                                  onClick={() => setMenuId(menuId === food.id ? null : food.id)}
                                >
                                  <MoreVertical size={15} />
                                </button>
                                {menuId === food.id ? (
                                  <ul className="mp-menu" role="menu">
                                    <li>
                                      <button type="button" role="menuitem" onClick={() => { onView(food); setMenuId(null); }}>
                                        <Eye size={14} /> View
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" role="menuitem" onClick={() => { onEdit(food); setMenuId(null); }}>
                                        <Pencil size={14} /> Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" role="menuitem" onClick={() => { onDuplicate(food); setMenuId(null); }}>
                                        <Copy size={14} /> Duplicate
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" role="menuitem" onClick={() => { onArchive(food); setMenuId(null); }}>
                                        <Archive size={14} /> Archive
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        className="is-danger"
                                        onClick={() => { onDelete(food); setMenuId(null); }}
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    </li>
                                  </ul>
                                ) : null}
                              </div>
                            </td>
                          </m.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mp-food-cards">
                {filtered.map((food) => {
                  const badge = CATEGORY_BADGE[food.categoryId] ?? CATEGORY_BADGE.others;
                  return (
                    <article key={food.id} className="mp-food-card">
                      <div className="mp-food-card-top">
                        <div className="mp-food-cell">
                          <span className="mp-food-avatar">{food.imageEmoji ?? '🍽️'}</span>
                          {food.name}
                        </div>
                        <span className={`mp-status${food.status === 'archived' ? ' is-archived' : ''}`}>
                          <span className="mp-status-dot" />
                          {food.status}
                        </span>
                      </div>
                      <div className="mp-chips">
                        <span className="mp-cat-badge" style={{ background: badge.bg, color: badge.fg }}>
                          {badge.label}
                        </span>
                        {food.isCombo ? <span className="mp-yes-no is-yes">Combo</span> : null}
                        {food.hasAllergen ? <span className="mp-yes-no is-yes">Allergen</span> : null}
                      </div>
                      <div className="mp-tpl-actions">
                        <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => onEdit(food)}>
                          Edit
                        </button>
                        <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => onDuplicate(food)}>
                          Duplicate
                        </button>
                        <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => onDelete(food)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
