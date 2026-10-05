import type {
  Announcement,
  AnnouncementFormValues,
  AnnouncementStatus,
  FormErrors,
  SummaryStats,
} from './types';
import { roomOptions, staffOptions } from './mockData';

export const NOTE_MAX = 1200;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDisplayDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDisplayTime(hhmm: string) {
  if (!hhmm) return '—';
  const [hStr, mStr] = hhmm.split(':');
  let h = Number(hStr);
  const m = mStr ?? '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function linkPreviewKind(url: string): 'youtube' | 'drive' | 'meet' | 'web' | null {
  if (!url.trim() || !isValidUrl(url)) return null;
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('drive.google.com')) return 'drive';
  if (lower.includes('meet.google.com') || lower.includes('zoom.us') || lower.includes('teams.microsoft'))
    return 'meet';
  return 'web';
}

export function validateForm(values: AnnouncementFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.date) errors.date = 'Announcement date is required';
  if (!values.time) errors.time = 'Announcement time is required';
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (!values.note.trim()) errors.note = 'Announcement note is required';
  else if (values.note.length > NOTE_MAX) errors.note = `Note cannot exceed ${NOTE_MAX} characters`;
  if (values.mode === 'staff' && values.staffIds.length === 0) {
    errors.staffIds = 'Select at least one staff member';
  }
  if (values.mode === 'room' && !values.roomId) {
    errors.roomId = 'Select a room';
  }
  if (values.methods.length === 0) {
    errors.methods = 'Select at least one communication method';
  }
  if (values.referenceLink.trim() && !isValidUrl(values.referenceLink)) {
    errors.referenceLink = 'Enter a valid URL (https://…)';
  }
  return errors;
}

export function resolveStatus(date: string, time: string): AnnouncementStatus {
  const now = new Date();
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const when = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  if (when.getTime() > now.getTime() + 60 * 60 * 1000) return 'scheduled';
  if (when.getTime() > now.getTime()) return 'pending';
  return 'delivered';
}

export function computeStats(items: Announcement[]): SummaryStats {
  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    total: items.length,
    today: items.filter((a) => a.date === todayIso).length,
    scheduled: items.filter((a) => a.status === 'scheduled').length,
    delivered: items.filter((a) => a.status === 'delivered').length,
    pending: items.filter((a) => a.status === 'pending').length,
  };
}

export function filterAnnouncements(
  items: Announcement[],
  search: string,
  filterDate: string,
): Announcement[] {
  const q = search.trim().toLowerCase();
  return items.filter((a) => {
    if (filterDate && a.date !== filterDate) return false;
    if (!q) return true;
    const room = roomOptions.find((r) => r.id === a.roomId);
    const staffNames = a.staffIds
      .map((id) => staffOptions.find((s) => s.id === id)?.name ?? '')
      .join(' ');
    const hay = [a.title, a.note, room?.name ?? '', staffNames, a.createdBy].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

export function announcementToForm(a: Announcement): AnnouncementFormValues {
  return {
    date: a.date,
    time: a.time,
    title: a.title,
    note: a.note,
    mode: a.mode,
    staffIds: [...a.staffIds],
    roomId: a.roomId ?? '',
    methods: [...a.methods],
    attachments: a.attachments.map((x) => ({ ...x })),
    referenceLink: a.referenceLink,
  };
}

export function fileIconKind(name: string): 'pdf' | 'doc' | 'image' | 'zip' | 'file' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'doc';
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return 'image';
  if (lower.endsWith('.zip') || lower.endsWith('.rar')) return 'zip';
  return 'file';
}

export function acceptFile(file: File) {
  const okExt = /\.(pdf|doc|docx|png|jpe?g|gif|webp|zip)$/i.test(file.name);
  const okMime =
    /^(application\/(pdf|msword|vnd\.openxmlformats|zip|x-zip)|image\/)/i.test(file.type) ||
    file.type === '';
  return okExt && okMime;
}
