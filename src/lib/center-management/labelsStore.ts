export type LabelStatus = 'Active' | 'Inactive';

export type LabelFeature =
  | 'Activity'
  | 'Program'
  | 'Expense Log'
  | 'Lead Task'
  | 'Lesson'
  | 'Assessment & Milestone'
  | 'Email Templates'
  | 'Fee Plan'
  | 'Tour Management'
  | 'Enquiry'
  | 'Staff'
  | 'Room';

export type LabelItem = {
  id: string;
  name: string;
  feature: LabelFeature;
  status: LabelStatus;
  createdAt: string;
};

const STORAGE_KEY = 'panacea.centerManagement.labels';
const VERSION_KEY = 'panacea.centerManagement.labels.seedVersion';
const CURRENT_VERSION = '2';

export const LABEL_FEATURES: LabelFeature[] = [
  'Activity',
  'Program',
  'Expense Log',
  'Lead Task',
  'Lesson',
  'Assessment & Milestone',
  'Email Templates',
  'Fee Plan',
  'Tour Management',
  'Enquiry',
  'Staff',
  'Room',
];

const TS = (d: string) => `${d}T10:00:00.000Z`;

export const DEFAULT_LABELS: LabelItem[] = [
  { id: 'lbl-1', name: 'Outdoor Games', feature: 'Activity', status: 'Active', createdAt: TS('2026-01-08') },
  { id: 'lbl-2', name: 'Story Circle', feature: 'Activity', status: 'Active', createdAt: TS('2026-01-09') },
  { id: 'lbl-3', name: 'Free Play', feature: 'Activity', status: 'Active', createdAt: TS('2026-01-10') },
  { id: 'lbl-4', name: 'Music & Movement', feature: 'Activity', status: 'Active', createdAt: TS('2026-01-12') },
  { id: 'lbl-5', name: 'Toddler Discovery', feature: 'Program', status: 'Active', createdAt: TS('2026-01-15') },
  { id: 'lbl-6', name: 'Pre-K Explorers', feature: 'Program', status: 'Active', createdAt: TS('2026-01-16') },
  { id: 'lbl-7', name: 'Summer Camp', feature: 'Program', status: 'Inactive', createdAt: TS('2026-01-18') },
  { id: 'lbl-8', name: 'Supplies', feature: 'Expense Log', status: 'Active', createdAt: TS('2026-01-20') },
  { id: 'lbl-9', name: 'Utilities', feature: 'Expense Log', status: 'Active', createdAt: TS('2026-01-21') },
  { id: 'lbl-10', name: 'Follow-up Call', feature: 'Lead Task', status: 'Active', createdAt: TS('2026-01-22') },
  { id: 'lbl-11', name: 'Tour Booked', feature: 'Lead Task', status: 'Active', createdAt: TS('2026-01-23') },
  { id: 'lbl-12', name: 'Phonics Basics', feature: 'Lesson', status: 'Active', createdAt: TS('2026-01-25') },
  { id: 'lbl-13', name: 'Number Sense', feature: 'Lesson', status: 'Active', createdAt: TS('2026-01-26') },
  { id: 'lbl-14', name: '40 to 60+ months', feature: 'Assessment & Milestone', status: 'Active', createdAt: TS('2026-02-01') },
  { id: 'lbl-15', name: '30 to 50 months', feature: 'Assessment & Milestone', status: 'Active', createdAt: TS('2026-02-02') },
  { id: 'lbl-16', name: '22 to 36 months', feature: 'Assessment & Milestone', status: 'Active', createdAt: TS('2026-02-03') },
  { id: 'lbl-17', name: '12 to 18 months', feature: 'Assessment & Milestone', status: 'Inactive', createdAt: TS('2026-02-04') },
  { id: 'lbl-18', name: 'Physical Development', feature: 'Assessment & Milestone', status: 'Active', createdAt: TS('2026-02-05') },
  { id: 'lbl-19', name: 'Communication & Language', feature: 'Assessment & Milestone', status: 'Active', createdAt: TS('2026-02-06') },
  { id: 'lbl-20', name: 'Fee Reminder', feature: 'Email Templates', status: 'Active', createdAt: TS('2026-02-08') },
  { id: 'lbl-21', name: 'Welcome Pack', feature: 'Email Templates', status: 'Active', createdAt: TS('2026-02-09') },
  { id: 'lbl-22', name: 'Monthly Plan', feature: 'Fee Plan', status: 'Active', createdAt: TS('2026-02-10') },
  { id: 'lbl-23', name: 'Sibling Discount', feature: 'Fee Plan', status: 'Active', createdAt: TS('2026-02-11') },
  { id: 'lbl-24', name: 'Morning Tour', feature: 'Tour Management', status: 'Active', createdAt: TS('2026-02-12') },
  { id: 'lbl-25', name: 'Weekend Open House', feature: 'Tour Management', status: 'Active', createdAt: TS('2026-02-13') },
  { id: 'lbl-26', name: 'Hot Lead', feature: 'Enquiry', status: 'Active', createdAt: TS('2026-02-14') },
  { id: 'lbl-27', name: 'Waitlist', feature: 'Enquiry', status: 'Active', createdAt: TS('2026-02-15') },
  { id: 'lbl-28', name: 'Full-time', feature: 'Staff', status: 'Active', createdAt: TS('2026-02-16') },
  { id: 'lbl-29', name: 'Part-time', feature: 'Staff', status: 'Active', createdAt: TS('2026-02-17') },
  { id: 'lbl-30', name: 'Infant Suite', feature: 'Room', status: 'Active', createdAt: TS('2026-02-18') },
  { id: 'lbl-31', name: 'Outdoor Access', feature: 'Room', status: 'Active', createdAt: TS('2026-02-19') },
];

export function loadLabels(): LabelItem[] {
  if (typeof window === 'undefined') return DEFAULT_LABELS;
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_LABELS;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_LABELS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
      return DEFAULT_LABELS;
    }
    return parsed.map((item: Partial<LabelItem>) => ({
      id: String(item.id ?? crypto.randomUUID()),
      name: String(item.name ?? ''),
      feature: (item.feature as LabelFeature) ?? 'Activity',
      status: item.status === 'Inactive' ? 'Inactive' : 'Active',
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    }));
  } catch (err) {
    console.error('Failed to load labels:', err);
    return DEFAULT_LABELS;
  }
}

export function saveLabels(labels: LabelItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  } catch (err) {
    console.error('Failed to save labels:', err);
  }
}

export function createLabelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `lbl-${crypto.randomUUID()}`;
  }
  return `lbl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
