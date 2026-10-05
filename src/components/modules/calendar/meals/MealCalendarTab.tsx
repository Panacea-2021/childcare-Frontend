'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ClipboardPaste,
  Eraser,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from 'lucide-react';
import type {
  AddFoodTarget,
  CalendarViewMode,
  DayMealPlan,
  FoodItem,
  MealSlotDef,
} from './types';
import { CATEGORY_BADGE, DEFAULT_MEAL_SLOTS } from './types';
import {
  addDays,
  buildMonthCells,
  emptyDaySlots,
  formatShortDate,
  getOrCreateDay,
  monthTitle,
  parseISODate,
  sameDay,
  startOfWeek,
  toISODate,
} from './mockData';

type Props = {
  today: Date;
  viewMonth: Date;
  onMonthChange: (d: Date) => void;
  plans: DayMealPlan[];
  foods: FoodItem[];
  slots?: MealSlotDef[];
  onAddFood: (target: AddFoodTarget) => void;
  onRemoveFood: (date: string, slotId: string, foodId: string) => void;
  onReorderFood: (date: string, slotId: string, from: number, to: number) => void;
  onClearDay: (date: string) => void;
  onCopyDay: (date: string) => void;
  onPasteDay: (date: string) => void;
  onDuplicateWeek: (date: string) => void;
  clipboardDate: string | null;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MealCalendarTab({
  today,
  viewMonth,
  onMonthChange,
  plans,
  foods,
  slots = DEFAULT_MEAL_SLOTS,
  onAddFood,
  onRemoveFood,
  onReorderFood,
  onClearDay,
  onCopyDay,
  onPasteDay,
  onDuplicateWeek,
  clipboardDate,
}: Props) {
  const [view, setView] = useState<CalendarViewMode>('month');
  const [selectedIso, setSelectedIso] = useState(toISODate(today));
  const [searchDate, setSearchDate] = useState('');
  const [mealFilter, setMealFilter] = useState<string>('all');
  const [dragChip, setDragChip] = useState<{ slotId: string; index: number } | null>(null);

  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const todayIso = toISODate(today);

  const weekDays = useMemo(() => {
    const start = startOfWeek(parseISODate(selectedIso));
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedIso]);

  const listDays = useMemo(() => {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const out: Date[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) out.push(new Date(d));
    return out;
  }, [viewMonth]);

  const selectedPlan = getOrCreateDay(plans, selectedIso);
  const hasAnyMeals = plans.some((p) => Object.values(p.slots).some((ids) => ids.length > 0));

  const goToday = () => {
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedIso(todayIso);
  };

  const goPrev = () => {
    if (view === 'week') {
      const d = addDays(parseISODate(selectedIso), -7);
      setSelectedIso(toISODate(d));
      onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      onMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
    }
  };

  const goNext = () => {
    if (view === 'week') {
      const d = addDays(parseISODate(selectedIso), 7);
      setSelectedIso(toISODate(d));
      onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      onMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
    }
  };

  const onSearchDate = (value: string) => {
    setSearchDate(value);
    if (!value) return;
    const d = parseISODate(value);
    setSelectedIso(value);
    onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const visibleSlots = mealFilter === 'all' ? slots : slots.filter((s) => s.id === mealFilter);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div
          className="sh-panel"
          role="tabpanel"
          id="mp-panel-meal-calendar"
          aria-labelledby="mp-tab-meal-calendar"
        >
          <div className="mp-controls">
            <div className="mp-controls-left">
              <button type="button" className="mp-today-btn" onClick={goToday}>
                Today
              </button>
              <div className="mp-nav-btns" role="group" aria-label="Calendar navigation">
                <button type="button" className="mp-nav-btn" aria-label="Previous" onClick={goPrev}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="mp-nav-btn" aria-label="Next" onClick={goNext}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="mp-month-label" aria-live="polite">
                {view === 'week'
                  ? `Week of ${formatShortDate(toISODate(weekDays[0]))}`
                  : monthTitle(viewMonth)}
              </div>
            </div>
            <div className="mp-controls-right">
              <div className="mp-view-toggle" role="group" aria-label="Calendar view">
                {(['month', 'week', 'list'] as CalendarViewMode[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`mp-view-btn${view === v ? ' is-active' : ''}`}
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                  >
                    {v[0].toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <div className="mp-search-wrap">
                <Search size={14} aria-hidden />
                <input
                  className="mp-search"
                  type="date"
                  value={searchDate}
                  onChange={(e) => onSearchDate(e.target.value)}
                  aria-label="Search date"
                />
              </div>
              <div className="mp-filter-wrap">
                <MoreHorizontal size={14} aria-hidden style={{ position: 'absolute', left: 10, pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                <select
                  className="mp-filter"
                  value={mealFilter}
                  onChange={(e) => setMealFilter(e.target.value)}
                  aria-label="Filter meal type"
                >
                  <option value="all">All meals</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!hasAnyMeals ? (
            <div className="mp-empty">
              <m.div
                className="mp-empty-art"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                👨‍🍳
              </m.div>
              <h3>No meals planned yet.</h3>
              <p>Select a day and add nutritious foods to each meal slot.</p>
            </div>
          ) : null}

          {view === 'month' ? (
            <>
              <m.div
                className="mp-month-grid"
                key={monthTitle(viewMonth)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
              >
                {WEEKDAYS.map((d) => (
                  <div key={d} className="mp-weekday">
                    {d}
                  </div>
                ))}
                {cells.map((cell) => {
                  const plan = getOrCreateDay(plans, cell.iso);
                  const isToday = cell.iso === todayIso;
                  const isSelected = cell.iso === selectedIso;
                  return (
                    <m.button
                      key={cell.iso}
                      type="button"
                      className={`mp-day-card${cell.inMonth ? '' : ' is-outside'}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                      onClick={() => setSelectedIso(cell.iso)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`${formatShortDate(cell.iso)}${isToday ? ', today' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <div className="mp-day-num">
                        <strong>{cell.date.getDate()}</strong>
                      </div>
                      <div className="mp-day-mini">
                        {visibleSlots.map((slot) => {
                          const ids = plan.slots[slot.id] ?? [];
                          if (!ids.length) return null;
                          const first = foodMap.get(ids[0]);
                          return (
                            <div key={slot.id} className="mp-slot-mini">
                              <span className="mp-slot-mini-label" aria-hidden>
                                {slot.icon}
                              </span>
                              <div className="mp-slot-dots">
                                {ids.slice(0, 3).map((id) => (
                                  <span
                                    key={id}
                                    className="mp-dot"
                                    style={{ background: slot.color }}
                                    title={foodMap.get(id)?.name}
                                  />
                                ))}
                                {first ? (
                                  <span className="mp-dot-label">
                                    {first.name}
                                    {ids.length > 1 ? ` +${ids.length - 1}` : ''}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </m.button>
                  );
                })}
              </m.div>
              <div className="mp-list mp-month-mobile-list" aria-label="Month days">
                {listDays.map((d) => {
                  const iso = toISODate(d);
                  const plan = getOrCreateDay(plans, iso);
                  return (
                    <button
                      key={`m-${iso}`}
                      type="button"
                      className={`mp-list-row${iso === selectedIso ? ' is-selected' : ''}`}
                      onClick={() => setSelectedIso(iso)}
                    >
                      <div className="mp-list-date">
                        {formatShortDate(iso)}
                        <span>{sameDay(d, today) ? 'Today' : WEEKDAYS[d.getDay()]}</span>
                      </div>
                      <DaySlotsCompact plan={plan} slots={visibleSlots} foodMap={foodMap} />
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {view === 'week' ? (
            <div className="mp-week-grid">
              {weekDays.map((d) => {
                const iso = toISODate(d);
                const plan = getOrCreateDay(plans, iso);
                return (
                  <m.button
                    key={iso}
                    type="button"
                    className={`mp-day-card${iso === todayIso ? ' is-today' : ''}${iso === selectedIso ? ' is-selected' : ''}`}
                    style={{ minHeight: 140 }}
                    onClick={() => setSelectedIso(iso)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="mp-day-num">
                      <strong>
                        {WEEKDAYS[d.getDay()]} {d.getDate()}
                      </strong>
                    </div>
                    <DaySlotsCompact plan={plan} slots={visibleSlots} foodMap={foodMap} />
                  </m.button>
                );
              })}
            </div>
          ) : null}

          {view === 'list' ? (
            <div className="mp-list">
              {listDays.map((d) => {
                const iso = toISODate(d);
                const plan = getOrCreateDay(plans, iso);
                const count = Object.values(plan.slots).reduce((n, ids) => n + ids.length, 0);
                return (
                  <m.button
                    key={iso}
                    type="button"
                    className="mp-list-row"
                    onClick={() => setSelectedIso(iso)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="mp-list-date">
                      {formatShortDate(iso)}
                      <span>{sameDay(d, today) ? 'Today' : WEEKDAYS[d.getDay()]}</span>
                    </div>
                    <div className="mp-chips">
                      {count === 0 ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No meals</span>
                      ) : (
                        visibleSlots.flatMap((slot) =>
                          (plan.slots[slot.id] ?? []).map((id) => {
                            const food = foodMap.get(id);
                            if (!food) return null;
                            return (
                              <span
                                key={`${slot.id}-${id}`}
                                className="mp-chip"
                                style={{
                                  background: (CATEGORY_BADGE[food.categoryId] ?? CATEGORY_BADGE.others).bg,
                                  color: (CATEGORY_BADGE[food.categoryId] ?? CATEGORY_BADGE.others).fg,
                                }}
                              >
                                {food.imageEmoji} {food.name}
                              </span>
                            );
                          }),
                        )
                      )}
                    </div>
                  </m.button>
                );
              })}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <m.section
              key={selectedIso}
              className="mp-day-detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              aria-label={`Meals for ${formatShortDate(selectedIso)}`}
            >
              <div className="mp-day-detail-head">
                <h3>
                  {formatShortDate(selectedIso)}
                  {selectedIso === todayIso ? ' · Today' : ''}
                </h3>
                <div className="mp-day-actions">
                  <button type="button" className="mp-btn-ghost" style={{ minHeight: 36 }} onClick={() => onCopyDay(selectedIso)}>
                    <Copy size={14} /> Copy day
                  </button>
                  <button
                    type="button"
                    className="mp-btn-ghost"
                    style={{ minHeight: 36 }}
                    onClick={() => onPasteDay(selectedIso)}
                    disabled={!clipboardDate}
                    title={clipboardDate ? `Paste from ${clipboardDate}` : 'Copy a day first'}
                  >
                    <ClipboardPaste size={14} /> Paste
                  </button>
                  <button type="button" className="mp-btn-ghost" style={{ minHeight: 36 }} onClick={() => onDuplicateWeek(selectedIso)}>
                    <Copy size={14} /> Duplicate week
                  </button>
                  <button type="button" className="mp-btn-ghost" style={{ minHeight: 36 }} onClick={() => onClearDay(selectedIso)}>
                    <Eraser size={14} /> Clear day
                  </button>
                </div>
              </div>

              <div className="mp-slots">
                {visibleSlots.map((slot) => {
                  const ids = selectedPlan.slots[slot.id] ?? [];
                  return (
                    <div key={slot.id} className="mp-slot">
                      <div className="mp-slot-head">
                        <div className="mp-slot-title">
                          <span className="mp-slot-icon" style={{ background: `${slot.color}22` }}>
                            {slot.icon}
                          </span>
                          {slot.name}
                        </div>
                      </div>
                      <div className="mp-chips">
                        <AnimatePresence initial={false}>
                          {ids.map((id, index) => {
                            const food = foodMap.get(id);
                            if (!food) return null;
                            const badge = CATEGORY_BADGE[food.categoryId] ?? CATEGORY_BADGE.others;
                            return (
                              <m.span
                                key={`${id}-${index}`}
                                className="mp-chip"
                                style={{ background: badge.bg, color: badge.fg }}
                                layout
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ y: -2 }}
                                draggable
                                onDragStart={() => setDragChip({ slotId: slot.id, index })}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (dragChip && dragChip.slotId === slot.id) {
                                    onReorderFood(selectedIso, slot.id, dragChip.index, index);
                                  }
                                  setDragChip(null);
                                }}
                              >
                                <span aria-hidden>{food.imageEmoji ?? '🍽️'}</span>
                                {food.name}
                                <button
                                  type="button"
                                  className="mp-chip-remove"
                                  aria-label={`Remove ${food.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFood(selectedIso, slot.id, id);
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </m.span>
                            );
                          })}
                        </AnimatePresence>
                        <button
                          type="button"
                          className="mp-add-slot"
                          onClick={() => onAddFood({ date: selectedIso, slotId: slot.id })}
                        >
                          <Plus size={12} /> Add Food
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </m.section>
          </AnimatePresence>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

function DaySlotsCompact({
  plan,
  slots,
  foodMap,
}: {
  plan: DayMealPlan;
  slots: MealSlotDef[];
  foodMap: Map<string, FoodItem>;
}) {
  return (
    <div className="mp-day-mini">
      {slots.map((slot) => {
        const ids = plan.slots[slot.id] ?? [];
        if (!ids.length) return null;
        return (
          <div key={slot.id} className="mp-slot-mini">
            <span className="mp-slot-mini-label">{slot.icon}</span>
            <span className="mp-dot-label">
              {ids
                .map((id) => foodMap.get(id)?.name)
                .filter(Boolean)
                .slice(0, 2)
                .join(', ')}
              {ids.length > 2 ? ` +${ids.length - 2}` : ''}
            </span>
          </div>
        );
      })}
      {!Object.values(plan.slots).some((x) => x.length) ? (
        <span className="mp-dot-label">Empty</span>
      ) : null}
    </div>
  );
}

export { emptyDaySlots };
