'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Loader2, Plus, Search, X } from 'lucide-react';
import type { FoodCategory, FoodFormState, FoodItem } from './types';
import { CATEGORY_BADGE, FOOD_EMOJIS } from './types';
import { FREQUENT_FOOD_IDS, RECENT_FOOD_IDS } from './mockData';

type Mode = 'pick' | 'create';

type Props = {
  open: boolean;
  foods: FoodItem[];
  categories: FoodCategory[];
  onClose: () => void;
  onSelect: (foodId: string) => void;
  onCreate: (form: FoodFormState) => Promise<void> | void;
};

function emptyForm(): FoodFormState {
  return {
    name: '',
    categoryId: 'fruits',
    description: '',
    imageEmoji: '🍎',
    hasAllergen: false,
  };
}

export function AddFoodModal({ open, foods, categories, onClose, onSelect, onCreate }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('pick');
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [form, setForm] = useState<FoodFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'categoryId', string>>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setMode('pick');
    setQuery('');
    setCatFilter('all');
    setForm(emptyForm());
    setErrors({});
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const activeFoods = useMemo(
    () => foods.filter((f) => f.status === 'active'),
    [foods],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeFoods.filter((f) => {
      if (catFilter !== 'all' && f.categoryId !== catFilter) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q);
    });
  }, [activeFoods, query, catFilter]);

  const recent = useMemo(
    () => RECENT_FOOD_IDS.map((id) => activeFoods.find((f) => f.id === id)).filter(Boolean) as FoodItem[],
    [activeFoods],
  );

  const frequent = useMemo(
    () => FREQUENT_FOOD_IDS.map((id) => activeFoods.find((f) => f.id === id)).filter(Boolean) as FoodItem[],
    [activeFoods],
  );

  const favourites = useMemo(() => activeFoods.filter((f) => f.favourite), [activeFoods]);

  const validate = () => {
    const next: Partial<Record<'name' | 'categoryId', string>> = {};
    if (!form.name.trim()) next.name = 'Food name is required';
    if (!form.categoryId) next.categoryId = 'Category is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onCreate({ ...form, name: form.name.trim(), description: form.description.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open ? (
            <m.div
              className="mp-modal-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            >
              <m.div
                className="mp-modal mp-modal-wide"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mp-modal-header">
                  <div>
                    <h2 id={titleId}>{mode === 'pick' ? 'Add Food' : 'Create New Food'}</h2>
                    <p>
                      {mode === 'pick'
                        ? 'Search existing foods or create a new one'
                        : 'New food will appear in the Food Library'}
                    </p>
                  </div>
                  <m.button
                    type="button"
                    className="mp-modal-close"
                    aria-label="Close"
                    onClick={onClose}
                    whileHover={{ rotate: 90, scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X size={18} />
                  </m.button>
                </div>

                <div className="mp-modal-body">
                  {mode === 'pick' ? (
                    <>
                      <div className="mp-picker-split">
                        <button type="button" className="mp-btn-ghost" onClick={() => setMode('pick')} disabled>
                          Select Existing
                        </button>
                        <span className="mp-picker-or">OR</span>
                        <button type="button" className="mp-btn-primary" onClick={() => setMode('create')}>
                          <Plus size={14} aria-hidden />
                          Create New
                        </button>
                      </div>

                      <div className="mp-picker-search">
                        <Search size={16} aria-hidden />
                        <input
                          type="search"
                          placeholder="Search existing food…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          aria-label="Search existing food"
                          autoFocus
                        />
                      </div>

                      <div className="mp-cat-row" role="group" aria-label="Category filter">
                        <button
                          type="button"
                          className={`mp-cat-pill${catFilter === 'all' ? ' is-active' : ''}`}
                          onClick={() => setCatFilter('all')}
                        >
                          All
                        </button>
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`mp-cat-pill${catFilter === c.id ? ' is-active' : ''}`}
                            onClick={() => setCatFilter(c.id)}
                          >
                            {c.icon} {c.name}
                          </button>
                        ))}
                      </div>

                      {!query && favourites.length > 0 ? (
                        <div className="mp-picker-section">
                          <h4>Favourites</h4>
                          <div className="mp-picker-list">
                            {favourites.map((f) => (
                              <FoodPickRow key={f.id} food={f} onSelect={onSelect} />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {!query && recent.length > 0 ? (
                        <div className="mp-picker-section">
                          <h4>Recently Used</h4>
                          <div className="mp-picker-list">
                            {recent.map((f) => (
                              <FoodPickRow key={f.id} food={f} onSelect={onSelect} />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {!query && frequent.length > 0 ? (
                        <div className="mp-picker-section">
                          <h4>Frequently Used</h4>
                          <div className="mp-picker-list">
                            {frequent.map((f) => (
                              <FoodPickRow key={f.id} food={f} onSelect={onSelect} />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mp-picker-section">
                        <h4>{query ? 'Search Results' : 'All Foods'}</h4>
                        <div className="mp-picker-list">
                          {filtered.length === 0 ? (
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                              No foods match your search.
                            </p>
                          ) : (
                            filtered.map((f) => <FoodPickRow key={f.id} food={f} onSelect={onSelect} />)
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <button type="button" className="mp-btn-ghost" onClick={() => setMode('pick')}>
                        ← Back to search
                      </button>
                      <FoodFields
                        form={form}
                        setForm={setForm}
                        categories={categories}
                        errors={errors}
                        showCreateCategory={false}
                      />
                    </>
                  )}
                </div>

                <div className="mp-modal-footer">
                  <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  {mode === 'create' ? (
                    <m.button
                      type="button"
                      className="mp-btn-primary"
                      onClick={handleCreate}
                      disabled={saving}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Loader2 size={16} className="cal-spin" /> Saving…
                        </span>
                      ) : (
                        'Save'
                      )}
                    </m.button>
                  ) : null}
                </div>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}

function FoodPickRow({ food, onSelect }: { food: FoodItem; onSelect: (id: string) => void }) {
  const badge = CATEGORY_BADGE[food.categoryId] ?? CATEGORY_BADGE.others;
  return (
    <button type="button" className="mp-picker-item" onClick={() => onSelect(food.id)}>
      <span className="mp-food-avatar" aria-hidden>
        {food.imageEmoji ?? '🍽️'}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong>{food.name}</strong>
        <span>
          {badge.label}
          {food.isCombo ? ' · Combo' : ''}
          {food.hasAllergen ? ' · Allergen' : ''}
        </span>
      </span>
    </button>
  );
}

export function FoodFields({
  form,
  setForm,
  categories,
  errors,
  showCreateCategory,
  onCreateCategory,
}: {
  form: FoodFormState;
  setForm: React.Dispatch<React.SetStateAction<FoodFormState>>;
  categories: FoodCategory[];
  errors: Partial<Record<'name' | 'categoryId', string>>;
  showCreateCategory?: boolean;
  onCreateCategory?: () => void;
}) {
  return (
    <>
      <div className={`mp-field${errors.name ? ' has-error' : ''}`}>
        <label htmlFor="mp-food-name">
          <span className="mp-req">*</span> Food Name
        </label>
        <input
          id="mp-food-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Pancake"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="mp-field-error">{errors.name}</p> : null}
      </div>

      <div className={`mp-field${errors.categoryId ? ' has-error' : ''}`}>
        <label htmlFor="mp-food-cat">
          <span className="mp-req">*</span> Category
        </label>
        <select
          id="mp-food-cat"
          className="ui-select"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        {showCreateCategory && onCreateCategory ? (
          <button
            type="button"
            className="mp-btn-ghost"
            style={{ alignSelf: 'flex-start', minHeight: 34, marginTop: 4 }}
            onClick={onCreateCategory}
          >
            <Plus size={14} /> Create New Category
          </button>
        ) : null}
      </div>

      <div className="mp-field">
        <label htmlFor="mp-food-desc">Description (optional)</label>
        <textarea
          id="mp-food-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Additional information"
        />
      </div>

      <div className="mp-field">
        <span className="mp-label">Food Image (optional)</span>
        <div className="mp-emoji-picker" role="group" aria-label="Choose food emoji">
          {FOOD_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              className={`mp-emoji-btn${form.imageEmoji === em ? ' is-active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, imageEmoji: em }))}
              aria-label={`Select ${em}`}
              aria-pressed={form.imageEmoji === em}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      <label className="mp-check">
        <input
          type="checkbox"
          checked={form.hasAllergen}
          onChange={(e) => setForm((f) => ({ ...f, hasAllergen: e.target.checked }))}
        />
        Contains allergens
      </label>
    </>
  );
}
