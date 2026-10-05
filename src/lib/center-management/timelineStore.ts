'use client';

import { loadActivityPosts } from '@/lib/parent-communication/activitiesPostsStore';
import type { ActivityPost } from '@/types/activity';

export type TimelineActivityType =
  | 'playing'
  | 'dancing'
  | 'name-to-face'
  | 'announcement'
  | 'photo'
  | 'video'
  | 'diary';

export type TimelineActivity = {
  id: string;
  type: TimelineActivityType;
  title: string;
  body: string;
  at: string; // ISO
  author: string;
  mediaUrl?: string;
};

export const TIMELINE_FILTERS: {
  id: 'all' | TimelineActivityType;
  label: string;
}[] = [
  { id: 'all', label: 'Show All' },
  { id: 'playing', label: 'Playing' },
  { id: 'dancing', label: 'Dancing' },
  { id: 'name-to-face', label: 'Name to Face' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'photo', label: 'Photo' },
  { id: 'video', label: 'Video' },
  { id: 'diary', label: 'Diary' },
];

const STORAGE_KEY = 'panacea.center.student-timeline.v1';
const TIMELINE_EVENT = 'panacea.center.student-timeline';

const DIRECT_TYPE_MAP: Record<string, TimelineActivityType> = {
  playing: 'playing',
  dancing: 'dancing',
  'name-to-face': 'name-to-face',
  announcement: 'announcement',
  photo: 'photo',
  video: 'video',
  diary: 'diary',
};

function mapActivityType(post: ActivityPost): TimelineActivityType {
  const mapped = DIRECT_TYPE_MAP[post.activityTypeId];
  if (mapped) return mapped;
  if (post.activityTypeId === 'video' || post.youtubePreview) return 'video';
  if (post.activityTypeId === 'photo' || post.attachments?.some((a) => a.type === 'image')) {
    return 'photo';
  }
  if (post.attachments?.some((a) => a.type === 'video')) return 'video';
  return 'diary';
}

function postCreatedIso(post: ActivityPost): string {
  try {
    const parsed = new Date(`${post.createdDate} ${post.createdTime}`);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  } catch {
    /* fall through */
  }
  const [y, m, day] = post.createdDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1, 12, 0, 0, 0).toISOString();
}

function activityPostToTimelineItem(post: ActivityPost): TimelineActivity {
  const image = post.attachments?.find((a) => a.type === 'image' && a.url && a.url !== '#');
  const video = post.attachments?.find((a) => a.type === 'video' && a.url && a.url !== '#');
  return {
    id: `act-${post.id}`,
    type: mapActivityType(post),
    title: post.title,
    body: post.content.trim() || post.activityTypeName,
    at: postCreatedIso(post),
    author: post.postedBy.name,
    mediaUrl: image?.url || video?.thumbnail || video?.url || post.youtubePreview?.thumbnail,
  };
}

/** Live activity posts from Parent Communication for one student. */
export function listTimelinePostsForStudent(studentId: string): TimelineActivity[] {
  if (!studentId) return [];
  return loadActivityPosts()
    .filter((post) => {
      if (post.isArchived) return false;
      if (post.status !== 'posted') return false;
      return Boolean(post.audienceStudents?.includes(studentId));
    })
    .map(activityPostToTimelineItem);
}

function mergeTimelineItems(base: TimelineActivity[], fromPosts: TimelineActivity[]) {
  const seen = new Set(base.map((item) => item.id));
  const merged = [...base];
  for (const item of fromPosts) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged.sort((a, b) => b.at.localeCompare(a.at));
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function seed(studentId: string): TimelineActivity[] {
  const now = new Date();
  const d = (daysAgo: number, hour = 10) => {
    const x = new Date(now);
    x.setDate(x.getDate() - daysAgo);
    x.setHours(hour, 15, 0, 0);
    return x.toISOString();
  };
  return [
    {
      id: `${studentId}-tl-1`,
      type: 'playing',
      title: 'Outdoor play adventure',
      body: 'Explored the playground, practiced balance on the beams, and shared toys with friends.',
      at: d(0, 9),
      author: 'Ms. Priya',
    },
    {
      id: `${studentId}-tl-2`,
      type: 'announcement',
      title: 'Water day reminder',
      body: 'Please send a labeled water bottle and sunscreen for tomorrow’s outdoor session.',
      at: d(1, 16),
      author: 'Center Admin',
    },
    {
      id: `${studentId}-tl-3`,
      type: 'photo',
      title: 'Art corner smiles',
      body: 'Finger painting session — lots of color mixing and creative storytelling.',
      at: d(2, 11),
      author: 'Ms. Asha',
    },
    {
      id: `${studentId}-tl-4`,
      type: 'diary',
      title: 'Afternoon reflection',
      body: 'Settled well after nap, enjoyed story time, and helped tidy the reading nook.',
      at: d(3, 14),
      author: 'Ms. Priya',
    },
    {
      id: `${studentId}-tl-5`,
      type: 'dancing',
      title: 'Music & movement',
      body: 'Joined circle dance, kept rhythm with shakers, and led a short freeze-dance round.',
      at: d(5, 10),
      author: 'Ms. Kavya',
    },
    {
      id: `${studentId}-tl-6`,
      type: 'name-to-face',
      title: 'Welcome circle',
      body: 'Practiced greeting friends by name and matching faces during morning circle.',
      at: d(7, 9),
      author: 'Ms. Asha',
    },
  ];
}

function readAll(): Record<string, TimelineActivity[]> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TimelineActivity[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, TimelineActivity[]>) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadTimeline(studentId: string): TimelineActivity[] {
  const all = readAll();
  let base = all[studentId];
  if (!base?.length) {
    base = seed(studentId);
    all[studentId] = base;
    writeAll(all);
  }
  return mergeTimelineItems(base, listTimelinePostsForStudent(studentId));
}

export function subscribeTimeline(cb: () => void) {
  if (!canUseStorage()) return () => undefined;
  const handler = () => cb();
  window.addEventListener(TIMELINE_EVENT, handler);
  window.addEventListener('panacea.activities.posts', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(TIMELINE_EVENT, handler);
    window.removeEventListener('panacea.activities.posts', handler);
    window.removeEventListener('storage', handler);
  };
}

export function saveTimeline(studentId: string, items: TimelineActivity[]) {
  const all = readAll();
  all[studentId] = items;
  writeAll(all);
}

export function activityDayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTimelineWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDayLabel(y: number, m0: number, day: number) {
  const d = new Date(y, m0, day);
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
