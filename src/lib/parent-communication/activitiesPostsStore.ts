'use client';

import { MOCK_ACTIVITIES } from '@/lib/mock/mockActivities';
import { loadStudents, saveStudents } from '@/lib/center-management/studentsStore';
import type {
  ActivityCategoryName,
  ActivityPost,
  ActivityStatus,
  VisibilityType,
} from '@/types/activity';
import type { ActivityAttachment, VoiceNoteData, YoutubePreviewData } from '@/types/activity';

const STORAGE_KEY = 'panacea.activities.posts.v1';
const EVENT = 'panacea.activities.posts';

export type PublishCenterActivityInput = {
  activityTypeId: string;
  activityTypeName: string;
  activityIcon: string;
  category: ActivityCategoryName;
  title: string;
  content: string;
  studentIds: string[];
  room?: string;
  visibility: VisibilityType;
  status: ActivityStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledTimestamp?: number;
  attachments?: ActivityAttachment[];
  voiceNote?: VoiceNoteData | null;
  youtubePreview?: YoutubePreviewData | null;
  notifyStaff?: boolean;
  enableComments?: boolean;
  allowParentReactions?: boolean;
  sendPushNotification?: boolean;
  isPinned?: boolean;
  postedByName?: string;
  postedByRole?: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function readRaw(): ActivityPost[] | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivityPost[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writePosts(posts: ActivityPost[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Load all center activity posts (seeds mock catalog on first visit). */
export function loadActivityPosts(): ActivityPost[] {
  const existing = readRaw();
  if (existing) return existing;
  const seeded = MOCK_ACTIVITIES.map((p) => ({ ...p }));
  writePosts(seeded);
  return seeded;
}

export function saveActivityPosts(posts: ActivityPost[]) {
  writePosts(posts);
}

export function subscribeActivityPosts(cb: () => void) {
  if (!canUseStorage()) return () => undefined;
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** Persist a newly published / scheduled activity for Activities + Dashboard. */
export function publishCenterActivityPost(input: PublishCenterActivityInput): ActivityPost {
  const now = new Date();
  const isScheduled = input.status === 'scheduled';
  const post: ActivityPost = {
    id: uid('act'),
    title: input.title.trim() || `${input.activityTypeName} update`,
    activityTypeId: input.activityTypeId,
    activityTypeName: input.activityTypeName,
    activityIcon: input.activityIcon,
    category: input.category,
    postedBy: {
      name: input.postedByName || 'Center Staff',
      role: input.postedByRole || 'Staff',
      avatar: '',
    },
    createdDate: todayKey(now),
    createdTime: formatTime(now),
    room: input.room || '—',
    visibility: input.visibility,
    status: input.status,
    scheduledDate: isScheduled ? input.scheduledDate : undefined,
    scheduledTime: isScheduled ? input.scheduledTime : undefined,
    scheduledTimestamp: isScheduled ? input.scheduledTimestamp : undefined,
    isPinned: Boolean(input.isPinned),
    labels: [],
    content: input.content.trim(),
    attachments: input.attachments?.length ? input.attachments : undefined,
    voiceNote: input.voiceNote || undefined,
    youtubePreview: input.youtubePreview || undefined,
    studentCount: input.studentIds.length,
    audienceStudents: [...input.studentIds],
    notifyStaff: Boolean(input.notifyStaff),
    enableComments: input.enableComments !== false,
    allowParentReactions: input.allowParentReactions !== false,
    sendPushNotification: input.sendPushNotification !== false,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    isLikedByMe: false,
    isBookmarkedByMe: false,
  };

  const posts = loadActivityPosts();
  writePosts([post, ...posts]);
  if (post.status === 'posted') {
    appendActivityMediaToStudentGalleries(input.studentIds, {
      attachments: input.attachments ?? [],
      youtubePreview: input.youtubePreview,
      title: post.title,
      activityTypeName: post.activityTypeName,
    });
  }
  return post;
}

export function getActivityPostById(id: string): ActivityPost | undefined {
  return loadActivityPosts().find((p) => p.id === id);
}

/** Update an existing activity post while preserving engagement metadata. */
export function updateCenterActivityPost(
  id: string,
  input: PublishCenterActivityInput,
): ActivityPost | null {
  const posts = loadActivityPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index < 0) return null;

  const existing = posts[index];
  const isScheduled = input.status === 'scheduled';
  const updated: ActivityPost = {
    ...existing,
    title: input.title.trim() || `${input.activityTypeName} update`,
    activityTypeId: input.activityTypeId,
    activityTypeName: input.activityTypeName,
    activityIcon: input.activityIcon,
    category: input.category,
    room: input.room || '—',
    visibility: input.visibility,
    status: input.status,
    scheduledDate: isScheduled ? input.scheduledDate : undefined,
    scheduledTime: isScheduled ? input.scheduledTime : undefined,
    scheduledTimestamp: isScheduled ? input.scheduledTimestamp : undefined,
    isPinned: Boolean(input.isPinned),
    content: input.content.trim(),
    attachments: input.attachments?.length ? input.attachments : undefined,
    voiceNote: input.voiceNote || undefined,
    youtubePreview: input.youtubePreview || undefined,
    studentCount: input.studentIds.length,
    audienceStudents: [...input.studentIds],
    notifyStaff: Boolean(input.notifyStaff),
    enableComments: input.enableComments !== false,
    allowParentReactions: input.allowParentReactions !== false,
    sendPushNotification: input.sendPushNotification !== false,
  };

  const next = [...posts];
  next[index] = updated;
  writePosts(next);
  return updated;
}

/** Image/video (and YouTube) items from activity posts for a student. */
export type ActivityGalleryMedia = {
  id: string;
  type: 'Photo' | 'Video';
  name: string;
  url: string;
  thumbnail?: string;
  postId: string;
  postTitle: string;
  activityTypeName: string;
  createdDate: string;
};

export function listActivityMediaForStudent(
  studentId: string,
  opts?: { parentsOnly?: boolean },
): ActivityGalleryMedia[] {
  if (!studentId) return [];
  const list: ActivityGalleryMedia[] = [];
  for (const post of loadActivityPosts()) {
    if (post.isArchived) continue;
    if (post.status !== 'posted') continue;
    if (!post.audienceStudents?.includes(studentId)) continue;
    if (opts?.parentsOnly && post.visibility === 'staff_only') continue;

    for (const att of post.attachments ?? []) {
      if (att.type !== 'image' && att.type !== 'video') continue;
      if (!att.url || att.url === '#') continue;
      list.push({
        id: `${post.id}-${att.id}`,
        type: att.type === 'video' ? 'Video' : 'Photo',
        name: att.name || post.title,
        url: att.url,
        thumbnail: att.thumbnail,
        postId: post.id,
        postTitle: post.title,
        activityTypeName: post.activityTypeName,
        createdDate: post.createdDate,
      });
    }

    if (post.youtubePreview?.thumbnail || post.youtubePreview?.url) {
      const yt = post.youtubePreview;
      list.push({
        id: `${post.id}-yt`,
        type: 'Video',
        name: yt.title || `${post.title} (YouTube)`,
        url: yt.url,
        thumbnail: yt.thumbnail,
        postId: post.id,
        postTitle: post.title,
        activityTypeName: post.activityTypeName,
        createdDate: post.createdDate,
      });
    }
  }
  return list;
}

function appendActivityMediaToStudentGalleries(
  studentIds: string[],
  input: {
    attachments: ActivityAttachment[];
    youtubePreview?: YoutubePreviewData | null;
    title: string;
    activityTypeName: string;
  },
) {
  const ids = [...new Set(studentIds.filter(Boolean))];
  if (!ids.length) return;

  const additions: Array<{ id: string; type: 'Photo' | 'Video'; name: string; url: string }> = [];
  for (const att of input.attachments) {
    if (att.type !== 'image' && att.type !== 'video') continue;
    if (!att.url || att.url === '#') continue;
    additions.push({
      id: att.id,
      type: att.type === 'video' ? 'Video' : 'Photo',
      name: att.name || input.title,
      url: att.url,
    });
  }
  if (input.youtubePreview?.url) {
    additions.push({
      id: `yt-${Date.now()}`,
      type: 'Video',
      name: input.youtubePreview.title || `${input.title} (YouTube)`,
      url: input.youtubePreview.thumbnail || input.youtubePreview.url,
    });
  }
  if (!additions.length) return;

  const students = loadStudents();
  const idSet = new Set(ids);
  const next = students.map((s) => {
    if (!idSet.has(s.id)) return s;
    const existing = new Set((s.gallery ?? []).map((g) => g.id));
    const fresh = additions
      .map((a) => ({
        id: `gal-${s.id}-${a.id}`,
        type: a.type,
        name: a.name,
        url: a.url,
        favourite: false as boolean | undefined,
      }))
      .filter((g) => !existing.has(g.id));
    if (!fresh.length) return s;
    return { ...s, gallery: [...fresh, ...(s.gallery ?? [])] };
  });
  saveStudents(next);
}

export function updateActivityPosts(updater: (prev: ActivityPost[]) => ActivityPost[]) {
  const next = updater(loadActivityPosts());
  writePosts(next);
  return next;
}

export type DashboardActivitySummary = {
  incidents: number;
  photos: number;
  videos: number;
  announcements: number;
  approvalPending: number;
};

function isTodayPost(post: ActivityPost, dateKey: string) {
  if (post.isArchived) return false;
  if (post.status === 'posted') return post.createdDate === dateKey;
  if (post.status === 'scheduled') {
    return (post.scheduledDate || post.createdDate) === dateKey;
  }
  return false;
}

/** Counts for Dashboard “Daily Activities” from real published posts. */
export function buildDashboardActivitySummary(
  dateKey = todayKey(),
): DashboardActivitySummary {
  const posts = loadActivityPosts().filter((p) => isTodayPost(p, dateKey));
  const posted = posts.filter((p) => p.status === 'posted');

  const hasImage = (p: ActivityPost) =>
    p.activityTypeId === 'photo' ||
    Boolean(p.attachments?.some((a) => a.type === 'image'));
  const hasVideo = (p: ActivityPost) =>
    p.activityTypeId === 'video' ||
    Boolean(p.attachments?.some((a) => a.type === 'video'));

  return {
    incidents: posted.filter((p) =>
      ['incident', 'accident', 'medical-log'].includes(p.activityTypeId),
    ).length,
    photos: posted.filter(hasImage).length,
    videos: posted.filter(hasVideo).length,
    announcements: posted.filter((p) => p.activityTypeId === 'announcement').length,
    approvalPending: posts.filter((p) => p.status === 'scheduled').length,
  };
}

/** Today’s posted activity count (for Today’s summary “Posts”). */
export function countTodayPostedActivities(dateKey = todayKey()) {
  return loadActivityPosts().filter(
    (p) => !p.isArchived && p.status === 'posted' && p.createdDate === dateKey,
  ).length;
}

/** Recent feed items for Dashboard, newest first. */
export function buildDashboardRecentActivities(limit = 8) {
  return loadActivityPosts()
    .filter((p) => !p.isArchived && p.status === 'posted')
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${p.room} · ${p.visibility === 'staff_only' ? 'Staff only' : 'Parents'} · ${p.activityTypeName}`,
      time: `${p.createdDate} ${p.createdTime}`,
      tone: (['incident', 'accident'].includes(p.activityTypeId)
        ? 'danger'
        : p.activityTypeId === 'announcement'
          ? 'warning'
          : 'info') as 'info' | 'success' | 'warning' | 'danger',
    }));
}
