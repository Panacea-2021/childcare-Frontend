export type MealPlannerTabId = 'meal-calendar' | 'food-library' | 'templates';

export type FoodCategoryId =
  | 'grains'
  | 'vegetables'
  | 'fruits'
  | 'milk'
  | 'meat'
  | 'meat-alternate'
  | 'allergens'
  | 'others';

export type MealSlotId =
  | 'breakfast'
  | 'am-snack'
  | 'lunch'
  | 'evening-snack'
  | 'late-snack'
  | string;

export type CalendarViewMode = 'month' | 'week' | 'list';

export type FoodStatus = 'active' | 'archived';

export type FoodCategory = {
  id: FoodCategoryId | string;
  name: string;
  icon: string;
  color: string;
};

export type FoodItem = {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  imageEmoji?: string;
  isCombo: boolean;
  comboItemIds?: string[];
  hasAllergen: boolean;
  createdAt: string;
  status: FoodStatus;
  favourite?: boolean;
};

export type MealSlotDef = {
  id: MealSlotId;
  name: string;
  icon: string;
  color: string;
  order: number;
};

export type DayMealPlan = {
  date: string; // YYYY-MM-DD
  slots: Record<string, string[]>; // slotId -> foodIds
};

export type MealTemplate = {
  id: string;
  name: string;
  description: string;
  sections: MealSlotDef[];
  createdAt: string;
};

export type FoodFormState = {
  name: string;
  categoryId: string;
  description: string;
  imageEmoji: string;
  hasAllergen: boolean;
};

export type ComboFormState = {
  name: string;
  description: string;
  itemIds: string[];
  hasAllergen: boolean;
};

export type CategoryFormState = {
  name: string;
  icon: string;
  color: string;
};

export type TemplateFormState = {
  name: string;
  description: string;
  sections: MealSlotDef[];
};

export type AddFoodTarget = {
  date: string;
  slotId: string;
};

export const DEFAULT_MEAL_SLOTS: MealSlotDef[] = [
  { id: 'breakfast', name: 'Breakfast', icon: '☀', color: '#F59E0B', order: 0 },
  { id: 'am-snack', name: 'AM Snack', icon: '🌤', color: '#4F9CF9', order: 1 },
  { id: 'lunch', name: 'Lunch', icon: '🍛', color: '#10B981', order: 2 },
  { id: 'evening-snack', name: 'Evening Snack', icon: '🍪', color: '#EC4899', order: 3 },
  { id: 'late-snack', name: 'Late Snack', icon: '🌙', color: '#8B5CF6', order: 4 },
];

export const BUILTIN_CATEGORIES: FoodCategory[] = [
  { id: 'grains', name: 'Grains', icon: '🌾', color: '#D97706' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥦', color: '#059669' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#EA580C' },
  { id: 'milk', name: 'Milk', icon: '🥛', color: '#2563EB' },
  { id: 'meat', name: 'Meat', icon: '🍗', color: '#DC2626' },
  { id: 'meat-alternate', name: 'Meat Alternate', icon: '🫘', color: '#7C3AED' },
  { id: 'allergens', name: 'Allergens', icon: '⚠️', color: '#DB2777' },
  { id: 'others', name: 'Others', icon: '🍽️', color: '#64748B' },
];

export const CATEGORY_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  grains: { bg: '#FEF3C7', fg: '#92400E', label: 'Grains' },
  vegetables: { bg: '#D1FAE5', fg: '#065F46', label: 'Vegetables' },
  fruits: { bg: '#FFEDD5', fg: '#9A3412', label: 'Fruits' },
  milk: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Milk' },
  meat: { bg: '#FEE2E2', fg: '#991B1B', label: 'Meat' },
  'meat-alternate': { bg: '#EDE9FE', fg: '#5B21B6', label: 'Meat Alternate' },
  allergens: { bg: '#FCE7F3', fg: '#9D174D', label: 'Allergens' },
  others: { bg: '#F1F5F9', fg: '#475569', label: 'Others' },
};

export const FOOD_EMOJIS = ['🍎', '🍌', '🥛', '🍞', '🍚', '🥕', '🥦', '🥪', '🧀', '🥚', '🍇', '🍊', '🍪', '🥣'];
