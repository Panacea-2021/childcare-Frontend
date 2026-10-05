/**
 * Parent messaging mock API — localStorage-backed.
 * Mirrors POST /conversations/create, GET /conversations/:id/messages, POST /messages/send
 * with simulated realtime (message:receive / typing).
 */

export type ParentMessageType = 'TEXT' | 'IMAGE' | 'AUDIO';
export type ConversationKind = 'SHARED' | 'DIRECT';
export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export type ParentConversation = {
  id: string;
  studentId: string;
  parentIds: string[];
  type: ConversationKind;
  createdAt: string;
};

export type ParentChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'admin' | 'parent' | 'system';
  message: string;
  type: ParentMessageType;
  timestamp: string;
  status: MessageDeliveryStatus;
};

type StoreShape = {
  conversations: ParentConversation[];
  messages: Record<string, ParentChatMessage[]>;
};

const STORAGE_KEY = 'panacea.parentMessaging.v1';
const ADMIN_ID = 'admin';

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeParentMessaging(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStore(): StoreShape {
  if (typeof window === 'undefined') return { conversations: [], messages: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [], messages: {} };
    const parsed = JSON.parse(raw) as StoreShape;
    return {
      conversations: parsed.conversations ?? [],
      messages: parsed.messages ?? {},
    };
  } catch {
    return { conversations: [], messages: {} };
  }
}

function writeStore(next: StoreShape) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortIds(ids: string[]) {
  return [...ids].sort();
}

function sameIds(a: string[], b: string[]) {
  const aa = sortIds(a);
  const bb = sortIds(b);
  return aa.length === bb.length && aa.every((id, i) => id === bb[i]);
}

/** Find existing conversation — no duplicates for same student + type + parents */
export function findConversation(
  studentId: string,
  type: ConversationKind,
  parentIds: string[],
): ParentConversation | null {
  const store = readStore();
  return (
    store.conversations.find(
      (c) => c.studentId === studentId && c.type === type && sameIds(c.parentIds, parentIds),
    ) ?? null
  );
}

/**
 * POST /conversations/create — returns existing if already created.
 */
export async function createOrGetConversation(input: {
  studentId: string;
  parentIds: string[];
  type: ConversationKind;
}): Promise<{ conversation: ParentConversation; created: boolean }> {
  await delay(180 + Math.random() * 220);
  if (Math.random() < 0.03) {
    throw new Error('Network error while creating conversation');
  }

  const parentIds = sortIds(input.parentIds.filter(Boolean));
  if (!parentIds.length) throw new Error('At least one parent is required');

  const existing = findConversation(input.studentId, input.type, parentIds);
  if (existing) {
    return { conversation: existing, created: false };
  }

  const conversation: ParentConversation = {
    id: uid('conv'),
    studentId: input.studentId,
    parentIds,
    type: input.type,
    createdAt: new Date().toISOString(),
  };

  const store = readStore();
  store.conversations = [conversation, ...store.conversations];
  store.messages[conversation.id] = [
    {
      id: uid('msg'),
      conversationId: conversation.id,
      senderId: 'system',
      senderRole: 'system',
      message: 'system:started',
      type: 'TEXT',
      timestamp: new Date().toISOString(),
      status: 'seen',
    },
  ];
  writeStore(store);
  return { conversation, created: true };
}

/** GET /conversations/:id/messages */
export async function getConversationMessages(conversationId: string): Promise<ParentChatMessage[]> {
  await delay(120 + Math.random() * 160);
  const store = readStore();
  return [...(store.messages[conversationId] ?? [])];
}

/** POST /messages/send */
export async function sendParentMessage(input: {
  conversationId: string;
  senderId?: string;
  message: string;
  type?: ParentMessageType;
}): Promise<ParentChatMessage> {
  const text = input.message.trim();
  if (!text) throw new Error('Message cannot be empty');

  const optimistic: ParentChatMessage = {
    id: uid('msg'),
    conversationId: input.conversationId,
    senderId: input.senderId ?? ADMIN_ID,
    senderRole: 'admin',
    message: text,
    type: input.type ?? 'TEXT',
    timestamp: new Date().toISOString(),
    status: 'sending',
  };

  const store = readStore();
  const list = store.messages[input.conversationId] ?? [];
  store.messages[input.conversationId] = [...list, optimistic];
  writeStore(store);

  try {
    await delay(200 + Math.random() * 280);
    if (Math.random() < 0.04) throw new Error('Failed to send message');

    const next = readStore();
    const msgs = next.messages[input.conversationId] ?? [];
    const idx = msgs.findIndex((m) => m.id === optimistic.id);
    if (idx >= 0) {
      msgs[idx] = { ...msgs[idx], status: 'sent' };
      next.messages[input.conversationId] = [...msgs];
      writeStore(next);
    }

    window.setTimeout(() => {
      const s2 = readStore();
      const m2 = s2.messages[input.conversationId] ?? [];
      const i2 = m2.findIndex((m) => m.id === optimistic.id);
      if (i2 >= 0) {
        m2[i2] = { ...m2[i2], status: 'delivered' };
        s2.messages[input.conversationId] = [...m2];
        writeStore(s2);
      }
    }, 600);

    // Simulated parent reply (message:receive)
    window.setTimeout(() => {
      simulateParentReply(input.conversationId);
    }, 1400 + Math.random() * 1600);

    return { ...optimistic, status: 'sent' };
  } catch (err) {
    const next = readStore();
    const msgs = next.messages[input.conversationId] ?? [];
    const idx = msgs.findIndex((m) => m.id === optimistic.id);
    if (idx >= 0) {
      msgs[idx] = { ...msgs[idx], status: 'failed' };
      next.messages[input.conversationId] = [...msgs];
      writeStore(next);
    }
    throw err instanceof Error ? err : new Error('Failed to send');
  }
}

function simulateParentReply(conversationId: string) {
  const store = readStore();
  const conv = store.conversations.find((c) => c.id === conversationId);
  if (!conv) return;

  emitTyping(conversationId, true);
  window.setTimeout(() => {
    emitTyping(conversationId, false);
    const reply: ParentChatMessage = {
      id: uid('msg'),
      conversationId,
      senderId: conv.parentIds[0] ?? 'parent',
      senderRole: 'parent',
      message: pickReply(),
      type: 'TEXT',
      timestamp: new Date().toISOString(),
      status: 'seen',
    };
    const s = readStore();
    s.messages[conversationId] = [...(s.messages[conversationId] ?? []), reply];
    writeStore(s);
  }, 900 + Math.random() * 700);
}

const typingMap = new Map<string, boolean>();
const typingListeners = new Set<(conversationId: string, typing: boolean) => void>();

export function subscribeTyping(listener: (conversationId: string, typing: boolean) => void) {
  typingListeners.add(listener);
  return () => typingListeners.delete(listener);
}

function emitTyping(conversationId: string, typing: boolean) {
  typingMap.set(conversationId, typing);
  typingListeners.forEach((l) => l(conversationId, typing));
}

export function isParentTyping(conversationId: string) {
  return typingMap.get(conversationId) ?? false;
}

/** Mock translate API */
export async function translateMessage(text: string): Promise<string> {
  await delay(350);
  if (!text.trim()) return text;
  return `[Translated] ${text.trim()}`;
}

/** Mock AI suggestion API */
export async function suggestReply(context: {
  studentName: string;
  parentNames: string[];
}): Promise<string> {
  await delay(420);
  const parent = context.parentNames[0] ?? 'there';
  return `Hi ${parent}, just a quick update on ${context.studentName} — they had a wonderful day today. Please let us know if you have any questions!`;
}

function pickReply() {
  const options = [
    'Thanks for the update!',
    'Appreciate you letting us know.',
    'Got it — thank you!',
    'Noted. We will check in the evening.',
    'Thank you so much!',
  ];
  return options[Math.floor(Math.random() * options.length)]!;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export { ADMIN_ID };
