import type {
  DayMealPlan,
  FoodCategory,
  FoodItem,
  MealTemplate,
} from './types';
import { BUILTIN_CATEGORIES, DEFAULT_MEAL_SLOTS } from './types';

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function monthTitle(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatShortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export type MonthCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
};

export function buildMonthCells(viewMonth: Date): MonthCell[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    cells.push({
      date,
      iso: toISODate(date),
      inMonth: date.getMonth() === month,
    });
  }
  return cells;
}

export function emptyDaySlots(): Record<string, string[]> {
  return Object.fromEntries(DEFAULT_MEAL_SLOTS.map((s) => [s.id, []]));
}

export function getOrCreateDay(plans: DayMealPlan[], iso: string): DayMealPlan {
  const existing = plans.find((p) => p.date === iso);
  if (existing) return existing;
  return { date: iso, slots: emptyDaySlots() };
}

export const seedCategories: FoodCategory[] = [...BUILTIN_CATEGORIES];

export const seedFoods: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Pancake',
    categoryId: 'grains',
    description: 'Soft whole-wheat pancakes',
    imageEmoji: '🥞',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-01',
    status: 'active',
    favourite: true,
  },
  {
    id: 'food-2',
    name: 'Milk',
    categoryId: 'milk',
    description: 'Fresh whole milk',
    imageEmoji: '🥛',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-01',
    status: 'active',
    favourite: true,
  },
  {
    id: 'food-3',
    name: 'Banana',
    categoryId: 'fruits',
    imageEmoji: '🍌',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-02',
    status: 'active',
    favourite: true,
  },
  {
    id: 'food-4',
    name: 'Apple',
    categoryId: 'fruits',
    imageEmoji: '🍎',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-02',
    status: 'active',
  },
  {
    id: 'food-5',
    name: 'Rice',
    categoryId: 'grains',
    imageEmoji: '🍚',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-03',
    status: 'active',
  },
  {
    id: 'food-6',
    name: 'Dal',
    categoryId: 'meat-alternate',
    description: 'Yellow lentil curry',
    imageEmoji: '🥣',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-03',
    status: 'active',
  },
  {
    id: 'food-7',
    name: 'Mixed Vegetables',
    categoryId: 'vegetables',
    imageEmoji: '🥗',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-04',
    status: 'active',
  },
  {
    id: 'food-8',
    name: 'Sandwich',
    categoryId: 'grains',
    imageEmoji: '🥪',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-05',
    status: 'active',
  },
  {
    id: 'food-9',
    name: 'Carrot Sticks',
    categoryId: 'vegetables',
    imageEmoji: '🥕',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-06',
    status: 'active',
  },
  {
    id: 'food-10',
    name: 'Yogurt',
    categoryId: 'milk',
    imageEmoji: '🍦',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-07',
    status: 'active',
  },
  {
    id: 'food-11',
    name: 'Orange',
    categoryId: 'fruits',
    imageEmoji: '🍊',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-08',
    status: 'active',
  },
  {
    id: 'food-12',
    name: 'Bread',
    categoryId: 'grains',
    imageEmoji: '🍞',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-08',
    status: 'active',
  },
  {
    id: 'food-13',
    name: 'Oatmeal',
    categoryId: 'grains',
    description: 'Warm oats with a touch of honey',
    imageEmoji: '🥣',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-14',
    status: 'active',
    favourite: true,
  },
  {
    id: 'food-14',
    name: 'Scrambled Eggs',
    categoryId: 'meat-alternate',
    imageEmoji: '🍳',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-14',
    status: 'active',
  },
  {
    id: 'food-15',
    name: 'Grapes',
    categoryId: 'fruits',
    imageEmoji: '🍇',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-15',
    status: 'active',
  },
  {
    id: 'food-16',
    name: 'Cucumber Slices',
    categoryId: 'vegetables',
    imageEmoji: '🥒',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-15',
    status: 'active',
  },
  {
    id: 'food-17',
    name: 'Cheese Cubes',
    categoryId: 'milk',
    imageEmoji: '🧀',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-16',
    status: 'active',
  },
  {
    id: 'food-18',
    name: 'Chicken Nuggets',
    categoryId: 'meat',
    description: 'Oven-baked, not fried',
    imageEmoji: '🍗',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-16',
    status: 'active',
  },
  {
    id: 'food-19',
    name: 'Tomato Soup',
    categoryId: 'vegetables',
    imageEmoji: '🍅',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-17',
    status: 'active',
  },
  {
    id: 'food-20',
    name: 'Pasta',
    categoryId: 'grains',
    imageEmoji: '🍝',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-17',
    status: 'active',
  },
  {
    id: 'food-21',
    name: 'Pear',
    categoryId: 'fruits',
    imageEmoji: '🍐',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-18',
    status: 'active',
  },
  {
    id: 'food-22',
    name: 'Peanut Butter Toast',
    categoryId: 'allergens',
    description: 'Contains peanuts — check allergy list',
    imageEmoji: '🥜',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-18',
    status: 'active',
  },
  {
    id: 'food-23',
    name: 'Idli',
    categoryId: 'grains',
    description: 'Steamed rice cakes',
    imageEmoji: '🫓',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-19',
    status: 'active',
  },
  {
    id: 'food-24',
    name: 'Sambar',
    categoryId: 'meat-alternate',
    imageEmoji: '🍲',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-19',
    status: 'active',
  },
  {
    id: 'food-25',
    name: 'Watermelon',
    categoryId: 'fruits',
    imageEmoji: '🍉',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-20',
    status: 'active',
  },
  {
    id: 'food-26',
    name: 'Corn Flakes',
    categoryId: 'grains',
    imageEmoji: '🥣',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-20',
    status: 'active',
  },
  {
    id: 'food-27',
    name: 'Boiled Potato',
    categoryId: 'vegetables',
    imageEmoji: '🥔',
    isCombo: false,
    hasAllergen: false,
    createdAt: '2026-06-21',
    status: 'archived',
  },
  {
    id: 'food-28',
    name: 'Fish Curry',
    categoryId: 'meat',
    imageEmoji: '🐟',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-21',
    status: 'active',
  },
  {
    id: 'food-29',
    name: 'Smoothie',
    categoryId: 'others',
    description: 'Banana + milk blend',
    imageEmoji: '🥤',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-22',
    status: 'active',
  },
  {
    id: 'food-30',
    name: 'Crackers',
    categoryId: 'grains',
    imageEmoji: '🍘',
    isCombo: false,
    hasAllergen: true,
    createdAt: '2026-06-22',
    status: 'active',
  },
  {
    id: 'combo-1',
    name: 'Fruit Combo',
    categoryId: 'fruits',
    description: 'Apple, Banana & Orange',
    imageEmoji: '🍇',
    isCombo: true,
    comboItemIds: ['food-4', 'food-3', 'food-11'],
    hasAllergen: false,
    createdAt: '2026-06-10',
    status: 'active',
    favourite: true,
  },
  {
    id: 'combo-2',
    name: 'Milk Combo',
    categoryId: 'milk',
    description: 'Milk with dates & dry fruits',
    imageEmoji: '🥛',
    isCombo: true,
    comboItemIds: ['food-2'],
    hasAllergen: true,
    createdAt: '2026-06-12',
    status: 'active',
  },
  {
    id: 'combo-3',
    name: 'Veggie Platter',
    categoryId: 'vegetables',
    description: 'Carrot, cucumber & mixed vegetables',
    imageEmoji: '🥗',
    isCombo: true,
    comboItemIds: ['food-9', 'food-16', 'food-7'],
    hasAllergen: false,
    createdAt: '2026-06-23',
    status: 'active',
    favourite: true,
  },
  {
    id: 'combo-4',
    name: 'Breakfast Combo',
    categoryId: 'grains',
    description: 'Oatmeal, banana & milk',
    imageEmoji: '🌅',
    isCombo: true,
    comboItemIds: ['food-13', 'food-3', 'food-2'],
    hasAllergen: true,
    createdAt: '2026-06-24',
    status: 'active',
  },
];

function dayPlan(iso: string, partial: Partial<Record<string, string[]>>): DayMealPlan {
  return {
    date: iso,
    slots: { ...emptyDaySlots(), ...(partial as Record<string, string[]>) },
  };
}

/** Seed around “today” so the calendar looks populated */
export function buildSeedPlans(today: Date): DayMealPlan[] {
  const days: DayMealPlan[] = [];
  const menus: Partial<Record<string, string[]>>[] = [
    {
      breakfast: ['food-1', 'food-2'],
      'am-snack': ['food-4'],
      lunch: ['food-5', 'food-6', 'food-7'],
      'evening-snack': ['food-8'],
      'late-snack': ['food-2'],
    },
    {
      breakfast: ['food-13', 'food-3'],
      'am-snack': ['food-15'],
      lunch: ['food-20', 'food-19'],
      'evening-snack': ['food-17'],
      'late-snack': ['food-10'],
    },
    {
      breakfast: ['food-23', 'food-24'],
      'am-snack': ['combo-1'],
      lunch: ['food-5', 'food-18', 'food-7'],
      'evening-snack': ['food-9'],
      'late-snack': ['food-29'],
    },
    {
      breakfast: ['food-26', 'food-2'],
      'am-snack': ['food-21'],
      lunch: ['food-5', 'food-6', 'food-16'],
      'evening-snack': ['food-30'],
      'late-snack': ['food-2'],
    },
    {
      breakfast: ['combo-4'],
      'am-snack': ['food-25'],
      lunch: ['food-28', 'food-5'],
      'evening-snack': ['combo-3'],
    },
    {
      breakfast: ['food-14', 'food-12'],
      'am-snack': ['food-11'],
      lunch: ['food-20', 'food-7'],
      'evening-snack': ['food-8'],
      'late-snack': ['food-10'],
    },
    {
      breakfast: ['food-1', 'food-2', 'food-3'],
      'am-snack': ['food-4'],
      lunch: ['food-5', 'food-6', 'food-7'],
      'evening-snack': ['food-8'],
      'late-snack': ['food-2'],
    },
  ];

  // Populate ~2 weeks so Month / Week / List views look full
  for (let offset = -5; offset <= 10; offset++) {
    const d = addDays(today, offset);
    const menu = menus[((offset % menus.length) + menus.length) % menus.length];
    days.push(dayPlan(toISODate(d), menu));
  }
  return days;
}

export const seedTemplates: MealTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Standard Weekday',
    description: 'Balanced five-slot day for regular classrooms.',
    sections: DEFAULT_MEAL_SLOTS.map((s) => ({ ...s })),
    createdAt: '2026-05-20',
  },
  {
    id: 'tpl-2',
    name: 'Light Snack Day',
    description: 'Fewer heavy meals with extra healthy snacks.',
    sections: [
      { id: 'breakfast', name: 'Breakfast', icon: '☀', color: '#F59E0B', order: 0 },
      { id: 'am-snack', name: 'AM Snack', icon: '🌤', color: '#4F9CF9', order: 1 },
      { id: 'healthy-drink', name: 'Healthy Drink', icon: '🧃', color: '#10B981', order: 2 },
      { id: 'evening-snack', name: 'Evening Snack', icon: '🍪', color: '#EC4899', order: 3 },
    ],
    createdAt: '2026-06-01',
  },
  {
    id: 'tpl-3',
    name: 'Festival Feast',
    description: 'Special celebration meals with festival treats.',
    sections: [
      ...DEFAULT_MEAL_SLOTS.map((s) => ({ ...s })),
      { id: 'festival-meal', name: 'Festival Meal', icon: '🎉', color: '#F59E0B', order: 5 },
    ],
    createdAt: '2026-06-15',
  },
];

export const RECENT_FOOD_IDS = ['food-13', 'food-25', 'combo-3', 'food-23', 'food-18'];
export const FREQUENT_FOOD_IDS = ['food-2', 'food-5', 'food-3', 'food-8', 'food-1', 'food-13', 'combo-1'];
