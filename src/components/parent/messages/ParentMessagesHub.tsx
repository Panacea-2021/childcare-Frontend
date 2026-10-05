'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Info,
  MessageCircle,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useParentStudent } from '../ParentStudentContext';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentPageHeader } from '../shared';
import {
  dayKeyFromMsg,
  ensureParentMessagesSeed,
  formatMsgDayLabel,
  formatMsgListTime,
  formatMsgTime,
  getParentConversation,
  isPremiumUnlocked,
  listParentConversations,
  listParentMessages,
  markConversationRead,
  sendParentPortalMessage,
  setPremiumUnlocked,
  subscribeParentPortalMessages,
  unreadTotalForChannel,
  unreadTotalForStudent,
  type ParentConversation,
  type ParentMessage,
  type ParentMsgChannel,
} from '@/lib/parent/parentMessagesStore';
import { MessageComposer } from './MessageComposer';
import { TranslateModal } from './TranslateModal';
import { AiAssistModal } from './AiAssistModal';
import { PremiumModal } from './PremiumModal';
import { GalleryDrawer } from './GalleryDrawer';
import { TimelineMediaViewer } from '../timeline/TimelineMediaViewer';
import type { ActivityAttachment } from '@/types/activity';
import './parent-messages-hub.css';
import '../timeline/parent-timeline.css';

const TABS: {
  id: ParentMsgChannel;
  label: string;
  hint: string;
}[] = [
  {
    id: 'shared',
    label: 'Shared Message',
    hint: 'Any staff can respond to your messages',
  },
  {
    id: 'direct',
    label: 'Direct Message',
    hint: 'Send one-on-one messages to staff',
  },
  {
    id: 'group',
    label: 'Group Messages',
    hint: 'Group chats with staff and other parents',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function ParentMessagesHub() {
  const { selectedStudent, displayName, session } = useParentStudent();
  const studentId = selectedStudent?.id || '';
  const parentId = session?.email || 'parent-self';
  const parentName = displayName || 'Parent';

  const [tick, setTick] = useState(0);
  const [channel, setChannel] = useState<ParentMsgChannel>('shared');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedByChannel, setSelectedByChannel] = useState<
    Partial<Record<ParentMsgChannel, string>>
  >({});
  const [query, setQuery] = useState('');
  const [listFilter, setListFilter] = useState<'all' | 'unread'>('all');
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [draft, setDraft] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [matchIdx, setMatchIdx] = useState(0);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [viewer, setViewer] = useState<{ items: ActivityAttachment[]; index: number } | null>(
    null,
  );
  const [nearBottom, setNearBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => subscribeParentPortalMessages(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!studentId) return;
    ensureParentMessagesSeed(studentId, parentName);
    setTick((t) => t + 1);
  }, [studentId, parentName]);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(t);
  }, [studentId, channel]);

  useEffect(() => {
    setSelectedId(selectedByChannel[channel] ?? null);
    setQuery('');
    setListFilter('all');
    setChatSearchOpen(false);
    setChatQuery('');
    setGalleryOpen(false);
    setViewer(null);
    setMobileChat(false);
  }, [channel, selectedByChannel]);

  useEffect(() => {
    const active = tabRefs.current[channel];
    const pill = underlineRef.current;
    if (!active || !pill) return;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }, [channel, tick]);

  const conversations = useMemo(() => {
    void tick;
    if (!studentId) return [] as ParentConversation[];
    let list = listParentConversations(studentId, channel);

    if (channel === 'direct' && !showAllStaff) {
      list = list.filter((c) => {
        const msgs = listParentMessages(c.id);
        return msgs.length > 0 || c.unreadCount > 0;
      });
    }

    if (listFilter === 'unread') list = list.filter((c) => c.unreadCount > 0);

    const q = query.trim().toLowerCase();
    if (q) list = list.filter((c) => c.title.toLowerCase().includes(q));
    return list;
  }, [studentId, channel, tick, query, listFilter, showAllStaff]);

  const selected = useMemo(() => {
    void tick;
    return selectedId ? getParentConversation(selectedId) ?? null : null;
  }, [selectedId, tick]);

  const messages = useMemo(() => {
    void tick;
    if (!selectedId) return [] as ParentMessage[];
    return listParentMessages(selectedId);
  }, [selectedId, tick]);

  const mediaMessages = useMemo(
    () => messages.filter((m) => Boolean(m.attachment)),
    [messages],
  );

  const mediaAttachments = useMemo<ActivityAttachment[]>(
    () =>
      mediaMessages
        .filter((m) => m.attachment)
        .map((m) => ({
          id: m.attachment!.id,
          name: m.attachment!.name,
          type: m.attachment!.mime?.startsWith('video') || m.type === 'voice' ? 'video' : 'image',
          url: m.attachment!.url,
          thumbnail: m.attachment!.url,
        })),
    [mediaMessages],
  );

  const openMediaAt = (index: number) => {
    if (!mediaAttachments.length) return;
    setViewer({
      items: mediaAttachments,
      index: Math.max(0, Math.min(index, mediaAttachments.length - 1)),
    });
  };

  const searchMatches = useMemo(() => {
    const q = chatQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return messages.filter((m) => m.text.toLowerCase().includes(q)).map((m) => m.id);
  }, [messages, chatQuery]);

  const channelUnread = useMemo(() => {
    void tick;
    if (!studentId) return { shared: 0, direct: 0, group: 0 };
    return {
      shared: unreadTotalForChannel(studentId, 'shared'),
      direct: unreadTotalForChannel(studentId, 'direct'),
      group: unreadTotalForChannel(studentId, 'group'),
    };
  }, [studentId, tick]);

  const totalUnread = useMemo(() => {
    void tick;
    return studentId ? unreadTotalForStudent(studentId) : 0;
  }, [studentId, tick]);

  const premium = useMemo(() => {
    void tick;
    return isPremiumUnlocked();
  }, [tick]);

  const grouped = useMemo(() => {
    const map = new Map<string, ParentMessage[]>();
    for (const m of messages) {
      const key = dayKeyFromMsg(m.createdAt);
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [messages]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setSelectedByChannel((prev) => ({ ...prev, [channel]: id }));
    markConversationRead(id);
    setMobileChat(true);
    setChatSearchOpen(false);
    setChatQuery('');
    setGalleryOpen(false);
    window.setTimeout(() => scrollToBottom(true), 60);
  };

  const scrollToBottom = (force = false) => {
    const el = threadRef.current;
    if (!el) return;
    if (!force && !nearBottom) {
      setShowJump(true);
      return;
    }
    el.scrollTop = el.scrollHeight;
    setShowJump(false);
  };

  useEffect(() => {
    if (!selectedId) return;
    scrollToBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    if (nearBottom) scrollToBottom(true);
    else setShowJump(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    const id = searchMatches[matchIdx];
    if (!id) return;
    const el = document.getElementById(`msg-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [matchIdx, searchMatches]);

  const activeHint = TABS.find((t) => t.id === channel)?.hint ?? '';

  return (
    <div className="pmh-page">
      <ParentPageHeader
        title="Messages"
        description={
          selectedStudent
            ? `Conversations and updates for ${selectedStudent.name}`
            : 'Message your school and teachers'
        }
        icon={<ParentModuleIcon id="messages" />}
        actions={
          totalUnread > 0 ? (
            <span className="pmh-header-unread" aria-label={`${totalUnread} unread`}>
              {totalUnread}
            </span>
          ) : undefined
        }
      />

      <div className="pmh-tabs" role="tablist" aria-label="Message channels">
        <span className="pmh-tab-underline" ref={underlineRef} aria-hidden />
        {TABS.map((t) => {
          const count = channelUnread[t.id];
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={channel === t.id}
              className={`pmh-tab${channel === t.id ? ' is-active' : ''}`}
              onClick={() => setChannel(t.id)}
            >
              {t.label}
              {count > 0 ? <span className="pmh-tab-badge">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <p className="pmh-hint">
        <Info size={14} aria-hidden />
        {activeHint}
      </p>

      <div className={`pmh-workspace${mobileChat && selected ? ' is-chat-open' : ''}`}>
        <aside className="pmh-list-panel">
          {(channel === 'direct' || channel === 'group') && (
            <div className="pmh-list-tools">
              <label className="pmh-search">
                <Search size={15} aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  aria-label="Search conversations"
                />
              </label>
              <div className="pmh-list-filters">
                <div className="pmh-chip-row">
                  <button
                    type="button"
                    className={`pmh-chip${listFilter === 'all' ? ' is-active' : ''}`}
                    onClick={() => setListFilter('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`pmh-chip${listFilter === 'unread' ? ' is-active' : ''}`}
                    onClick={() => setListFilter('unread')}
                  >
                    Unread
                  </button>
                </div>
                {channel === 'direct' ? (
                  <button
                    type="button"
                    className="pmh-link-btn"
                    onClick={() => setShowAllStaff((v) => !v)}
                  >
                    {showAllStaff ? 'Hide all staff' : 'Show all staff'}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          <div className="pmh-list" role="list">
            {loading ? (
              [0, 1, 2].map((i) => <div key={i} className="pmh-skel-row" />)
            ) : conversations.length === 0 ? (
              <div className="pmh-list-empty">
                <MessageCircle size={22} />
                <p>
                  {query
                    ? 'No results found'
                    : channel === 'group'
                      ? 'No groups available'
                      : channel === 'direct'
                        ? 'No staff members found'
                        : 'No conversations yet'}
                </p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="listitem"
                  className={`pmh-conv${selectedId === c.id ? ' is-selected' : ''}`}
                  onClick={() => selectConversation(c.id)}
                >
                  <span className={`pmh-avatar tone-${c.avatarTone % 5}`}>
                    {c.channel === 'group' ? <Users size={16} /> : c.title.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="pmh-conv-body">
                    <span className="pmh-conv-top">
                      <strong>{c.title}</strong>
                      <time>{formatMsgListTime(c.lastMessageAt)}</time>
                    </span>
                    <span className="pmh-conv-preview">{c.lastMessagePreview}</span>
                  </span>
                  {c.unreadCount > 0 ? (
                    <span className="pmh-unread">{c.unreadCount}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="pmh-chat-panel">
          <div className="pmh-chat-stage">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                className="pmh-chat-empty"
                style={{ width: '100%' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease }}
              >
                <span className="pmh-empty-ico" aria-hidden>
                  <MessageCircle size={28} />
                </span>
                <h3>Select a conversation</h3>
                <p>Choose a chat from the list to start viewing messages.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                className="pmh-chat"
                style={{ width: '100%' }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease }}
              >
                <header className="pmh-chat-head">
                  <button
                    type="button"
                    className="pmh-icon-btn pmh-back"
                    aria-label="Back to list"
                    onClick={() => setMobileChat(false)}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className={`pmh-avatar tone-${selected.avatarTone % 5}`}>
                    {selected.channel === 'group' ? (
                      <Users size={16} />
                    ) : (
                      selected.title.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <div className="pmh-chat-title">
                    <h2>{selected.channel === 'shared' ? 'Message staff' : selected.title}</h2>
                    {selected.channel === 'group' ? (
                      <p>{selected.participants.length} members</p>
                    ) : selected.subtitle ? (
                      <p>{selected.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="pmh-chat-actions">
                    <button
                      type="button"
                      className="pmh-icon-btn"
                      aria-label="Search messages"
                      aria-pressed={chatSearchOpen}
                      onClick={() => setChatSearchOpen((v) => !v)}
                    >
                      <Search size={17} />
                    </button>
                    <button
                      type="button"
                      className="pmh-icon-btn"
                      aria-label="View gallery"
                      aria-pressed={galleryOpen}
                      onClick={() => setGalleryOpen((v) => !v)}
                    >
                      <Info size={17} />
                    </button>
                  </div>
                </header>

                {chatSearchOpen ? (
                  <div className="pmh-chat-search">
                    <Search size={15} aria-hidden />
                    <input
                      value={chatQuery}
                      onChange={(e) => {
                        setChatQuery(e.target.value);
                        setMatchIdx(0);
                      }}
                      placeholder="Search messages…"
                      aria-label="Search in conversation"
                    />
                    {searchMatches.length > 0 ? (
                      <span className="pmh-match-count">
                        {matchIdx + 1}/{searchMatches.length}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="pmh-icon-btn"
                      aria-label="Previous match"
                      disabled={!searchMatches.length}
                      onClick={() =>
                        setMatchIdx((i) =>
                          searchMatches.length
                            ? (i - 1 + searchMatches.length) % searchMatches.length
                            : 0,
                        )
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="pmh-icon-btn"
                      aria-label="Next match"
                      disabled={!searchMatches.length}
                      onClick={() =>
                        setMatchIdx((i) =>
                          searchMatches.length ? (i + 1) % searchMatches.length : 0,
                        )
                      }
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="pmh-icon-btn"
                      aria-label="Close search"
                      onClick={() => {
                        setChatSearchOpen(false);
                        setChatQuery('');
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}

                <div
                  className="pmh-thread"
                  ref={threadRef}
                  onScroll={() => {
                    const el = threadRef.current;
                    if (!el) return;
                    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
                    const near = dist < 80;
                    setNearBottom(near);
                    if (near) setShowJump(false);
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="pmh-thread-empty">
                      <p>Start the conversation</p>
                      <span>Send a friendly hello to begin.</span>
                    </div>
                  ) : (
                    grouped.map(([day, dayMsgs]) => (
                      <div key={day} className="pmh-day">
                        <div className="pmh-day-pill">
                          <span>{formatMsgDayLabel(dayMsgs[0].createdAt)}</span>
                        </div>
                        {dayMsgs.map((m) => {
                          const highlighted =
                            searchMatches.length > 0 &&
                            searchMatches[matchIdx] === m.id;
                          return (
                            <motion.article
                              key={m.id}
                              id={`msg-${m.id}`}
                              className={`pmh-bubble-wrap${m.mine ? ' is-mine' : ''}${highlighted ? ' is-hit' : ''}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease }}
                            >
                              <div className={`pmh-bubble${m.type === 'image' ? ' has-media' : ''}`}>
                                {m.attachment ? (
                                  <button
                                    type="button"
                                    className="pmh-bubble-media"
                                    onClick={() => {
                                      const idx = mediaMessages.findIndex((x) => x.id === m.id);
                                      openMediaAt(idx);
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={m.attachment.url} alt="" />
                                  </button>
                                ) : null}
                                {m.text ? <p>{m.text}</p> : null}
                              </div>
                              <footer>
                                {!m.mine ? <strong>{m.senderName}</strong> : null}
                                {!m.mine ? <span aria-hidden>·</span> : null}
                                <time>{formatMsgTime(m.createdAt)}</time>
                              </footer>
                            </motion.article>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {showJump ? (
                  <button
                    type="button"
                    className="pmh-jump"
                    onClick={() => scrollToBottom(true)}
                  >
                    New messages ↓
                  </button>
                ) : null}

                <MessageComposer
                  draft={draft}
                  onDraftChange={setDraft}
                  onTranslate={() => setTranslateOpen(true)}
                  onAi={() => {
                    if (!premium) {
                      setPremiumOpen(true);
                      return;
                    }
                    setAiOpen(true);
                  }}
                  onSend={async ({ text, image }) => {
                    if (!selectedId) return;
                    let attachment;
                    if (image) {
                      attachment = {
                        id: image.id,
                        name: image.name,
                        url: image.url,
                        mime: image.file.type,
                      };
                    }
                    await sendParentPortalMessage({
                      conversationId: selectedId,
                      parentId,
                      parentName,
                      text,
                      type: attachment ? 'image' : 'text',
                      attachment,
                    });
                    setDraft('');
                    setTick((t) => t + 1);
                    window.setTimeout(() => scrollToBottom(true), 40);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          <GalleryDrawer
            open={galleryOpen}
            items={mediaMessages}
            onClose={() => setGalleryOpen(false)}
            onOpenItem={(i) => openMediaAt(i)}
          />
        </section>
      </div>

      {viewer ? (
        <TimelineMediaViewer
          key={`${viewer.items.map((i) => i.id).join('-')}-${viewer.index}`}
          items={viewer.items}
          startIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      ) : null}

      <TranslateModal
        open={translateOpen}
        initialText={draft}
        onClose={() => setTranslateOpen(false)}
        onAccept={(text) => setDraft(text)}
      />
      <AiAssistModal
        open={aiOpen}
        initialText={draft}
        premiumUnlocked={premium}
        onClose={() => setAiOpen(false)}
        onAccept={(text) => setDraft(text)}
      />
      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onUpgrade={() => {
          setPremiumUnlocked(true);
          setTick((t) => t + 1);
          setAiOpen(true);
        }}
      />
    </div>
  );
}
