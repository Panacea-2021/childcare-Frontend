import type { ChatMessage, Conversation, FilterKey, MessageType, SidebarSection } from './types';

export function avatarTone(seed: string): string {
  const n = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5;
  return n === 0 ? '' : `tone-${n + 1}`;
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function previewForType(type: MessageType, content: string): string {
  switch (type) {
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎬 Video';
    case 'voice':
      return '🎤 Voice message';
    case 'audio':
      return '🎧 Audio';
    case 'pdf':
      return `📎 ${content || 'PDF'}`;
    case 'word':
    case 'excel':
    case 'powerpoint':
    case 'zip':
      return `📎 ${content || 'Document'}`;
    case 'location':
      return '📍 Location';
    case 'contact':
      return '👤 Contact';
    case 'sticker':
    case 'gif':
    case 'emoji':
      return content;
    case 'deleted':
      return 'This message was deleted';
    case 'link':
      return content;
    default:
      return content;
  }
}

export function matchesSearch(c: Conversation, q: string): boolean {
  if (!q.trim()) return true;
  const hay = [
    c.parentName,
    c.studentName,
    c.admissionNo,
    c.className,
    c.section,
    c.phone,
    c.groupName ?? '',
    c.lastMessage,
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(q.trim().toLowerCase());
}

export function applySection(list: Conversation[], section: SidebarSection): Conversation[] {
  switch (section) {
    case 'groups':
      return list.filter((c) => c.kind === 'group' && !c.archived);
    case 'pinned':
      return list.filter((c) => c.pinned && !c.archived);
    case 'archived':
      return list.filter((c) => c.archived);
    case 'unread':
      return list.filter((c) => c.unread > 0 && !c.archived);
    case 'online':
      return list.filter((c) => c.online && c.kind === 'direct' && !c.archived);
    case 'contacts':
      return list.filter((c) => c.kind === 'direct' && !c.archived);
    case 'favourites':
      return list.filter((c) => c.favourite && !c.archived);
    case 'recent':
    default:
      return list.filter((c) => !c.archived);
  }
}

export function applyFilters(list: Conversation[], filters: FilterKey[], classFilter: string, sectionFilter: string): Conversation[] {
  return list.filter((c) => {
    if (classFilter !== 'all' && c.className !== classFilter) return false;
    if (sectionFilter !== 'all' && c.section !== sectionFilter) return false;
    for (const f of filters) {
      if (f === 'all') continue;
      if (f === 'unread' && c.unread <= 0) return false;
      if (f === 'groups' && c.kind !== 'group') return false;
      if (f === 'archived' && !c.archived) return false;
      if (f === 'online' && !c.online) return false;
      if (f === 'attachments' && c.fileCount + c.mediaCount <= 0) return false;
      if (f === 'pinned' && !c.pinned) return false;
      if (f === 'muted' && !c.muted) return false;
      if (f === 'student' && !c.studentName) return false;
      if (f === 'parent' && c.kind !== 'direct') return false;
    }
    return true;
  });
}

export function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.lastActive.localeCompare(b.lastActive);
  });
}

/** Prefer recent activity order from seed; pinned first. */
export function sortByPinnedThenOrder(list: Conversation[], orderIds: string[]): Conversation[] {
  const rank = new Map(orderIds.map((id, i) => [id, i]));
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99);
  });
}

export function groupMessages(messages: ChatMessage[]) {
  const groups: { key: string; label: string; items: ChatMessage[] }[] = [];
  for (const msg of messages) {
    if (msg.type === 'system') {
      groups.push({ key: msg.id, label: '', items: [msg] });
      continue;
    }
    const key = dayKey(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(msg);
    else groups.push({ key, label: dateSeparatorLabel(msg.timestamp), items: [msg] });
  }
  return groups;
}

export function statusIcon(status: Conversation['status'] | ChatMessage['status']): string {
  if (status === 'sending') return '…';
  if (status === 'sent') return '✓';
  if (status === 'delivered') return '✓✓';
  if (status === 'read') return '✓✓';
  if (status === 'failed') return '!';
  return '';
}
