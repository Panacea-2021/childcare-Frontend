import type {
  EnquiryStageConfig,
  LostReason,
  StageColorSwatch,
  StageIconKey,
} from './types';

const STAGES_KEY = 'panacea.enquiries.stages';
const LOST_REASONS_KEY = 'panacea.enquiries.lostReasons';

export const STAGE_COLOR_PALETTE: StageColorSwatch[] = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Emerald', value: '#059669' },
];

export const STAGE_ICON_OPTIONS: { value: StageIconKey; label: string }[] = [
  { value: 'archive', label: 'Archive' },
  { value: 'heart', label: 'Heart' },
  { value: 'clock', label: 'Clock' },
  { value: 'check', label: 'Check' },
  { value: 'userx', label: 'User X' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'file', label: 'File' },
  { value: 'phone', label: 'Phone' },
  { value: 'flag', label: 'Flag' },
  { value: 'star', label: 'Star' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'mapPin', label: 'Map Pin' },
];

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createStageId() {
  return createId('stg');
}

export function createLostReasonId() {
  return createId('lsr');
}

export const DEFAULT_STAGES: EnquiryStageConfig[] = [
  {
    id: 'stg-stored',
    name: 'Stored',
    color: '#3B82F6',
    icon: 'archive',
    description: 'New enquiries awaiting first contact',
    active: true,
    isSystem: false,
    order: 0,
    enquiryCount: 12,
  },
  {
    id: 'stg-interested',
    name: 'Interested',
    color: '#8B5CF6',
    icon: 'heart',
    description: 'Families showing active interest',
    active: true,
    isSystem: false,
    order: 1,
    enquiryCount: 18,
  },
  {
    id: 'stg-waitlisted',
    name: 'Waitlisted',
    color: '#F59E0B',
    icon: 'clock',
    description: 'Awaiting seat availability',
    active: true,
    isSystem: false,
    order: 2,
    enquiryCount: 7,
  },
  {
    id: 'stg-admitted',
    name: 'Admitted',
    color: '#10B981',
    icon: 'check',
    description: 'Successfully enrolled students',
    active: true,
    isSystem: true,
    order: 3,
    enquiryCount: 24,
  },
  {
    id: 'stg-lost',
    name: 'Lost',
    color: '#EF4444',
    icon: 'userx',
    description: 'Enquiries that did not convert',
    active: true,
    isSystem: true,
    order: 4,
    enquiryCount: 5,
  },
];

export const DEFAULT_LOST_REASONS: LostReason[] = [
  { id: 'lsr-fee', name: 'Fee Too High', description: '', active: true, order: 0 },
  { id: 'lsr-other-school', name: 'Chose Another School', description: '', active: true, order: 1 },
  { id: 'lsr-relocated', name: 'Relocated', description: '', active: true, order: 2 },
  { id: 'lsr-no-response', name: 'No Response', description: '', active: true, order: 3 },
  { id: 'lsr-not-interested', name: 'Not Interested', description: '', active: true, order: 4 },
  { id: 'lsr-timing', name: 'Timing Issue', description: '', active: true, order: 5 },
  { id: 'lsr-transport', name: 'Transportation', description: '', active: true, order: 6 },
  { id: 'lsr-parent', name: 'Parent Decision', description: '', active: true, order: 7 },
];

const VALID_ICONS = new Set(STAGE_ICON_OPTIONS.map((o) => o.value));

function normalizeStage(item: Partial<EnquiryStageConfig>, index: number): EnquiryStageConfig | null {
  const name = String(item.name ?? '').trim();
  if (!name) return null;
  const isSystem =
    item.isSystem === true ||
    name.toLowerCase() === 'admitted' ||
    name.toLowerCase() === 'lost';
  const icon = VALID_ICONS.has(item.icon as StageIconKey)
    ? (item.icon as StageIconKey)
    : 'flag';
  const color =
    typeof item.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(item.color)
      ? item.color
      : STAGE_COLOR_PALETTE[index % STAGE_COLOR_PALETTE.length]?.value ?? '#6366F1';

  return {
    id: String(item.id ?? createStageId()),
    name,
    color,
    icon,
    description: String(item.description ?? ''),
    active: isSystem ? true : item.active !== false,
    isSystem,
    order: typeof item.order === 'number' ? item.order : index,
    enquiryCount: typeof item.enquiryCount === 'number' ? item.enquiryCount : 0,
  };
}

function normalizeLostReason(item: Partial<LostReason>, index: number): LostReason | null {
  const name = String(item.name ?? '').trim();
  if (!name) return null;
  return {
    id: String(item.id ?? createLostReasonId()),
    name,
    description: String(item.description ?? ''),
    active: item.active !== false,
    order: typeof item.order === 'number' ? item.order : index,
  };
}

export function loadStages(): EnquiryStageConfig[] {
  if (typeof window === 'undefined') return DEFAULT_STAGES;
  try {
    const raw = localStorage.getItem(STAGES_KEY);
    if (!raw) {
      localStorage.setItem(STAGES_KEY, JSON.stringify(DEFAULT_STAGES));
      return DEFAULT_STAGES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STAGES_KEY, JSON.stringify(DEFAULT_STAGES));
      return DEFAULT_STAGES;
    }
    const normalized = parsed
      .map((item: Partial<EnquiryStageConfig>, i: number) => normalizeStage(item, i))
      .filter((x): x is EnquiryStageConfig => Boolean(x))
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i }));

    // Ensure system stages always exist
    const hasAdmitted = normalized.some((s) => s.name.toLowerCase() === 'admitted' && s.isSystem);
    const hasLost = normalized.some((s) => s.name.toLowerCase() === 'lost' && s.isSystem);
    if (!hasAdmitted || !hasLost) {
      localStorage.setItem(STAGES_KEY, JSON.stringify(DEFAULT_STAGES));
      return DEFAULT_STAGES;
    }
    if (!normalized.length) {
      localStorage.setItem(STAGES_KEY, JSON.stringify(DEFAULT_STAGES));
      return DEFAULT_STAGES;
    }
    return normalized;
  } catch (err) {
    console.error('Failed to load enquiry stages:', err);
    return DEFAULT_STAGES;
  }
}

export function saveStages(stages: EnquiryStageConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ordered = stages.map((s, i) => ({ ...s, order: i }));
    localStorage.setItem(STAGES_KEY, JSON.stringify(ordered));
  } catch (err) {
    console.error('Failed to save enquiry stages:', err);
  }
}

export function loadLostReasons(): LostReason[] {
  if (typeof window === 'undefined') return DEFAULT_LOST_REASONS;
  try {
    const raw = localStorage.getItem(LOST_REASONS_KEY);
    if (!raw) {
      localStorage.setItem(LOST_REASONS_KEY, JSON.stringify(DEFAULT_LOST_REASONS));
      return DEFAULT_LOST_REASONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(LOST_REASONS_KEY, JSON.stringify(DEFAULT_LOST_REASONS));
      return DEFAULT_LOST_REASONS;
    }
    const normalized = parsed
      .map((item: Partial<LostReason>, i: number) => normalizeLostReason(item, i))
      .filter((x): x is LostReason => Boolean(x))
      .sort((a, b) => a.order - b.order)
      .map((r, i) => ({ ...r, order: i }));
    if (!normalized.length) {
      localStorage.setItem(LOST_REASONS_KEY, JSON.stringify(DEFAULT_LOST_REASONS));
      return DEFAULT_LOST_REASONS;
    }
    return normalized;
  } catch (err) {
    console.error('Failed to load lost reasons:', err);
    return DEFAULT_LOST_REASONS;
  }
}

export function saveLostReasons(reasons: LostReason[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ordered = reasons.map((r, i) => ({ ...r, order: i }));
    localStorage.setItem(LOST_REASONS_KEY, JSON.stringify(ordered));
  } catch (err) {
    console.error('Failed to save lost reasons:', err);
  }
}

/** Pick the next unused palette color, wrapping if all are taken. */
export function nextAvailableColor(usedColors: string[]): string {
  const used = new Set(usedColors.map((c) => c.toLowerCase()));
  const free = STAGE_COLOR_PALETTE.find((c) => !used.has(c.value.toLowerCase()));
  if (free) return free.value;
  const i = usedColors.length % STAGE_COLOR_PALETTE.length;
  return STAGE_COLOR_PALETTE[i]?.value ?? '#6366F1';
}

export function isLostStageName(name: string) {
  return name.trim().toLowerCase() === 'lost';
}

export function isAdmittedStageName(name: string) {
  return name.trim().toLowerCase() === 'admitted';
}

export function activeStages(stages: EnquiryStageConfig[]) {
  return [...stages].filter((s) => s.active).sort((a, b) => a.order - b.order);
}

export function activeLostReasons(reasons: LostReason[]) {
  return [...reasons].filter((r) => r.active).sort((a, b) => a.order - b.order);
}

export { nowIso };
