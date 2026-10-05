'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  MoreVertical,
  PanelRight,
  Pin,
  Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import type { ChatMessage, Conversation, MessageType, ReplyDraft } from './types';
import { avatarTone, groupMessages } from './utils';

type Props = {
  conversation: Conversation | null;
  messages: ChatMessage[];
  draft: string;
  reply: ReplyDraft;
  showUnreadDivider?: boolean;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onClearReply: () => void;
  onReply: (m: ChatMessage) => void;
  onRetry: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onAttach: (type: MessageType, label: string) => void;
  onSendVoice: (duration: string) => void;
  onGif: () => void;
  onSticker: () => void;
  onToggleDetails: () => void;
  onBack?: () => void;
  onSearchChat: () => void;
  onPinToggle: () => void;
  onMuteToggle: () => void;
  onArchiveToggle: () => void;
  className?: string;
};

export function ChatWindow({
  conversation,
  messages,
  draft,
  reply,
  showUnreadDivider,
  onDraftChange,
  onSend,
  onClearReply,
  onReply,
  onRetry,
  onReact,
  onAttach,
  onSendVoice,
  onGif,
  onSticker,
  onToggleDetails,
  onBack,
  onSearchChat,
  onPinToggle,
  onMuteToggle,
  onArchiveToggle,
  className = '',
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const groups = groupMessages(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation?.id, conversation?.typing]);

  if (!conversation) {
    return null;
  }

  const title = conversation.kind === 'group' ? conversation.groupName : conversation.parentName;
  const subtitle =
    conversation.kind === 'group'
      ? `${conversation.parentCount ?? 0} parents · ${conversation.studentCount ?? 0} students`
      : `${conversation.studentName} · ${conversation.className}-${conversation.section}`;

  let unreadInserted = false;

  return (
    <section className={`pm-panel pm-chat-panel ${className}`.trim()} aria-label="Chat window">
      <header className="pm-chat-top">
        <div className="pm-chat-top-left">
          {onBack ? (
            <button type="button" className="pm-icon-btn pm-mobile-back" onClick={onBack} aria-label="Back to chats">
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <div className={`pm-avatar sm ${avatarTone(conversation.avatar)}`}>
            {conversation.avatar}
            {conversation.online ? <span className="pm-online" /> : null}
          </div>
          <div>
            <h2>
              {title}{' '}
              {conversation.pinned ? <Pin size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> : null}
            </h2>
            <p>
              {conversation.typing ? (
                <span className="pm-typing">
                  typing
                  <span className="pm-typing-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </span>
              ) : conversation.recording ? (
                <span className="pm-typing">recording a voice message…</span>
              ) : conversation.online ? (
                <span className="pm-status-online">Online</span>
              ) : (
                `Last active ${conversation.lastActive}`
              )}
              {' · '}
              {subtitle}
              {conversation.unread > 0 ? ` · ${conversation.unread} unread` : ''}
            </p>
          </div>
        </div>
        <div className="pm-chat-top-actions" style={{ position: 'relative' }}>
          <button type="button" className="pm-icon-btn" aria-label="Search in conversation" onClick={onSearchChat}>
            <Search size={18} />
          </button>
          <button type="button" className="pm-icon-btn" aria-label="Conversation details" onClick={onToggleDetails}>
            <PanelRight size={18} />
          </button>
          <button
            type="button"
            className="pm-icon-btn"
            aria-label="More options"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
          >
            <MoreVertical size={18} />
          </button>
          <AnimatePresence>
            {moreOpen ? (
              <motion.div
                className="pm-more-menu"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onPinToggle();
                    setMoreOpen(false);
                  }}
                >
                  {conversation.pinned ? 'Unpin chat' : 'Pin chat'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onMuteToggle();
                    setMoreOpen(false);
                  }}
                >
                  {conversation.muted ? 'Unmute' : 'Mute notifications'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onArchiveToggle();
                    setMoreOpen(false);
                  }}
                >
                  {conversation.archived ? 'Unarchive' : 'Archive chat'}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      <div className="pm-messages" role="log" aria-live="polite">
        {groups.map((g) => (
          <div key={g.key}>
            {g.label ? <div className="pm-date-sep">{g.label}</div> : null}
            {g.items.map((m) => {
              const showDivider =
                showUnreadDivider &&
                !unreadInserted &&
                !m.mine &&
                conversation.unread > 0 &&
                g.items.indexOf(m) >= g.items.length - conversation.unread;
              if (showDivider) unreadInserted = true;
              return (
                <div key={m.id}>
                  {showDivider ? <div className="pm-unread-divider">Unread messages</div> : null}
                  <MessageBubble message={m} onReply={onReply} onRetry={onRetry} onReact={onReact} />
                </div>
              );
            })}
          </div>
        ))}
        {conversation.typing ? (
          <div className="pm-bubble-row theirs">
            <div className="pm-bubble theirs" style={{ padding: '12px 16px' }}>
              <span className="pm-typing-dots" aria-label="Parent is typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        draft={draft}
        reply={reply}
        onDraftChange={onDraftChange}
        onSend={onSend}
        onClearReply={onClearReply}
        onAttach={onAttach}
        onSendVoice={onSendVoice}
        onGif={onGif}
        onSticker={onSticker}
      />
    </section>
  );
}
