export type ActivityCategoryName =
  | 'Communication'
  | 'Care & Health'
  | 'Learning & Development'
  | 'Creative & Play';

export interface ActivityTypeDefinition {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji fallback
  category: ActivityCategoryName;
  description: string;
  color: string; // Badge gradient or Tailwind color string
  bgColor: string;
}

export type VisibilityType = 'parents' | 'staff_only';
export type ActivityStatus = 'posted' | 'scheduled';
export type PostingType = 'post_now' | 'schedule';

export interface ActivityAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'document' | 'audio';
  url: string;
  size?: string;
  thumbnail?: string;
}

export interface VoiceNoteData {
  id: string;
  duration: string; // e.g. "0:45"
  audioUrl?: string;
  recordedAt: string;
}

export interface YoutubePreviewData {
  url: string;
  videoId: string;
  title: string;
  thumbnail: string;
}

export interface ActivityComment {
  id: string;
  authorName: string;
  authorRole: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface ActivityViewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  viewedAt: string;
}

export interface ActivityPost {
  /** Soft-removed from feed when archived (UI only). */
  isArchived?: boolean;
  id: string;
  title: string;
  activityTypeId: string;
  activityTypeName: string;
  activityIcon: string;
  category: ActivityCategoryName;
  postedBy: {
    name: string;
    role: string;
    avatar: string;
  };
  createdDate: string;
  createdTime: string;
  room: string;
  visibility: VisibilityType;
  status: ActivityStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledTimestamp?: number; // for live countdowns
  isPinned?: boolean;
  isFeatured?: boolean;
  labels: string[];
  content: string;
  attachments?: ActivityAttachment[];
  voiceNote?: VoiceNoteData;
  youtubePreview?: YoutubePreviewData;
  studentCount: number;
  audienceRooms?: string[];
  audienceStudents?: string[];
  notifyStaff: boolean;
  enableComments: boolean;
  allowParentReactions: boolean;
  sendPushNotification: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
}

export interface StudentOption {
  id: string;
  name: string;
  room: string;
  avatarColor: string;
}

export interface RoomOption {
  id: string;
  name: string;
  studentCount: number;
}

export interface ActivityFilterState {
  search: string;
  room: string;
  activityType: string;
  visibility: string;
  status: string;
  quickChip: string | null;
}

/** Keys for advanced-option toggles in Post Activity dialog */
export type AdvancedToggleKey =
  | 'notifyStaff'
  | 'enableComments'
  | 'staffOnly'
  | 'isPinned'
  | 'isFeatured'
  | 'allowParentReactions'
  | 'sendPushNotification';
