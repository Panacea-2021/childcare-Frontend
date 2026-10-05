'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Paperclip, Pin, Search, VolumeX } from 'lucide-react';
import type { Conversation, FilterKey, SidebarSection } from './types';
import { avatarTone, previewForType } from './utils';

const SECTIONS: { id: SidebarSection; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'unread', label: 'Unread' },
  { id: 'online', label: 'Online' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'groups', label: 'Groups' },
  { id: 'departments', label: 'Departments' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'archived', label: 'Archived' },
];

const QUICK_FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'online', label: 'Online' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'administration', label: 'Admin' },
  { id: 'transport', label: 'Transport' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'reception', label: 'Reception' },
  { id: 'hr', label: 'HR' },
  { id: 'management', label: 'Management' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'archived', label: 'Archived' },
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
    <aside className={`sm-panel sm-sidebar-panel ${className}`.trim()} aria-label="Staff conversations">
      <div className="sm-sidebar-sticky">
        <label className="sm-search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, ID, department, role…"
            aria-label="Search staff conversations"
          />
        </label>
        <div className="sm-filter-row" role="toolbar" aria-label="Quick filters">
          {QUICK_FILTERS.map((f) => {
            const active = f.id === 'all' ? filters.length === 0 || filters.includes('all') : filters.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                className={`sm-chip ${active ? 'is-active' : ''}`}
                onClick={() => onToggleFilter(f.id)}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sm-section-tabs" role="tablist" aria-label="Conversation sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            className={`sm-section-tab ${section === s.id ? 'is-active' : ''}`}
            onClick={() => onSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="sm-chat-list" role="listbox" aria-label="Staff chat list">
        {loading ? (
          <>
            <div className="sm-skel" />
            <div className="sm-skel" />
            <div className="sm-skel" />
            <div className="sm-skel" />
          </>
        ) : conversations.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}
          >
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
                className={`sm-chat-card ${selectedId === c.id ? 'is-active' : ''} ${c.unread > 0 ? 'is-unread' : ''}`}
                onClick={() => onSelect(c.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.2) }}
                whileHover={{ scale: 1.01 }}
              >
                <div className={`sm-avatar ${avatarTone(c.avatar)}`}>
                  {c.avatar}
                  {c.online ? <span className="sm-online" aria-label="Online" /> : null}
                </div>
                <div className="sm-chat-meta">
                  <h3>
                    {c.kind === 'group' ? c.groupName : c.staffName}
                    {c.pinned ? <Pin size={12} aria-label="Pinned" /> : null}
                    {c.muted ? <VolumeX size={12} aria-label="Muted" /> : null}
                  </h3>
                  <p className="sm-student-line">
                    {c.kind === 'group'
                      ? `${c.memberCount ?? 0} members · ${c.department}`
                      : `${c.designation} · ${c.department}`}
                  </p>
                  {c.typing ? (
                    <span className="sm-typing">
                      typing
                      <span className="sm-typing-dots" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                    </span>
                  ) : c.recording ? (
                    <span className="sm-typing">recording…</span>
                  ) : (
                    <p>
                      {c.lastMessageType === 'voice' || c.lastMessageType === 'audio' ? (
                        <Mic size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                      ) : null}
                      {['pdf', 'word', 'excel', 'image', 'zip', 'powerpoint'].includes(c.lastMessageType) ? (
                        <Paperclip size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                      ) : null}
                      {previewForType(c.lastMessageType, c.lastMessage)}
                    </p>
                  )}
                </div>
                <div className="sm-chat-side">
                  <span className="sm-chat-time">{c.lastActive}</span>
                  {c.unread > 0 ? <span className="sm-unread-badge">{c.unread}</span> : null}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
