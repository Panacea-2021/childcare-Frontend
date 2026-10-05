'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Mic,
  Paperclip,
  Pin,
  Search,
  VolumeX,
} from 'lucide-react';
import type { Conversation, FilterKey, SidebarSection } from './types';
import { avatarTone, previewForType } from './utils';

const SECTIONS: { id: SidebarSection; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'groups', label: 'Groups' },
  { id: 'unread', label: 'Unread' },
  { id: 'online', label: 'Online' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'archived', label: 'Archived' },
];

const QUICK_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'groups', label: 'Groups' },
  { id: 'online', label: 'Online' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'muted', label: 'Muted' },
  { id: 'attachments', label: 'Files' },
];

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  search: string;
  section: SidebarSection;
  filters: FilterKey[];
  loading?: boolean;
  className?: string;
  onSearch: (v: string) => void;
  onSection: (s: SidebarSection) => void;
  onToggleFilter: (f: FilterKey) => void;
  onSelect: (id: string) => void;
};

export function ConversationSidebar({
  conversations,
  selectedId,
  search,
  section,
  filters,
  loading,
  className = '',
  onSearch,
  onSection,
  onToggleFilter,
  onSelect,
}: Props) {
  return (
    <aside className={`pm-panel pm-sidebar-panel ${className}`.trim()} aria-label="Conversations">
      <div className="pm-sidebar-sticky">
        <label className="pm-search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search student, parent, class…"
            aria-label="Search conversations"
          />
        </label>
        <div className="pm-filter-row" role="toolbar" aria-label="Quick filters">
          {QUICK_FILTERS.map((f) => {
            const active = f.id === 'all' ? filters.length === 0 || filters.includes('all') : filters.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                className={`pm-chip ${active ? 'is-active' : ''}`}
                onClick={() => onToggleFilter(f.id)}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pm-section-tabs" role="tablist" aria-label="Conversation sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            className={`pm-section-tab ${section === s.id ? 'is-active' : ''}`}
            onClick={() => onSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="pm-chat-list" role="listbox" aria-label="Chat list">
        {loading ? (
          <>
            <div className="pm-skel" />
            <div className="pm-skel" />
            <div className="pm-skel" />
            <div className="pm-skel" />
          </>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No conversations match your filters.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {conversations.map((c, i) => (
              <motion.button
                key={c.id}
                type="button"
                role="option"
                aria-selected={selectedId === c.id}
                className={`pm-chat-card ${selectedId === c.id ? 'is-active' : ''} ${c.unread > 0 ? 'is-unread' : ''}`}
                onClick={() => onSelect(c.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.2) }}
                whileHover={{ scale: 1.01 }}
              >
                <div className={`pm-avatar ${avatarTone(c.avatar)}`}>
                  {c.avatar}
                  {c.online ? <span className="pm-online" aria-label="Online" /> : null}
                </div>
                <div className="pm-chat-meta">
                  <h3>
                    {c.kind === 'group' ? c.groupName : c.parentName}
                    {c.pinned ? <Pin size={12} aria-label="Pinned" /> : null}
                    {c.muted ? <VolumeX size={12} aria-label="Muted" /> : null}
                  </h3>
                  <p className="pm-student-line">
                    {c.kind === 'group'
                      ? `${c.studentCount ?? 0} students · ${c.className} ${c.section}`
                      : `${c.studentName} · ${c.className}-${c.section}`}
                  </p>
                  {c.typing ? (
                    <span className="pm-typing">
                      typing
                      <span className="pm-typing-dots" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                    </span>
                  ) : c.recording ? (
                    <span className="pm-typing">recording…</span>
                  ) : (
                    <p>
                      {c.lastMessageType === 'voice' || c.lastMessageType === 'audio' ? (
                        <Mic size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                      ) : null}
                      {['pdf', 'word', 'excel', 'image', 'zip'].includes(c.lastMessageType) ? (
                        <Paperclip size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                      ) : null}
                      {previewForType(c.lastMessageType, c.lastMessage)}
                    </p>
                  )}
                </div>
                <div className="pm-chat-side">
                  <span className="pm-chat-time">{c.lastActive}</span>
                  {c.unread > 0 ? <span className="pm-unread-badge">{c.unread}</span> : null}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
