// Shared messaging primitives used by both parent-messages and staff-messages.
// Flavor-specific types (Conversation, FilterKey, SidebarSection, contacts)
// stay in each feature's local types.ts.

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType =
  | 'text'
  | 'emoji'
  | 'image'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'zip'
  | 'audio'
  | 'video'
  | 'voice'
  | 'location'
  | 'contact'
  | 'sticker'
  | 'gif'
  | 'system'
  | 'deleted'
  | 'link'
  | 'announcement';

export type ConversationKind = 'direct' | 'group';

export type ChatMessage = {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  mine: boolean;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  status: MessageStatus;
  edited?: boolean;
  forwarded?: boolean;
  deleted?: boolean;
  pinned?: boolean;
  replyTo?: { id: string; preview: string; senderName: string };
  reactions?: { emoji: string; count: number; mine?: boolean }[];
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  duration?: string;
  linkMeta?: { title: string; description: string; domain: string };
  locationMeta?: { label: string; address: string };
  contactMeta?: { name: string; phone: string };
};

export type GroupMember = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  avatar: string;
  joinedAt: string;
  kind?: 'parent' | 'staff';
  designation?: string;
  department?: string;
};

export type ToastItem = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

export type ReplyDraft = {
  id: string;
  preview: string;
  senderName: string;
} | null;
