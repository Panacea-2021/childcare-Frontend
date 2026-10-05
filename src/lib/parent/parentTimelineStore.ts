'use client';

import type { ActivityAttachment } from '@/types/activity';

const STORAGE_KEY = 'panacea.parent.timeline.posts.v1';
const LIKES_KEY = 'panacea.parent.timeline.likes.v1';

export type ParentTimelineComment = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
};

export type ParentTimelinePost = {
  id: string;
  activityTypeId: string;
  activityTypeName: string;
  activityIcon: string;
  activityColor: string;
  activityBgColor: string;
  title: string;
  note: string;
  createdAt: string;
  postedByName: string;
  postedByRole: string;
  studentIds: string[];
  staffOnly: boolean;
  enableComments: boolean;
  allowParentReactions: boolean;
  attachments: ActivityAttachment[];
  fieldValues?: Record<string, string | string[] | boolean>;
  likesCount: number;
  likedBy: string[];
  comments: ParentTimelineComment[];
  status: 'posted' | 'scheduled' | 'draft';
  scheduledAt?: string;
};

export type PublishParentTimelineInput = {
  activityTypeId: string;
  activityTypeName: string;
  activityIcon: string;
  activityColor: string;
  activityBgColor: string;
  title: string;
  note: string;
  studentIds: string[];
  staffOnly?: boolean;
  enableComments?: boolean;
  allowParentReactions?: boolean;
  attachments?: ActivityAttachment[];
  fieldValues?: Record<string, string | string[] | boolean>;
  postedByName?: string;
  postedByRole?: string;
  status?: 'posted' | 'scheduled' | 'draft';
  scheduledAt?: string;
};

type LikesMap = Record<string, string[]>; // postId or commentId → parentIds

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readPosts(): ParentTimelinePost[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ParentTimelinePost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePosts(posts: ParentTimelinePost[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent('panacea.parent.timeline'));
}

function readLikes(): LikesMap {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LikesMap;
  } catch {
    return {};
  }
}

function writeLikes(map: LikesMap) {
  if (!canUseStorage()) return;
  localStorage.setItem(LIKES_KEY, JSON.stringify(map));
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeParentTimeline(cb: () => void) {
  if (!canUseStorage()) return () => undefined;
  const handler = () => cb();
  window.addEventListener('panacea.parent.timeline', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('panacea.parent.timeline', handler);
    window.removeEventListener('storage', handler);
  };
}

export function publishParentTimelinePost(
  input: PublishParentTimelineInput,
): ParentTimelinePost {
  const now = new Date().toISOString();
  const post: ParentTimelinePost = {
    id: uid('ptl'),
    activityTypeId: input.activityTypeId,
    activityTypeName: input.activityTypeName,
    activityIcon: input.activityIcon,
    activityColor: input.activityColor || '#5D5FEF',
    activityBgColor: input.activityBgColor || '#E8F2FF',
    title: input.title.trim() || `${input.activityTypeName} update`,
    note: input.note.trim(),
    createdAt: now,
    postedByName: input.postedByName || 'Center Staff',
    postedByRole: input.postedByRole || 'Staff',
    studentIds: [...new Set(input.studentIds.filter(Boolean))],
    staffOnly: Boolean(input.staffOnly),
    enableComments: input.enableComments !== false,
    allowParentReactions: input.allowParentReactions !== false,
    attachments: input.attachments ?? [],
    fieldValues: input.fieldValues,
    likesCount: 0,
    likedBy: [],
    comments: [],
    status: input.status || 'posted',
    scheduledAt: input.scheduledAt,
  };

  const posts = readPosts();
  posts.unshift(post);
  writePosts(posts);
  return post;
}

export function listParentTimelinePosts(studentId: string): ParentTimelinePost[] {
  const now = Date.now();
  return readPosts()
    .filter((p) => {
      if (p.staffOnly) return false;
      if (p.status === 'draft') return false;
      if (!p.studentIds.includes(studentId)) return false;
      if (p.status === 'scheduled' && p.scheduledAt) {
        return new Date(p.scheduledAt).getTime() <= now;
      }
      return p.status === 'posted' || p.status === 'scheduled';
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getParentTimelinePost(postId: string): ParentTimelinePost | undefined {
  return readPosts().find((p) => p.id === postId);
}

export function listActivityTypeOptions(studentId: string) {
  const posts = listParentTimelinePosts(studentId);
  const map = new Map<string, { id: string; name: string; icon: string; count: number }>();
  for (const p of posts) {
    const prev = map.get(p.activityTypeId);
    if (prev) prev.count += 1;
    else {
      map.set(p.activityTypeId, {
        id: p.activityTypeId,
        name: p.activityTypeName,
        icon: p.activityIcon,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const SEED_FLAG = 'panacea.parent.timeline.seeded.v1';

function hoursAgo(h: number) {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function daysAgoAt(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Seed demo posts for a student once (so calendar/filter have content). */
export function ensureParentTimelineSeed(studentId: string) {
  if (!studentId || !canUseStorage()) return;
  const existing = listParentTimelinePosts(studentId);
  if (existing.length > 0) return;

  let seededIds: string[] = [];
  try {
    seededIds = JSON.parse(localStorage.getItem(SEED_FLAG) || '[]') as string[];
  } catch {
    seededIds = [];
  }
  if (seededIds.includes(studentId)) return;

  const seeds: PublishParentTimelineInput[] = [
    {
      activityTypeId: 'photo',
      activityTypeName: 'Photo',
      activityIcon: 'Camera',
      activityColor: '#0891B2',
      activityBgColor: '#CFFAFE',
      title: 'Photo',
      note: 'Photo Shoot in School Today',
      studentIds: [studentId],
      attachments: [
        {
          id: 'seed-photo-1',
          name: 'class-photo-1.png',
          type: 'image',
          url: 'https://picsum.photos/seed/panacea-photo-1/400/400',
        },
        {
          id: 'seed-photo-2',
          name: 'class-photo-2.png',
          type: 'image',
          url: 'https://picsum.photos/seed/panacea-photo-2/400/400',
        },
        {
          id: 'seed-photo-3',
          name: 'class-photo-3.png',
          type: 'image',
          url: 'https://picsum.photos/seed/panacea-photo-3/400/400',
        },
      ],
      postedByName: 'Ms. Priya',
      status: 'posted',
    },
    {
      activityTypeId: 'diary',
      activityTypeName: 'Diary',
      activityIcon: 'BookOpen',
      activityColor: '#0D9488',
      activityBgColor: '#CCFBF1',
      title: 'Afternoon diary',
      note: 'Settled well after nap and enjoyed story time with friends.',
      studentIds: [studentId],
      postedByName: 'Ms. Asha',
      status: 'posted',
    },
    {
      activityTypeId: 'food',
      activityTypeName: 'Food',
      activityIcon: 'Apple',
      activityColor: '#EA580C',
      activityBgColor: '#FFEDD5',
      title: 'Lunch update',
      note: 'Ate most of lunch and tried a new fruit snack.',
      studentIds: [studentId],
      fieldValues: { 'Meal Type': 'Lunch' },
      postedByName: 'Kitchen Staff',
      status: 'posted',
    },
    {
      activityTypeId: 'todays-mood',
      activityTypeName: "Today's Mood",
      activityIcon: 'Smile',
      activityColor: '#D97706',
      activityBgColor: '#FEF3C7',
      title: "Today's Mood",
      note: 'Happy and curious during outdoor play.',
      studentIds: [studentId],
      fieldValues: { "Today's Mood": 'Happy 😋' },
      postedByName: 'Ms. Priya',
      status: 'posted',
    },
    {
      activityTypeId: 'playing',
      activityTypeName: 'Playing',
      activityIcon: 'Gamepad2',
      activityColor: '#14B8A6',
      activityBgColor: '#CCFBF1',
      title: 'Block play',
      note: 'Built a tall tower with friends and practiced sharing.',
      studentIds: [studentId],
      postedByName: 'Ms. Asha',
      status: 'posted',
    },
    {
      activityTypeId: 'announcement',
      activityTypeName: 'Announcement',
      activityIcon: 'Megaphone',
      activityColor: '#2563EB',
      activityBgColor: '#DBEAFE',
      title: 'Water day reminder',
      note: 'Please send a labeled water bottle for tomorrow’s outdoor session.',
      studentIds: [studentId],
      postedByName: 'Center Admin',
      status: 'posted',
    },
  ];

  const posts = readPosts();
  const stamped: ParentTimelinePost[] = seeds.map((input, i) => {
    const createdAt =
      i === 0
        ? hoursAgo(2)
        : i === 1
          ? hoursAgo(5)
          : i === 2
            ? daysAgoAt(1, 12, 30)
            : i === 3
              ? daysAgoAt(2, 10, 15)
              : i === 4
                ? daysAgoAt(3, 9, 40)
                : daysAgoAt(5, 16, 0);
    return {
      id: `seed-${studentId}-${input.activityTypeId}`,
      activityTypeId: input.activityTypeId,
      activityTypeName: input.activityTypeName,
      activityIcon: input.activityIcon,
      activityColor: input.activityColor,
      activityBgColor: input.activityBgColor,
      title: input.title,
      note: input.note,
      createdAt,
      postedByName: input.postedByName || 'Center Staff',
      postedByRole: 'Staff',
      studentIds: [studentId],
      staffOnly: false,
      enableComments: true,
      allowParentReactions: true,
      attachments: input.attachments ?? [],
      fieldValues: input.fieldValues,
      likesCount: i === 0 ? 1 : 0,
      likedBy: i === 0 ? ['demo-parent'] : [],
      comments:
        i === 0
          ? [
              {
                id: `seed-c-${studentId}-1`,
                authorId: 'demo-parent',
                authorName: 'Ryan',
                authorRole: 'Parent',
                text: 'Nice.',
                createdAt: hoursAgo(1),
                likesCount: 1,
                likedBy: ['demo-parent'],
              },
              {
                id: `seed-c-${studentId}-2`,
                authorId: 'demo-parent',
                authorName: 'Ryan',
                authorRole: 'Parent',
                text: 'Nice improvement.',
                createdAt: hoursAgo(1),
                likesCount: 0,
                likedBy: [],
              },
            ]
          : [],
      status: 'posted' as const,
    };
  });

  // Fix second comment time (~90 minutes ago)
  if (stamped[0]?.comments[1]) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 90);
    stamped[0].comments[1].createdAt = d.toISOString();
  }

  writePosts([...stamped, ...posts]);
  localStorage.setItem(SEED_FLAG, JSON.stringify([...seededIds, studentId]));
}

export function dayKeyFromIso(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTimelineDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimelineTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function datesWithActivity(studentId: string): Set<string> {
  const set = new Set<string>();
  for (const p of listParentTimelinePosts(studentId)) {
    set.add(dayKeyFromIso(p.createdAt));
  }
  return set;
}

export type DayActivityTypeMeta = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  count: number;
};

export type DayActivityMeta = {
  count: number;
  types: DayActivityTypeMeta[];
};

/** Per-day activity counts + unique types (optional activity-type filter). */
export function dayActivityMetaMap(
  studentId: string,
  filterActivityTypeId = 'all',
): Record<string, DayActivityMeta> {
  const map: Record<string, DayActivityMeta> = {};
  for (const p of listParentTimelinePosts(studentId)) {
    if (filterActivityTypeId !== 'all' && p.activityTypeId !== filterActivityTypeId) {
      continue;
    }
    const key = dayKeyFromIso(p.createdAt);
    const entry = map[key] || { count: 0, types: [] };
    entry.count += 1;
    const existing = entry.types.find((t) => t.id === p.activityTypeId);
    if (existing) {
      existing.count += 1;
    } else {
      entry.types.push({
        id: p.activityTypeId,
        name: p.activityTypeName,
        icon: p.activityIcon,
        color: p.activityColor,
        bgColor: p.activityBgColor,
        count: 1,
      });
    }
    map[key] = entry;
  }
  return map;
}

export function monthActivityCounts(
  studentId: string,
  year: number,
  filterActivityTypeId = 'all',
) {
  const counts: Record<number, number> = {};
  for (const p of listParentTimelinePosts(studentId)) {
    if (filterActivityTypeId !== 'all' && p.activityTypeId !== filterActivityTypeId) {
      continue;
    }
    const d = new Date(p.createdAt);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    counts[m] = (counts[m] || 0) + 1;
  }
  return counts;
}

export function formatCalendarDayLabel(dayKey: string) {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) return dayKey;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function togglePostLike(postId: string, parentId: string): ParentTimelinePost | undefined {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return undefined;
  const post = posts[idx];
  const liked = post.likedBy.includes(parentId);
  post.likedBy = liked
    ? post.likedBy.filter((id) => id !== parentId)
    : [...post.likedBy, parentId];
  post.likesCount = post.likedBy.length;
  posts[idx] = post;
  writePosts(posts);
  return post;
}

export function addParentComment(
  postId: string,
  input: { authorId: string; authorName: string; text: string },
): ParentTimelineComment | undefined {
  const text = input.text.trim();
  if (!text) return undefined;
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return undefined;
  const comment: ParentTimelineComment = {
    id: uid('ptc'),
    authorId: input.authorId,
    authorName: input.authorName,
    authorRole: 'Parent',
    text,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
  };
  posts[idx].comments = [...posts[idx].comments, comment];
  writePosts(posts);
  return comment;
}

export function updateParentComment(
  postId: string,
  commentId: string,
  authorId: string,
  text: string,
): boolean {
  const next = text.trim();
  if (!next) return false;
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return false;
  const cIdx = posts[idx].comments.findIndex((c) => c.id === commentId);
  if (cIdx < 0) return false;
  if (posts[idx].comments[cIdx].authorId !== authorId) return false;
  posts[idx].comments[cIdx] = { ...posts[idx].comments[cIdx], text: next };
  writePosts(posts);
  return true;
}

export function deleteParentComment(
  postId: string,
  commentId: string,
  authorId: string,
): boolean {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return false;
  const comment = posts[idx].comments.find((c) => c.id === commentId);
  if (!comment || comment.authorId !== authorId) return false;
  posts[idx].comments = posts[idx].comments.filter((c) => c.id !== commentId);
  writePosts(posts);
  return true;
}

export function toggleCommentLike(
  postId: string,
  commentId: string,
  parentId: string,
): ParentTimelineComment | undefined {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return undefined;
  const cIdx = posts[idx].comments.findIndex((c) => c.id === commentId);
  if (cIdx < 0) return undefined;
  const comment = posts[idx].comments[cIdx];
  const liked = comment.likedBy.includes(parentId);
  comment.likedBy = liked
    ? comment.likedBy.filter((id) => id !== parentId)
    : [...comment.likedBy, parentId];
  comment.likesCount = comment.likedBy.length;
  posts[idx].comments[cIdx] = comment;
  writePosts(posts);
  return comment;
}

/** Legacy helper reserved for future migration; currently unused. */
export function migrateLikesCache() {
  writeLikes(readLikes());
}
