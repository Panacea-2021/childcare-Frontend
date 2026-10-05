'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Image as ImageIcon,
  Languages,
  Loader2,
  MessageCircle,
  Mic,
  Send,
  Smile,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Student, StudentParent } from '@/lib/center-management/types';
import { initials } from '@/lib/center-management/studentsStore';
import {
  createOrGetConversation,
  getConversationMessages,
  sendParentMessage,
  suggestReply,
  subscribeParentMessaging,
  subscribeTyping,
  translateMessage,
  type ConversationKind,
  type ParentChatMessage,
  type ParentConversation,
} from '@/lib/center-management/parentMessagingStore';
import './message-parents.css';

type Tab = 'shared' | 'direct';
type SelectKey = 'mother' | 'father' | 'both';

type Props = {
  open: boolean;
  student: Student;
  onClose: () => void;
  onToast: (type: 'ok' | 'err', message: string) => void;
};

type ChatMeta = {
  conversation: ParentConversation;
  title: string;
  subtitle: string;
  startedLabel: string;
  avatarLabel: string;
  isGroup: boolean;
  parentNames: string[];
};

const EMOJIS = ['😊', '👍', '❤️', '🎉', '🙏', '😄', '👏', '⭐', '📚', '✅'];

function motherOf(parents: StudentParent[]) {
  return parents.find((p) => p.role === 'Mother') ?? null;
}

function fatherOf(parents: StudentParent[]) {
  return parents.find((p) => p.role === 'Father') ?? null;
}

function resolveParents(key: SelectKey, mother: StudentParent | null, father: StudentParent | null) {
  if (key === 'mother') return mother ? [mother] : [];
  if (key === 'father') return father ? [father] : [];
  return [mother, father].filter(Boolean) as StudentParent[];
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function MessageParentsFlow({ open, student, onClose, onToast }: Props) {
  const [step, setStep] = useState<'select' | 'chat'>('select');
  const [tab, setTab] = useState<Tab>('shared');
  const [selection, setSelection] = useState<SelectKey | null>(null);
  const [starting, setStarting] = useState(false);
  const [chat, setChat] = useState<ChatMeta | null>(null);
  const [messages, setMessages] = useState<ParentChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<'translate' | 'ai' | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mother = useMemo(() => motherOf(student.parents ?? []), [student.parents]);
  const father = useMemo(() => fatherOf(student.parents ?? []), [student.parents]);
  const hasParents = Boolean(mother || father);

  const reset = useCallback(() => {
    setStep('select');
    setTab('shared');
    setSelection(null);
    setStarting(false);
    setChat(null);
    setMessages([]);
    setDraft('');
    setSending(false);
    setLoadingMsgs(false);
    setIsTyping(false);
    setEmojiOpen(false);
    setBusyAction(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (tab === 'direct' && selection === 'both') setSelection(null);
  }, [tab, selection]);

  const selectedParents = useMemo(() => {
    if (!selection) return [];
    return resolveParents(selection, mother, father);
  }, [selection, mother, father]);

  const canStart = hasParents && selectedParents.length > 0 && !starting;

  const buildChatMeta = (conversation: ParentConversation, parents: StudentParent[]): ChatMeta => {
    const names = parents.map((p) => p.name);
    const isGroup = parents.length > 1;
    const title = names.join(', ');
    const subtitle =
      parents.length > 1
        ? `Parents of ${student.name}`
        : `${parents[0]?.role ?? 'Parent'} of ${student.name}`;
    return {
      conversation,
      title,
      subtitle,
      startedLabel: `Chat started with ${title}`,
      avatarLabel: isGroup ? '' : initials(parents[0]?.name ?? 'P'),
      isGroup,
      parentNames: names,
    };
  };

  const loadMessages = async (conversationId: string) => {
    setLoadingMsgs(true);
    try {
      const list = await getConversationMessages(conversationId);
      setMessages(list);
    } catch {
      onToast('err', 'Could not load messages. Try again.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const startChat = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const type: ConversationKind = tab === 'shared' ? 'SHARED' : 'DIRECT';
      const parentIds =
        tab === 'direct'
          ? [selectedParents[0]!.id]
          : selection === 'both'
            ? selectedParents.map((p) => p.id)
            : [selectedParents[0]!.id];

      const { conversation, created } = await createOrGetConversation({
        studentId: student.id,
        parentIds,
        type,
      });

      const parents =
        tab === 'direct'
          ? [selectedParents[0]!]
          : selection === 'both'
            ? selectedParents
            : selectedParents.slice(0, 1);

      const meta = buildChatMeta(conversation, parents);
      setChat(meta);
      setStep('chat');
      await loadMessages(conversation.id);
      onToast(
        'ok',
        created ? 'Conversation started' : 'Opened existing conversation',
      );
      window.setTimeout(() => inputRef.current?.focus(), 80);
    } catch (err) {
      onToast('err', err instanceof Error ? err.message : 'Could not start chat');
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!chat) return;
    const unsubStore = subscribeParentMessaging(() => {
      void getConversationMessages(chat.conversation.id).then(setMessages);
    });
    const unsubTyping = subscribeTyping((id, typing) => {
      if (id === chat.conversation.id) setIsTyping(typing);
    });
    return () => {
      unsubStore();
      unsubTyping();
    };
  }, [chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, step]);

  const send = async () => {
    if (!chat || !draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    setEmojiOpen(false);
    setSending(true);
    try {
      await sendParentMessage({
        conversationId: chat.conversation.id,
        message: text,
        type: 'TEXT',
      });
    } catch (err) {
      setDraft(text);
      onToast('err', err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onTranslate = async () => {
    if (!draft.trim() || busyAction) return;
    setBusyAction('translate');
    try {
      const next = await translateMessage(draft);
      setDraft(next);
      onToast('ok', 'Message translated');
    } catch {
      onToast('err', 'Translation failed');
    } finally {
      setBusyAction(null);
    }
  };

  const onAiSuggest = async () => {
    if (!chat || busyAction) return;
    setBusyAction('ai');
    try {
      const suggestion = await suggestReply({
        studentName: student.name,
        parentNames: chat.parentNames,
      });
      setDraft(suggestion);
      onToast('ok', 'AI suggestion ready');
      inputRef.current?.focus();
    } catch {
      onToast('err', 'Could not generate suggestion');
    } finally {
      setBusyAction(null);
    }
  };

  const onAttach = (file: File | null) => {
    if (!file || !chat) return;
    void sendParentMessage({
      conversationId: chat.conversation.id,
      message: `📎 ${file.name}`,
      type: 'IMAGE',
    }).catch(() => onToast('err', 'Could not send attachment'));
  };

  const selectOptions = useMemo(() => {
    const rows: {
      key: SelectKey;
      name: string;
      role: string;
      disabled: boolean;
      avatar: ReactNode;
    }[] = [];

    if (mother) {
      rows.push({
        key: 'mother',
        name: mother.name,
        role: 'Mother',
        disabled: false,
        avatar: <span className="mpm-avatar">{initials(mother.name)}</span>,
      });
    }
    if (father) {
      rows.push({
        key: 'father',
        name: father.name,
        role: 'Father',
        disabled: false,
        avatar: <span className="mpm-avatar">{initials(father.name)}</span>,
      });
    }
    if (tab === 'shared' && (mother || father)) {
      rows.push({
        key: 'both',
        name: 'Both Parents',
        role: mother && father ? 'Mother & Father' : 'Available parents',
        disabled: !(mother && father),
        avatar: (
          <span className="mpm-avatar mpm-avatar-group">
            <Users size={18} />
          </span>
        ),
      });
    }
    return rows;
  }, [mother, father, tab]);

  /* ——— Selection modal ——— */
  if (step === 'select') {
    return (
      <Modal
        open={open}
        title="Message Parents"
        onClose={handleClose}
        icon={<MessageCircle size={18} />}
        iconClose
        className="mpm-select-modal"
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary mpm-start-btn"
              disabled={!canStart}
              onClick={() => void startChat()}
            >
              {starting ? <Loader2 size={15} className="mpm-spin" /> : <MessageCircle size={15} />}
              Start Chat
            </button>
          </>
        }
      >
        <div className="mpm-tabs" role="tablist">
          {(['shared', 'direct'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? 'is-active' : ''}
              onClick={() => setTab(t)}
            >
              {t === 'shared' ? 'Shared' : 'Direct'}
              {tab === t ? (
                <motion.span
                  className="mpm-tab-underline"
                  layoutId="mpm-tab-underline"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          ))}
        </div>

        {!hasParents ? (
          <div className="mpm-empty">
            <Users size={28} />
            <strong>No parents linked</strong>
            <p>Add a mother or father on this profile to start messaging.</p>
          </div>
        ) : (
          <div className="mpm-options">
            <AnimatePresence mode="popLayout">
              {selectOptions.map((opt, i) => {
                const active = selection === opt.key;
                return (
                  <motion.button
                    key={opt.key}
                    type="button"
                    className={`mpm-option${active ? ' is-selected' : ''}${opt.disabled ? ' is-disabled' : ''}`}
                    disabled={opt.disabled}
                    onClick={() => setSelection(opt.key)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={opt.disabled ? undefined : { y: -2, scale: 1.01 }}
                    whileTap={opt.disabled ? undefined : { scale: 0.99 }}
                  >
                    <span className={`mpm-radio${active ? ' is-on' : ''}`} aria-hidden />
                    {opt.avatar}
                    <span className="mpm-option-copy">
                      <strong>{opt.name}</strong>
                      <em>{opt.role}</em>
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            <p className="mpm-hint">
              {tab === 'shared'
                ? 'Shared chats keep both parents in one thread when you pick Both Parents.'
                : 'Direct chats are private — one parent per conversation.'}
            </p>
          </div>
        )}
      </Modal>
    );
  }

  /* ——— Chat modal ——— */
  return (
    <Modal
      open={open}
      title={chat?.title ?? 'Chat'}
      onClose={handleClose}
      iconClose
      elevated
      wide
      className="mpm-chat-modal"
    >
      <div className="mpm-chat">
        <header className="mpm-chat-head">
          <button
            type="button"
            className="mpm-icon-btn"
            aria-label="Back"
            onClick={() => {
              setStep('select');
              setChat(null);
              setMessages([]);
              setDraft('');
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className={`mpm-chat-avatar${chat?.isGroup ? ' is-group' : ''}`}>
            {chat?.isGroup ? <Users size={18} /> : chat?.avatarLabel}
          </div>
          <div className="mpm-chat-head-copy">
            <strong>{chat?.title}</strong>
            <span>{chat?.subtitle}</span>
          </div>
          <button
            type="button"
            className="mpm-icon-btn"
            aria-label="Close"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="mpm-chat-body">
          {loadingMsgs ? (
            <div className="mpm-loading">
              <Loader2 size={20} className="mpm-spin" /> Loading messages…
            </div>
          ) : (
            <>
              <div className="mpm-started-pill">{chat?.startedLabel}</div>
              {messages
                .filter((m) => m.senderRole !== 'system')
                .map((m) => (
                  <motion.div
                    key={m.id}
                    className={`mpm-bubble-row${m.senderRole === 'admin' ? ' is-mine' : ''}`}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <div
                      className={`mpm-bubble${m.senderRole === 'admin' ? ' is-mine' : ''}${m.status === 'failed' ? ' is-failed' : ''}`}
                    >
                      <p>{m.message}</p>
                      <footer>
                        <time>{formatTime(m.timestamp)}</time>
                        {m.senderRole === 'admin' ? (
                          <span className="mpm-status">
                            {m.status === 'failed'
                              ? 'Failed'
                              : m.status === 'seen'
                                ? 'Seen'
                                : m.status === 'delivered'
                                  ? 'Delivered'
                                  : m.status === 'sending'
                                    ? 'Sending…'
                                    : 'Sent'}
                          </span>
                        ) : null}
                      </footer>
                    </div>
                  </motion.div>
                ))}
              {isTyping ? (
                <div className="mpm-typing">
                  <span />
                  <span />
                  <span />
                  Parent is typing…
                </div>
              ) : null}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <div className="mpm-composer">
          <textarea
            ref={inputRef}
            className="mpm-input"
            rows={2}
            placeholder="Type your message here"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="mpm-composer-bar">
            <div className="mpm-composer-left">
              <button
                type="button"
                className="mpm-tool"
                aria-label="Attach image"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon size={18} />
              </button>
              <div className="mpm-emoji-wrap">
                <button
                  type="button"
                  className="mpm-tool"
                  aria-label="Emoji"
                  onClick={() => setEmojiOpen((v) => !v)}
                >
                  <Smile size={18} />
                </button>
                <AnimatePresence>
                  {emojiOpen ? (
                    <motion.div
                      className="mpm-emoji-pop"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                    >
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => {
                            setDraft((d) => `${d}${e}`);
                            setEmojiOpen(false);
                            inputRef.current?.focus();
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <button
                type="button"
                className="mpm-tool"
                aria-label="Voice message"
                onClick={() => onToast('ok', 'Voice recording coming soon')}
              >
                <Mic size={18} />
              </button>
            </div>
            <div className="mpm-composer-right">
              <button
                type="button"
                className="mpm-chip mpm-chip-translate"
                disabled={!draft.trim() || busyAction !== null}
                onClick={() => void onTranslate()}
              >
                {busyAction === 'translate' ? (
                  <Loader2 size={14} className="mpm-spin" />
                ) : (
                  <Languages size={14} />
                )}
                Translate
              </button>
              <button
                type="button"
                className="mpm-chip mpm-chip-ai"
                disabled={busyAction !== null}
                onClick={() => void onAiSuggest()}
              >
                {busyAction === 'ai' ? (
                  <Loader2 size={14} className="mpm-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                AI Suggestion
              </button>
              <button
                type="button"
                className="mpm-send"
                aria-label="Send"
                disabled={!draft.trim() || sending}
                onClick={() => void send()}
              >
                {sending ? <Loader2 size={18} className="mpm-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onAttach(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
