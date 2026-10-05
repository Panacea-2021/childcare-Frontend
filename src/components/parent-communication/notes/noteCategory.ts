import type { NoteCategory } from '@/types/note';

export const NOTE_CATEGORY_META: Record<
  NoteCategory,
  { border: string; badgeBg: string; badgeColor: string; glow: string }
> = {
  Medication: {
    border: '#E53935',
    badgeBg: 'rgba(229, 57, 53, 0.12)',
    badgeColor: '#C62828',
    glow: 'rgba(229, 57, 53, 0.28)',
  },
  Food: {
    border: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeColor: '#B45309',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  Sleep: {
    border: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    badgeColor: '#1D4ED8',
    glow: 'rgba(59, 130, 246, 0.28)',
  },
  'General Note': {
    border: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
    badgeColor: '#6D28D9',
    glow: 'rgba(124, 58, 237, 0.28)',
  },
  Health: {
    border: '#16A34A',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
    badgeColor: '#15803D',
    glow: 'rgba(22, 163, 74, 0.28)',
  },
  Travel: {
    border: '#0D9488',
    badgeBg: 'rgba(13, 148, 136, 0.12)',
    badgeColor: '#0F766E',
    glow: 'rgba(13, 148, 136, 0.28)',
  },
  Behavior: {
    border: '#DB2777',
    badgeBg: 'rgba(219, 39, 119, 0.12)',
    badgeColor: '#BE185D',
    glow: 'rgba(219, 39, 119, 0.28)',
  },
};

export function formatNoteDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

export function formatNoteTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
