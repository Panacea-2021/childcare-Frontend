'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { MealsDecor } from './MealsDecor';
import { MealPlannerHeader } from './MealPlannerHeader';
import { MealPlannerTabs } from './MealPlannerTabs';
import { MealCalendarTab } from './MealCalendarTab';
import { FoodLibraryTab } from './FoodLibraryTab';
import { TemplatesTab } from './TemplatesTab';
import type {
  AddFoodTarget,
  CategoryFormState,
  ComboFormState,
  DayMealPlan,
  FoodCategory,
  FoodFormState,
  FoodItem,
  MealPlannerTabId,
  MealTemplate,
  TemplateFormState,
} from './types';
import { CATEGORY_BADGE } from './types';
import {
  addDays,
  buildSeedPlans,
  emptyDaySlots,
  getOrCreateDay,
  seedCategories,
  seedFoods,
  seedTemplates,
  startOfWeek,
  toISODate,
} from './mockData';
import '../calendar.css';
import '../holidays/staff-holidays.css';
import './meal-planner.css';
import '@/components/ui/module.css';

const AddFoodModal = dynamic(() => import('./AddFoodModal').then((m) => m.AddFoodModal), { ssr: false });
const FoodFormModal = dynamic(() => import('./FoodFormModal').then((m) => m.FoodFormModal), { ssr: false });
const CategoryModal = dynamic(() => import('./CategoryModal').then((m) => m.CategoryModal), { ssr: false });
const ComboModal = dynamic(() => import('./ComboModal').then((m) => m.ComboModal), { ssr: false });
const TemplateModal = dynamic(() => import('./TemplateModal').then((m) => m.TemplateModal), { ssr: false });

function upsertDay(list: DayMealPlan[], day: DayMealPlan): DayMealPlan[] {
  const idx = list.findIndex((p) => p.date === day.date);
  if (idx === -1) return [...list, day];
  const next = [...list];
  next[idx] = day;
  return next;
}

export function MealPlannerPage() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [tab, setTab] = useState<MealPlannerTabId>('meal-calendar');
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [categories, setCategories] = useState<FoodCategory[]>(seedCategories);
  const [foods, setFoods] = useState<FoodItem[]>(seedFoods);
  const [plans, setPlans] = useState<DayMealPlan[]>(() => buildSeedPlans(today));
  const [templates, setTemplates] = useState<MealTemplate[]>(seedTemplates);
  const [clipboardDate, setClipboardDate] = useState<string | null>(null);

  const [addTarget, setAddTarget] = useState<AddFoodTarget | null>(null);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null);
  const [viewFood, setViewFood] = useState<FoodItem | null>(null);

  const createFood = useCallback(async (form: FoodFormState) => {
    await new Promise((r) => setTimeout(r, 280));
    const item: FoodItem = {
      id: `food-${Date.now()}`,
      name: form.name,
      categoryId: form.categoryId,
      description: form.description || undefined,
      imageEmoji: form.imageEmoji,
      isCombo: false,
      hasAllergen: form.hasAllergen,
      createdAt: toISODate(new Date()),
      status: 'active',
    };
    setFoods((list) => [item, ...list]);
    if (!(form.categoryId in CATEGORY_BADGE)) {
      /* custom categories already in list */
    }
    return item;
  }, []);

  const submitFoodForm = useCallback(
    async (form: FoodFormState) => {
      await new Promise((r) => setTimeout(r, 280));
      if (editingFood) {
        setFoods((list) =>
          list.map((f) =>
            f.id === editingFood.id
              ? {
                  ...f,
                  name: form.name,
                  categoryId: form.categoryId,
                  description: form.description || undefined,
                  imageEmoji: form.imageEmoji,
                  hasAllergen: form.hasAllergen,
                }
              : f,
          ),
        );
      } else {
        await createFood(form);
      }
    },
    [editingFood, createFood],
  );

  const createFromCalendar = useCallback(
    async (form: FoodFormState) => {
      const item = await createFood(form);
      if (addTarget && item) {
        setPlans((list) => {
          const day = getOrCreateDay(list, addTarget.date);
          const slots = { ...day.slots };
          const ids = [...(slots[addTarget.slotId] ?? [])];
          if (!ids.includes(item.id)) ids.push(item.id);
          slots[addTarget.slotId] = ids;
          return upsertDay(list, { ...day, slots });
        });
      }
    },
    [addTarget, createFood],
  );

  const selectExistingFood = useCallback(
    (foodId: string) => {
      if (!addTarget) return;
      setPlans((list) => {
        const day = getOrCreateDay(list, addTarget.date);
        const slots = { ...day.slots };
        const ids = [...(slots[addTarget.slotId] ?? [])];
        if (!ids.includes(foodId)) ids.push(foodId);
        slots[addTarget.slotId] = ids;
        return upsertDay(list, { ...day, slots });
      });
      setAddTarget(null);
    },
    [addTarget],
  );

  const removeFoodFromSlot = useCallback((date: string, slotId: string, foodId: string) => {
    setPlans((list) => {
      const day = getOrCreateDay(list, date);
      const slots = { ...day.slots };
      slots[slotId] = (slots[slotId] ?? []).filter((id) => id !== foodId);
      return upsertDay(list, { ...day, slots });
    });
  }, []);

  const reorderFood = useCallback((date: string, slotId: string, from: number, to: number) => {
    setPlans((list) => {
      const day = getOrCreateDay(list, date);
      const slots = { ...day.slots };
      const ids = [...(slots[slotId] ?? [])];
      if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) return list;
      const [moved] = ids.splice(from, 1);
      ids.splice(to, 0, moved);
      slots[slotId] = ids;
      return upsertDay(list, { ...day, slots });
    });
  }, []);

  const clearDay = useCallback((date: string) => {
    setPlans((list) => upsertDay(list, { date, slots: emptyDaySlots() }));
  }, []);

  const copyDay = useCallback((date: string) => {
    setClipboardDate(date);
  }, []);

  const pasteDay = useCallback(
    (date: string) => {
      if (!clipboardDate) return;
      setPlans((list) => {
        const source = getOrCreateDay(list, clipboardDate);
        const cloned = {
          date,
          slots: Object.fromEntries(
            Object.entries(source.slots).map(([k, v]) => [k, [...v]]),
          ),
        };
        return upsertDay(list, cloned);
      });
    },
    [clipboardDate],
  );

  const duplicateWeek = useCallback((date: string) => {
    setPlans((list) => {
      const start = startOfWeek(new Date(date + 'T00:00:00'));
      let next = [...list];
      for (let i = 0; i < 7; i++) {
        const srcIso = toISODate(addDays(start, i));
        const dstIso = toISODate(addDays(start, i + 7));
        const source = getOrCreateDay(next, srcIso);
        next = upsertDay(next, {
          date: dstIso,
          slots: Object.fromEntries(Object.entries(source.slots).map(([k, v]) => [k, [...v]])),
        });
      }
      return next;
    });
  }, []);

  const submitCategory = useCallback(async (form: CategoryFormState) => {
    await new Promise((r) => setTimeout(r, 200));
    const id = `cat-${Date.now()}`;
    setCategories((list) => [...list, { id, name: form.name, icon: form.icon, color: form.color }]);
  }, []);

  const submitCombo = useCallback(async (form: ComboFormState) => {
    await new Promise((r) => setTimeout(r, 280));
    setFoods((list) => [
      {
        id: `combo-${Date.now()}`,
        name: form.name,
        categoryId: 'others',
        description: form.description || undefined,
        imageEmoji: '🍇',
        isCombo: true,
        comboItemIds: form.itemIds,
        hasAllergen: form.hasAllergen,
        createdAt: toISODate(new Date()),
        status: 'active',
      },
      ...list,
    ]);
  }, []);

  const submitTemplate = useCallback(
    async (form: TemplateFormState) => {
      await new Promise((r) => setTimeout(r, 280));
      if (editingTemplate) {
        setTemplates((list) =>
          list.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, name: form.name, description: form.description, sections: form.sections }
              : t,
          ),
        );
      } else {
        setTemplates((list) => [
          {
            id: `tpl-${Date.now()}`,
            name: form.name,
            description: form.description,
            sections: form.sections,
            createdAt: toISODate(new Date()),
          },
          ...list,
        ]);
      }
    },
    [editingTemplate],
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page cal-page mp-page">
          <div className="cal-ambient" aria-hidden>
            <span className="cal-blob b1" />
            <span className="cal-blob b2" />
            <span className="cal-blob b3" />
            <span className="cal-mesh" />
          </div>
          <MealsDecor />

          <div className="cal-page-inner">
            <MealPlannerHeader />
            <MealPlannerTabs active={tab} onChange={setTab} />

            <AnimatePresence mode="wait">
              <m.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {tab === 'meal-calendar' ? (
                  <MealCalendarTab
                    today={today}
                    viewMonth={viewMonth}
                    onMonthChange={setViewMonth}
                    plans={plans}
                    foods={foods}
                    onAddFood={setAddTarget}
                    onRemoveFood={removeFoodFromSlot}
                    onReorderFood={reorderFood}
                    onClearDay={clearDay}
                    onCopyDay={copyDay}
                    onPasteDay={pasteDay}
                    onDuplicateWeek={duplicateWeek}
                    clipboardDate={clipboardDate}
                  />
                ) : null}
                {tab === 'food-library' ? (
                  <FoodLibraryTab
                    foods={foods}
                    categories={categories}
                    onAddFood={() => {
                      setEditingFood(null);
                      setFoodModalOpen(true);
                    }}
                    onCreateCombo={() => setComboOpen(true)}
                    onEdit={(food) => {
                      setEditingFood(food);
                      setFoodModalOpen(true);
                    }}
                    onDuplicate={(food) => {
                      setFoods((list) => [
                        {
                          ...food,
                          id: `food-${Date.now()}`,
                          name: `${food.name} (Copy)`,
                          createdAt: toISODate(new Date()),
                        },
                        ...list,
                      ]);
                    }}
                    onArchive={(food) => {
                      setFoods((list) =>
                        list.map((f) =>
                          f.id === food.id
                            ? { ...f, status: f.status === 'archived' ? 'active' : 'archived' }
                            : f,
                        ),
                      );
                    }}
                    onDelete={(food) => {
                      setFoods((list) => list.filter((f) => f.id !== food.id));
                    }}
                    onView={setViewFood}
                  />
                ) : null}
                {tab === 'templates' ? (
                  <TemplatesTab
                    templates={templates}
                    onNew={() => {
                      setEditingTemplate(null);
                      setTemplateOpen(true);
                    }}
                    onEdit={(tpl) => {
                      setEditingTemplate(tpl);
                      setTemplateOpen(true);
                    }}
                    onDuplicate={(tpl) => {
                      setTemplates((list) => [
                        {
                          ...tpl,
                          id: `tpl-${Date.now()}`,
                          name: `${tpl.name} (Copy)`,
                          sections: tpl.sections.map((s) => ({ ...s })),
                          createdAt: toISODate(new Date()),
                        },
                        ...list,
                      ]);
                    }}
                    onDelete={(tpl) => setTemplates((list) => list.filter((t) => t.id !== tpl.id))}
                  />
                ) : null}
              </m.div>
            </AnimatePresence>
          </div>

          <AddFoodModal
            open={Boolean(addTarget)}
            foods={foods}
            categories={categories}
            onClose={() => setAddTarget(null)}
            onSelect={selectExistingFood}
            onCreate={createFromCalendar}
          />

          <FoodFormModal
            open={foodModalOpen}
            editing={editingFood}
            categories={categories}
            onClose={() => setFoodModalOpen(false)}
            onSubmit={submitFoodForm}
            onCreateCategory={() => setCategoryOpen(true)}
          />

          <CategoryModal open={categoryOpen} onClose={() => setCategoryOpen(false)} onSubmit={submitCategory} />

          <ComboModal open={comboOpen} foods={foods} onClose={() => setComboOpen(false)} onSubmit={submitCombo} />

          <TemplateModal
            open={templateOpen}
            editing={editingTemplate}
            onClose={() => setTemplateOpen(false)}
            onSubmit={submitTemplate}
          />

          {viewFood ? (
            <ViewFoodDialog food={viewFood} categories={categories} onClose={() => setViewFood(null)} />
          ) : null}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

function ViewFoodDialog({
  food,
  categories,
  onClose,
}: {
  food: FoodItem;
  categories: FoodCategory[];
  onClose: () => void;
}) {
  const cat = categories.find((c) => c.id === food.categoryId);
  return (
    <div className="mp-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="mp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={food.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-modal-header">
          <div>
            <h2>
              {food.imageEmoji} {food.name}
            </h2>
            <p>{cat ? `${cat.icon} ${cat.name}` : food.categoryId}</p>
          </div>
          <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="mp-modal-body">
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {food.description || 'No additional information.'}
          </p>
          <div className="mp-chips">
            <span className={`mp-yes-no${food.isCombo ? ' is-yes' : ' is-no'}`}>
              Combo: {food.isCombo ? 'Yes' : 'No'}
            </span>
            <span className={`mp-yes-no${food.hasAllergen ? ' is-yes' : ' is-no'}`}>
              Allergen: {food.hasAllergen ? 'Yes' : 'No'}
            </span>
            <span className={`mp-status${food.status === 'archived' ? ' is-archived' : ''}`}>
              <span className="mp-status-dot" />
              {food.status}
            </span>
          </div>
        </div>
        <div className="mp-modal-footer">
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
