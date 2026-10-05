/**
 * Parent Portal messaging store (localStorage).
 * Adapter layer until real Shared/Direct/Group APIs exist.
 * Service methods mirror future REST contracts; translate/AI are isolated mocks.
 */

export type ParentMsgChannel = 'shared' | 'direct' | 'group';
export type ParentMsgType = 'text' | 'image' | 'voice' | 'system';
export type ParentMsgStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ParentMsgParticipant = {
  id: string;
  name: string;
  role: 'parent' | 'staff' | 'system';
  avatarUrl?: string;
  title?: string;
};

export type ParentMsgAttachment = {
  id: string;
  name: string;
  url: string;
  mime?: string;
};

export type ParentMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'staff' | 'system';
  type: ParentMsgType;
  text: string;
  attachment?: ParentMsgAttachment;
  createdAt: string;
  status: ParentMsgStatus;
  mine: boolean;
};

export type ParentConversation = {
  id: string;
  studentId: string;
  channel: ParentMsgChannel;
  title: string;
  subtitle?: string;
  participants: ParentMsgParticipant[];
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarTone: number;
};

type StoreShape = {
  conversations: ParentConversation[];
  messages: Record<string, ParentMessage[]>;
  premiumUnlocked: boolean;
};

const STORAGE_KEY = 'panacea.parentPortalMessages.v1';
const SEED_FLAG = 'panacea.parentPortalMessages.seeded.v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeParentPortalMessages(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function readStore(): StoreShape {
  if (!canUseStorage()) {
    return { conversations: [], messages: {}, premiumUnlocked: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [], messages: {}, premiumUnlocked: false };
    const parsed = JSON.parse(raw) as StoreShape;
    return {
      conversations: parsed.conversations ?? [],
      messages: parsed.messages ?? {},
      premiumUnlocked: Boolean(parsed.premiumUnlocked),
    };
  } catch {
    return { conversations: [], messages: {}, premiumUnlocked: false };
  }
}

function writeStore(next: StoreShape) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

function isoHoursAgo(h: number) {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function isoMinutesAgo(m: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

/** Seed demo conversations once per student. */
export function ensureParentMessagesSeed(studentId: string, parentName: string) {
  if (!studentId || !canUseStorage()) return;
  let seeded: string[] = [];
  try {
    seeded = JSON.parse(localStorage.getItem(SEED_FLAG) || '[]') as string[];
  } catch {
    seeded = [];
  }
  if (seeded.includes(studentId)) return;

  const store = readStore();
  const hasForStudent = store.conversations.some((c) => c.studentId === studentId);
  if (hasForStudent) {
    localStorage.setItem(SEED_FLAG, JSON.stringify([...seeded, studentId]));
    return;
  }

  const staffAll: ParentMsgParticipant = {
    id: 'staff-all',
    name: 'All Staff',
    role: 'staff',
    title: 'Center team',
  };
  const staffMalika: ParentMsgParticipant = {
    id: 'staff-malika',
    name: 'Malika Thimisetty',
    role: 'staff',
    title: 'Lead Teacher',
  };
  const staffDarshan: ParentMsgParticipant = {
    id: 'staff-darshan',
    name: 'Darshan',
    role: 'staff',
    title: 'Teacher',
  };
  const parentSelf: ParentMsgParticipant = {
    id: 'parent-self',
    name: parentName || 'Parent',
    role: 'parent',
  };
  const parentLizel: ParentMsgParticipant = {
    id: 'parent-lizel',
    name: 'Lizel',
    role: 'parent',
  };

  const shared1Id = uid('conv');
  const shared2Id = uid('conv');
  const direct1Id = uid('conv');
  const group1Id = uid('conv');

  const conversations: ParentConversation[] = [
    {
      id: shared1Id,
      studentId,
      channel: 'shared',
      title: 'All Staff',
      subtitle: 'Any staff can reply',
      participants: [staffAll, parentSelf],
      lastMessagePreview: 'Hello Ryan',
      lastMessageAt: isoMinutesAgo(15),
      unreadCount: 0,
      avatarTone: 0,
    },
    {
      id: shared2Id,
      studentId,
      channel: 'shared',
      title: 'All Staff, Lizel',
      subtitle: 'Shared with co-parent',
      participants: [staffAll, parentSelf, parentLizel],
      lastMessagePreview: 'Last exchanged message will appear here.',
      lastMessageAt: isoHoursAgo(26),
      unreadCount: 0,
      avatarTone: 1,
    },
    {
      id: direct1Id,
      studentId,
      channel: 'direct',
      title: staffMalika.name,
      subtitle: staffMalika.title,
      participants: [staffMalika, parentSelf],
      lastMessagePreview: 'How are you',
      lastMessageAt: isoMinutesAgo(2),
      unreadCount: 1,
      avatarTone: 2,
    },
    {
      id: group1Id,
      studentId,
      channel: 'group',
      title: 'Room A Parents',
      subtitle: 'Staff & parents',
      participants: [staffMalika, staffDarshan, parentSelf, parentLizel],
      lastMessagePreview: 'Reminder: picture day Friday!',
      lastMessageAt: isoHoursAgo(5),
      unreadCount: 0,
      avatarTone: 3,
    },
  ];

  const messages: Record<string, ParentMessage[]> = {
    [shared1Id]: [
      {
        id: uid('msg'),
        conversationId: shared1Id,
        senderId: staffMalika.id,
        senderName: staffMalika.name,
        senderRole: 'staff',
        type: 'text',
        text: 'Hello Ryan',
        createdAt: isoMinutesAgo(16),
        status: 'read',
        mine: false,
      },
    ],
    [shared2Id]: [],
    [direct1Id]: [
      {
        id: uid('msg'),
        conversationId: direct1Id,
        senderId: staffMalika.id,
        senderName: staffMalika.name,
        senderRole: 'staff',
        type: 'text',
        text: 'How are you',
        createdAt: isoMinutesAgo(3),
        status: 'delivered',
        mine: false,
      },
    ],
    [group1Id]: [
      {
        id: uid('msg'),
        conversationId: group1Id,
        senderId: staffDarshan.id,
        senderName: staffDarshan.name,
        senderRole: 'staff',
        type: 'text',
        text: 'Reminder: picture day Friday!',
        createdAt: isoHoursAgo(5),
        status: 'read',
        mine: false,
      },
    ],
  };

  // Also seed a staff directory contact without prior chat (for "Show all staff")
  const idleDirectId = uid('conv');
  conversations.push({
    id: idleDirectId,
    studentId,
    channel: 'direct',
    title: staffDarshan.name,
    subtitle: staffDarshan.title,
    participants: [staffDarshan, parentSelf],
    lastMessagePreview: 'Last exchanged message will appear here.',
    lastMessageAt: isoHoursAgo(72),
    unreadCount: 0,
    avatarTone: 4,
  });
  messages[idleDirectId] = [];

  store.conversations = [...conversations, ...store.conversations];
  store.messages = { ...store.messages, ...messages };
  writeStore(store);
  localStorage.setItem(SEED_FLAG, JSON.stringify([...seeded, studentId]));
}

export function listParentConversations(
  studentId: string,
  channel: ParentMsgChannel,
): ParentConversation[] {
  return readStore()
    .conversations.filter((c) => c.studentId === studentId && c.channel === channel)
    .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
}

export function getParentConversation(id: string): ParentConversation | undefined {
  return readStore().conversations.find((c) => c.id === id);
}

export function listParentMessages(conversationId: string): ParentMessage[] {
  return [...(readStore().messages[conversationId] ?? [])].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
}

export function unreadTotalForStudent(studentId: string): number {
  return readStore()
    .conversations.filter((c) => c.studentId === studentId)
    .reduce((n, c) => n + c.unreadCount, 0);
}

export function unreadTotalForChannel(studentId: string, channel: ParentMsgChannel): number {
  return readStore()
    .conversations.filter((c) => c.studentId === studentId && c.channel === channel)
    .reduce((n, c) => n + c.unreadCount, 0);
}

export function markConversationRead(conversationId: string) {
  const store = readStore();
  const idx = store.conversations.findIndex((c) => c.id === conversationId);
  if (idx < 0) return;
  if (store.conversations[idx].unreadCount === 0) return;
  store.conversations[idx] = { ...store.conversations[idx], unreadCount: 0 };
  writeStore(store);
}

export async function sendParentPortalMessage(input: {
  conversationId: string;
  parentId: string;
  parentName: string;
  text: string;
  type?: ParentMsgType;
  attachment?: ParentMsgAttachment;
}): Promise<ParentMessage> {
  const text = input.text.trim();
  if (!text && !input.attachment) throw new Error('Message cannot be empty');

  const msg: ParentMessage = {
    id: uid('msg'),
    conversationId: input.conversationId,
    senderId: input.parentId,
    senderName: input.parentName,
    senderRole: 'parent',
    type: input.type ?? (input.attachment ? 'image' : 'text'),
    text: text || (input.attachment ? 'Image shared' : ''),
    attachment: input.attachment,
    createdAt: new Date().toISOString(),
    status: 'sending',
    mine: true,
  };

  const store = readStore();
  const list = store.messages[input.conversationId] ?? [];
  store.messages[input.conversationId] = [...list, msg];
  const cIdx = store.conversations.findIndex((c) => c.id === input.conversationId);
  if (cIdx >= 0) {
    store.conversations[cIdx] = {
      ...store.conversations[cIdx],
      lastMessagePreview: msg.text,
      lastMessageAt: msg.createdAt,
    };
  }
  writeStore(store);

  await delay(180 + Math.random() * 200);
  const next = readStore();
  const msgs = next.messages[input.conversationId] ?? [];
  const i = msgs.findIndex((m) => m.id === msg.id);
  if (i >= 0) {
    msgs[i] = { ...msgs[i], status: 'sent' };
    next.messages[input.conversationId] = [...msgs];
    writeStore(next);
  }

  window.setTimeout(() => {
    const s2 = readStore();
    const m2 = s2.messages[input.conversationId] ?? [];
    const i2 = m2.findIndex((m) => m.id === msg.id);
    if (i2 >= 0) {
      m2[i2] = { ...m2[i2], status: 'delivered' };
      s2.messages[input.conversationId] = [...m2];
      writeStore(s2);
    }
  }, 500);

  return msg;
}

export function isPremiumUnlocked() {
  return readStore().premiumUnlocked;
}

export function setPremiumUnlocked(value: boolean) {
  const store = readStore();
  store.premiumUnlocked = value;
  writeStore(store);
}

/** Isolated translation service — dictionary mock until real API is wired. */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    hello: 'Hola',
    'how are you': '¿Cómo estás?',
    thanks: 'Gracias',
    'thank you': 'Gracias',
    'good morning': 'Buenos días',
    'see you': 'Hasta luego',
  },
  ar: {
    hello: 'مرحبا',
    'how are you': 'كيف حالك؟',
    thanks: 'شكرا',
    'thank you': 'شكرا لك',
    'good morning': 'صباح الخير',
    'see you': 'إلى اللقاء',
  },
  en: {},
};

export async function translateParentText(
  text: string,
  targetLang: string,
): Promise<{ translated: string }> {
  await delay(320 + Math.random() * 180);
  const trimmed = text.trim();
  if (!trimmed) return { translated: '' };

  const dict = TRANSLATIONS[targetLang];
  if (!dict) {
    return { translated: trimmed };
  }
  if (targetLang === 'en') return { translated: trimmed };

  const key = trimmed.toLowerCase();
  if (dict[key]) return { translated: dict[key] };

  // Word-by-word fallback for known tokens
  const words = trimmed.split(/(\s+)/);
  const out = words
    .map((w) => {
      const k = w.toLowerCase();
      return dict[k] ?? w;
    })
    .join('');
  if (out !== trimmed) return { translated: out };

  // Honest fallback — not pretending full MT
  return {
    translated:
      targetLang === 'es'
        ? `${trimmed} (ES)`
        : targetLang === 'ar'
          ? `${trimmed} (AR)`
          : trimmed,
  };
}

export type AiTone = 'friendly' | 'happy' | 'formal';

/** Isolated AI rewrite service — template mock until real API exists. */
export async function rewriteParentMessage(
  text: string,
  tone: AiTone,
): Promise<{ suggestion: string }> {
  await delay(480 + Math.random() * 280);
  const base = text.trim();
  if (!base) {
    return {
      suggestion:
        tone === 'formal'
          ? 'Hello, I hope you are well. I wanted to check in regarding my child today.'
          : tone === 'happy'
            ? 'Hi! Just wanted to say thank you — hoping my little one had a wonderful day! 😊'
            : 'Hi there! Just checking in — how is my child doing today?',
    };
  }
  if (tone === 'formal') {
    return {
      suggestion: `Hello,\n\nI hope this message finds you well. ${base.replace(/\s+/g, ' ').trim()}\n\nThank you for your time and support.`,
    };
  }
  if (tone === 'happy') {
    return {
      suggestion: `${base.trim()}${/[.!?]$/.test(base.trim()) ? '' : '!'} Looking forward to hearing from you 😊`,
    };
  }
  return {
    suggestion: base.trim().replace(/^(hi|hello)[,!]?\s*/i, 'Hi! '),
  };
}

export function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatMsgListTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return 'Just now';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return formatMsgTime(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatMsgDayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function dayKeyFromMsg(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
