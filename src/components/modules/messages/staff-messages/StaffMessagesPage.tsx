'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ChatWindow } from './ChatWindow';
import { ConversationSidebar } from './ConversationSidebar';
import { DetailsPanel } from './DetailsPanel';
import { EmptyChatState } from './EmptyChatState';
import { MessagesHeader } from './MessagesHeader';
import { NewChatModal } from './NewChatModal';
import { NewGroupWizard } from './NewGroupWizard';
import { ToastStack } from './ToastStack';
import { departmentOptions, seedConversations, seedMessages, staffDirectory } from './mockData';
import type {
  ChatMessage,
  Conversation,
  FilterKey,
  MessageType,
  ReplyDraft,
  SidebarSection,
  StaffMember,
  ToastItem,
} from './types';
import {
  applyFilters,
  applySection,
  matchesSearch,
  previewForType,
  sortByPinnedThenOrder,
} from './utils';
import './staff-messages.css';
import '@/components/modules/calendar/calendar.css';
import '@/components/ui/module.css';

export function StaffMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(seedMessages);
  const [selectedId, setSelectedId] = useState<string | null>(seedConversations[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<SidebarSection>('recent');
  const [filters, setFilters] = useState<FilterKey[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState<ReplyDraft>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [detailsMobile, setDetailsMobile] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  /* Keep the first seeded chat selected so the message pane is never blank on load. */
  useEffect(() => {
    if (selectedId) return;
    const first = seedConversations[0]?.id;
    if (first) setSelectedId(first);
  }, [selectedId]);

  const pushToast = (type: ToastItem['type'], title: string, message: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  };

  const orderIds = useMemo(() => seedConversations.map((c) => c.id), []);

  const visibleConversations = useMemo(() => {
    let list = conversations.filter((c) => matchesSearch(c, search));
    list = applySection(list, section);
    list = applyFilters(list, filters, departmentFilter);
    return sortByPinnedThenOrder(list, orderIds);
  }, [conversations, search, section, filters, departmentFilter, orderIds]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const messages = useMemo(() => {
    const list = threads[selectedId ?? ''] ?? [];
    if (!chatSearch.trim()) return list;
    const q = chatSearch.toLowerCase();
    return list.filter(
      (m) => m.content.toLowerCase().includes(q) || (m.fileName ?? '').toLowerCase().includes(q),
    );
  }, [threads, selectedId, chatSearch]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMobileView('chat');
    setChatSearch('');
    setConversations((items) => items.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const toggleFilter = (f: FilterKey) => {
    if (f === 'all') {
      setFilters([]);
      return;
    }
    setFilters((prev) => {
      const next = prev.filter((x) => x !== 'all');
      return next.includes(f) ? next.filter((x) => x !== f) : [...next, f];
    });
  };

  const bumpConversation = (id: string, patch: Partial<Conversation>) => {
    setConversations((items) => {
      const next = items.map((c) => (c.id === id ? { ...c, ...patch } : c));
      const idx = next.findIndex((c) => c.id === id);
      if (idx <= 0) return next;
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  };

  const appendMessage = (conversationId: string, message: ChatMessage) => {
    setThreads((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), message],
    }));
    bumpConversation(conversationId, {
      lastMessage: previewForType(message.type, message.fileName ?? message.content),
      lastMessageType: message.type,
      lastActive: 'Just now',
      status: message.status,
    });
  };

  const sendText = () => {
    if (!selectedId || !draft.trim()) return;
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      type: 'text',
      content: draft.trim(),
      mine: true,
      senderName: 'You',
      senderAvatar: 'YO',
      timestamp: new Date().toISOString(),
      status: 'sending',
      replyTo: reply
        ? { id: reply.id, preview: reply.preview, senderName: reply.senderName }
        : undefined,
    };
    appendMessage(selectedId, message);
    setDraft('');
    setReply(null);
    pushToast('success', 'Message sent', 'Your message is on its way to staff.');
    window.setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map((m) =>
          m.id === message.id ? { ...m, status: 'delivered' } : m,
        ),
      }));
    }, 600);
    window.setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map((m) =>
          m.id === message.id ? { ...m, status: 'read' } : m,
        ),
      }));
    }, 1400);
  };

  const sendAttachment = (type: MessageType, label: string) => {
    if (!selectedId) return;
    const ext =
      type === 'pdf'
        ? 'pdf'
        : type === 'excel'
          ? 'xlsx'
          : type === 'word'
            ? 'docx'
            : type === 'powerpoint'
              ? 'pptx'
              : type === 'zip'
                ? 'zip'
                : type === 'video'
                  ? 'mp4'
                  : type === 'audio'
                    ? 'mp3'
                    : 'jpg';
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      type,
      content: label,
      mine: true,
      senderName: 'You',
      senderAvatar: 'YO',
      timestamp: new Date().toISOString(),
      status: 'sent',
      fileName: `${label.replace(/\s+/g, '_')}.${ext}`,
      fileSize: '256 KB',
    };
    appendMessage(selectedId, message);
    pushToast('info', 'File shared', `${label} shared with staff.`);
  };

  const sendVoice = (duration: string) => {
    if (!selectedId) return;
    appendMessage(selectedId, {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      type: 'voice',
      content: 'Voice message',
      mine: true,
      senderName: 'You',
      senderAvatar: 'YO',
      timestamp: new Date().toISOString(),
      status: 'sent',
      duration,
    });
    pushToast('success', 'Voice message', 'Recording sent successfully.');
  };

  const startChat = (member: StaffMember) => {
    const existing = conversations.find(
      (c) => c.kind === 'direct' && c.employeeId === member.employeeId,
    );
    if (existing) {
      selectConversation(existing.id);
      setNewChatOpen(false);
      return;
    }
    const id = `c-${Date.now()}`;
    const conv: Conversation = {
      id,
      kind: 'direct',
      staffName: member.name,
      employeeId: member.employeeId,
      designation: member.designation,
      department: member.department,
      role: member.role,
      avatar: member.avatar,
      lastMessage: 'Conversation started',
      lastMessageType: 'system',
      lastActive: 'Just now',
      unread: 0,
      pinned: false,
      muted: false,
      archived: false,
      favourite: false,
      online: member.online,
      typing: false,
      recording: false,
      status: 'sent',
      phone: member.phone,
      email: member.email,
      joinedDate: member.joinedDate,
      mediaCount: 0,
      fileCount: 0,
      linkCount: 0,
    };
    setConversations((prev) => [conv, ...prev]);
    setThreads((prev) => ({
      ...prev,
      [id]: [
        {
          id: `m-${Date.now()}`,
          conversationId: id,
          type: 'system',
          content: `Conversation started with ${member.name}`,
          mine: false,
          senderName: 'System',
          senderAvatar: '',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
      ],
    }));
    setSelectedId(id);
    setMobileView('chat');
    setNewChatOpen(false);
    pushToast('success', 'Chat created', `You can now message ${member.name}.`);
  };

  const createGroup = (payload: {
    name: string;
    description: string;
    color: string;
    members: StaffMember[];
  }) => {
    const id = `g-${Date.now()}`;
    const conv: Conversation = {
      id,
      kind: 'group',
      staffName: payload.name,
      employeeId: '—',
      designation: 'Staff Group',
      department: payload.members[0]?.department ?? 'Administration',
      role: 'Group',
      avatar: payload.name.slice(0, 2).toUpperCase(),
      groupName: payload.name,
      groupDescription: payload.description,
      groupColor: payload.color,
      createdBy: 'You',
      createdDate: 'Today',
      lastMessage: 'Group created',
      lastMessageType: 'system',
      lastActive: 'Just now',
      unread: 0,
      pinned: false,
      muted: false,
      archived: false,
      favourite: false,
      online: false,
      typing: false,
      recording: false,
      status: 'sent',
      phone: '—',
      email: '—',
      joinedDate: 'Today',
      memberCount: payload.members.length + 1,
      mediaCount: 0,
      fileCount: 0,
      linkCount: 0,
      members: [
        {
          id: 'admin-you',
          name: 'You',
          role: 'admin',
          avatar: 'YO',
          joinedAt: 'Today',
          designation: 'Staff',
          department: 'Administration',
        },
        ...payload.members.map((m) => ({
          id: m.id,
          name: m.name,
          role: 'member' as const,
          avatar: m.avatar,
          joinedAt: 'Today',
          designation: m.designation,
          department: m.department,
        })),
      ],
    };
    setConversations((prev) => [conv, ...prev]);
    setThreads((prev) => ({
      ...prev,
      [id]: [
        {
          id: `m-${Date.now()}`,
          conversationId: id,
          type: 'system',
          content: `You created “${payload.name}”`,
          mine: false,
          senderName: 'System',
          senderAvatar: '',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
      ],
    }));
    setSelectedId(id);
    setMobileView('chat');
    setNewGroupOpen(false);
    pushToast('success', 'Group created', `${payload.name} is ready for staff collaboration.`);
  };

  const patchSelected = (patch: Partial<Conversation>) => {
    if (!selectedId) return;
    setConversations((items) => items.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));
  };

  return (
    <div className="mod-page cal-page sm-page">
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
      </div>

      <div className="sm-page-inner">
        <MessagesHeader
          onNewChat={() => setNewChatOpen(true)}
          onNewGroup={() => setNewGroupOpen(true)}
          onArchive={() => {
            setSection('archived');
            pushToast('info', 'Archived chats', 'Showing archived staff conversations.');
          }}
          onFilters={() => setFiltersOpen(true)}
        />

        <motion.div
          className={`sm-layout ${detailsOpen && selected ? '' : 'is-details-hidden'}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <ConversationSidebar
            conversations={visibleConversations}
            selectedId={selectedId}
            search={search}
            section={section}
            filters={filters}
            loading={loading}
            className={mobileView === 'chat' ? 'is-hidden-mobile' : ''}
            onSearch={setSearch}
            onSection={setSection}
            onToggleFilter={toggleFilter}
            onSelect={selectConversation}
          />

          {selected ? (
            <ChatWindow
              conversation={selected}
              messages={messages}
              draft={draft}
              reply={reply}
              showUnreadDivider
              className={mobileView === 'list' ? 'is-hidden-mobile' : ''}
              onDraftChange={setDraft}
              onSend={sendText}
              onClearReply={() => setReply(null)}
              onReply={(m) =>
                setReply({
                  id: m.id,
                  preview: m.content.slice(0, 80),
                  senderName: m.mine ? 'You' : m.senderName,
                })
              }
              onRetry={(id) => {
                setThreads((prev) => ({
                  ...prev,
                  [selectedId!]: (prev[selectedId!] ?? []).map((m) =>
                    m.id === id ? { ...m, status: 'sent' } : m,
                  ),
                }));
                pushToast('info', 'Retrying', 'Message send retried.');
              }}
              onReact={(id, emoji) => {
                setThreads((prev) => ({
                  ...prev,
                  [selectedId!]: (prev[selectedId!] ?? []).map((m) => {
                    if (m.id !== id) return m;
                    const reactions = [...(m.reactions ?? [])];
                    const found = reactions.find((r) => r.emoji === emoji);
                    if (found) found.count += 1;
                    else reactions.push({ emoji, count: 1, mine: true });
                    return { ...m, reactions };
                  }),
                }));
              }}
              onAttach={sendAttachment}
              onSendVoice={sendVoice}
              onGif={() => sendAttachment('gif', '🎉')}
              onSticker={() =>
                appendMessage(selectedId!, {
                  id: `m-${Date.now()}`,
                  conversationId: selectedId!,
                  type: 'sticker',
                  content: '🌟',
                  mine: true,
                  senderName: 'You',
                  senderAvatar: 'YO',
                  timestamp: new Date().toISOString(),
                  status: 'sent',
                })
              }
              onToggleDetails={() => {
                if (window.matchMedia('(max-width: 1180px)').matches) {
                  setDetailsMobile(true);
                  setDetailsOpen(true);
                } else {
                  setDetailsOpen((v) => !v);
                }
              }}
              onBack={() => {
                setMobileView('list');
              }}
              onSearchChat={() => {
                const q = window.prompt('Search in conversation', chatSearch);
                if (q !== null) setChatSearch(q);
              }}
              onPinToggle={() => patchSelected({ pinned: !selected.pinned })}
              onMuteToggle={() => {
                patchSelected({ muted: !selected.muted });
                pushToast(
                  'info',
                  selected.muted ? 'Unmuted' : 'Muted',
                  'Notification preference updated.',
                );
              }}
              onArchiveToggle={() => {
                patchSelected({ archived: !selected.archived });
                pushToast(
                  'info',
                  selected.archived ? 'Unarchived' : 'Archived',
                  'Conversation list updated.',
                );
              }}
            />
          ) : (
            <EmptyChatState className={mobileView === 'list' ? 'is-hidden-mobile' : ''} />
          )}

          {selected && detailsOpen ? (
            <DetailsPanel
              conversation={selected}
              mobileOpen={detailsMobile}
              onClose={() => {
                setDetailsOpen(false);
                setDetailsMobile(false);
              }}
              onMute={() => patchSelected({ muted: !selected.muted })}
              onArchive={() => patchSelected({ archived: !selected.archived })}
              onClear={() => {
                if (!selectedId) return;
                setThreads((prev) => ({ ...prev, [selectedId]: [] }));
                pushToast('info', 'Chat cleared', 'Messages removed from this view.');
              }}
              onExport={() => pushToast('success', 'Export ready', 'Chat export prepared (demo).')}
            />
          ) : null}
        </motion.div>
      </div>

      <motion.button
        type="button"
        className="sm-fab"
        aria-label="New chat"
        onClick={() => setNewChatOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="sm-fab-ripple" aria-hidden />
        <Plus size={24} />
      </motion.button>

      <NewChatModal
        open={newChatOpen}
        staff={staffDirectory}
        onClose={() => setNewChatOpen(false)}
        onStart={startChat}
      />
      <NewGroupWizard
        open={newGroupOpen}
        staff={staffDirectory}
        onClose={() => setNewGroupOpen(false)}
        onCreate={createGroup}
      />

      <Modal
        open={filtersOpen}
        title="Staff Filters"
        onClose={() => setFiltersOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setFilters([]);
                setDepartmentFilter('all');
              }}
            >
              Reset
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => setFiltersOpen(false)}>
              Apply
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Department</label>
          <select
            className="ui-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="sm-filter-row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
          {(
            [
              'unread',
              'online',
              'teaching',
              'administration',
              'transport',
              'accounts',
              'reception',
              'hr',
              'management',
              'groups',
              'pinned',
              'archived',
              'muted',
              'attachments',
            ] as FilterKey[]
          ).map((f) => (
            <button
              key={f}
              type="button"
              className={`sm-chip ${filters.includes(f) ? 'is-active' : ''}`}
              onClick={() => toggleFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </Modal>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
