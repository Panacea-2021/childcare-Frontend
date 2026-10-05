import type { EnquirySource } from './types';

const STORAGE_KEY = 'panacea.enquiries.sources';

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSourceId() {
  return createId('src');
}

export function createSubSourceId() {
  return createId('sub');
}

const DEFAULT_SOURCE_SEED: { name: string; subs: string[] }[] = [
  { name: 'Facebook Ads', subs: ['Campaign A', 'Campaign B', 'Video Ad', 'Lead Form'] },
  { name: 'Instagram', subs: ['Story Ad', 'Feed Post', 'DM', 'Bio Link'] },
  { name: 'WhatsApp', subs: ['Direct Chat', 'QR Code', 'Broadcast'] },
  { name: 'Website', subs: ['Landing Page', 'Contact Form', 'Chat Widget'] },
  { name: 'Walk In', subs: ['Campus Visit', 'Open House', 'Sibling Visit'] },
  { name: 'Walk-in', subs: ['Reception', 'Open Day'] },
  { name: 'Referral', subs: ['Friend', 'Parent', 'Existing Student', 'Relative'] },
  { name: 'Banner', subs: ['Mall Banner', 'Roadside', 'School Gate'] },
  { name: 'Newspaper', subs: ['Local Daily', 'Weekend Special', 'Classified'] },
  { name: 'Event', subs: ['Community Fair', 'Parent Meetup', 'Expo Stall'] },
  { name: 'Google Search', subs: ['Google Ads', 'Organic Search', 'Maps Listing'] },
];

function buildDefaultSources(): EnquirySource[] {
  const ts = nowIso();
  return DEFAULT_SOURCE_SEED.map((item, index) => ({
    id: `src-${index + 1}`,
    name: item.name,
    status: 'Active' as const,
    subSources: item.subs.map((sub, i) => ({
      id: `sub-${index + 1}-${i + 1}`,
      name: sub,
    })),
    createdAt: ts,
    updatedAt: ts,
  }));
}

export const DEFAULT_SOURCES: EnquirySource[] = buildDefaultSources();

function normalizeSource(item: Partial<EnquirySource>): EnquirySource | null {
  const name = String(item.name ?? '').trim();
  if (!name) return null;
  const subSources = Array.isArray(item.subSources)
    ? item.subSources
        .map((s) => ({
          id: String(s?.id ?? createSubSourceId()),
          name: String(s?.name ?? '').trim(),
        }))
        .filter((s) => s.name)
    : [];
  if (!subSources.length) return null;
  return {
    id: String(item.id ?? createSourceId()),
    name,
    status: item.status === 'Inactive' ? 'Inactive' : 'Active',
    subSources,
    createdAt: String(item.createdAt ?? nowIso()),
    updatedAt: String(item.updatedAt ?? nowIso()),
  };
}

export function loadSources(): EnquirySource[] {
  if (typeof window === 'undefined') return DEFAULT_SOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    }
    const normalized = parsed
      .map((item: Partial<EnquirySource>) => normalizeSource(item))
      .filter((x): x is EnquirySource => Boolean(x));
    if (!normalized.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    }
    return normalized;
  } catch (err) {
    console.error('Failed to load enquiry sources:', err);
    return DEFAULT_SOURCES;
  }
}

export function saveSources(sources: EnquirySource[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  } catch (err) {
    console.error('Failed to save enquiry sources:', err);
  }
}

export function formatSourceDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getSubSourcesFor(sources: EnquirySource[], sourceName: string) {
  const src = sources.find((s) => s.name === sourceName && s.status === 'Active');
  return src?.subSources ?? [];
}
