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

export type StaffDepartment =
  | 'Teaching'
  | 'Administration'
  | 'Transport'
  | 'Accounts'
  | 'Reception'
  | 'HR'
  | 'Management'
  | 'Science'
  | 'Mathematics'
  | 'Sports'
  | 'Events';

export type SidebarSection =
  | 'recent'
  | 'groups'
  | 'pinned'
  | 'archived'
  | 'unread'
  | 'online'
  | 'departments'
  | 'favourites';

export type FilterKey =
  | 'all'
  | 'unread'
  | 'online'
  | 'departments'
  | 'teaching'
  | 'administration'
  | 'transport'
  | 'accounts'
  | 'reception'
  | 'hr'
  | 'management'
  | 'archived'
  | 'pinned'
  | 'muted'
  | 'groups'
  | 'attachments';

export type StaffMember = {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: StaffDepartment;
  email: string;
  phone: string;
  avatar: string;
  online: boolean;
  lastActive: string;
  joinedDate: string;
  role: string;
};

export type Conversation = {
  id: string;
  kind: ConversationKind;
  staffName: string;
  employeeId: string;
  designation: string;
  department: StaffDepartment;
  role: string;
  avatar: string;
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
  joinedDate: string;
  groupName?: string;
  groupDescription?: string;
  groupColor?: string;
  createdBy?: string;
  createdDate?: string;
  members?: GroupMember[];
  memberCount?: number;
  mediaCount: number;
  fileCount: number;
  linkCount: number;
};
