import type {
  ConversationKind,
  GroupMember,
  MessageStatus,
  MessageType,
} from '@/types/messaging';

export type {
  MessageStatus,
  MessageType,
  ConversationKind,
  ChatMessage,
  GroupMember,
  ToastItem,
  ReplyDraft,
} from '@/types/messaging';

export type SidebarSection =
  | 'recent'
  | 'groups'
  | 'pinned'
  | 'archived'
  | 'unread'
  | 'online'
  | 'contacts'
  | 'favourites';

export type FilterKey =
  | 'all'
  | 'unread'
  | 'groups'
  | 'archived'
  | 'online'
  | 'attachments'
  | 'pinned'
  | 'muted'
  | 'student'
  | 'parent';

export type ParentContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  avatar: string;
  online: boolean;
  lastActive: string;
};

export type StudentInfo = {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  section: string;
  avatar: string;
};

export type Conversation = {
  id: string;
  kind: ConversationKind;
  parentName: string;
  studentName: string;
  className: string;
  section: string;
  admissionNo: string;
  avatar: string;
  studentAvatar: string;
  lastMessage: string;
  lastMessageType: MessageType;
  lastActive: string;
  unread: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  favourite: boolean;
  online: boolean;
  typing: boolean;
  recording: boolean;
  status: MessageStatus;
  phone: string;
  email: string;
  relationship: string;
  groupName?: string;
  groupDescription?: string;
  groupColor?: string;
  members?: GroupMember[];
  studentCount?: number;
  parentCount?: number;
  mediaCount: number;
  fileCount: number;
  linkCount: number;
};

export type StudentOption = {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  section: string;
  avatar: string;
  parents: ParentContact[];
};
