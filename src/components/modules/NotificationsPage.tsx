'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  BellOff,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  FileText,
  LogIn,
  LogOut,
  MailOpen,
  Search,
  Settings2,
  Sparkles,
  StickyNote,
  Trash2,
  UserRound,
} from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import '@/components/ui/module.css';
import './notifications-page.css';

type FilterId = 'all' | 'unread' | 'parent' | 'activity' | 'attendance' | 'events';

type NotifIcon = 'form' | 'note' | 'checkin' | 'checkout' | 'leave' | 'event' | 'activity';

type NotifTone = 'sky' | 'coral' | 'mint' | 'lavender' | 'amber' | 'indigo';

type NotifItem = {
  id: string;
  message: string;
  highlight?: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  unread: boolean;
  category: Exclude<FilterId, 'all' | 'unread'>;
  icon: NotifIcon;
  detail: string;
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'parent', label: 'Parent Updates' },
  { id: 'activity', label: 'Activity' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'events', label: 'Events' },
];

const CATEGORY_LABEL: Record<NotifItem['category'], string> = {
  parent: 'Parent Updates',
  activity: 'Activity',
  attendance: 'Attendance',
  events: 'Events',
};

const CATEGORY_TONE: Record<NotifItem['category'], NotifTone> = {
  parent: 'coral',
  activity: 'lavender',
  attendance: 'mint',
  events: 'amber',
};

const SEED: NotifItem[] = [
  {
    id: '1',
    message: 'New form submission',
    time: '10:24 AM',
    group: 'Today',
    unread: true,
    category: 'parent',
    icon: 'form',
    detail: 'A parent submitted a new form. Open Forms to review the response.',
  },
  {
    id: '2',
    message: 'added a note for',
    highlight: 'Abhi',
    time: '9:12 AM',
    group: 'Today',
    unread: true,
    category: 'parent',
    icon: 'note',
    detail: 'A new parent note was added for Abhi. Check Parent Communication → Notes.',
  },
  {
    id: '8',
    message: 'Story circle activity shared in Rainbow Room',
    time: '8:40 AM',
    group: 'Today',
    unread: true,
    category: 'activity',
    icon: 'activity',
    detail: 'Teachers posted photos and notes from today\'s story circle for parents.',
  },
  {
    id: '3',
    message: 'checked in',
    highlight: 'Abhi',
    time: 'Yesterday · 8:55 AM',
    group: 'Yesterday',
    unread: false,
    category: 'attendance',
    icon: 'checkin',
    detail: 'Abhi was checked in successfully for the day.',
  },
  {
    id: '4',
    message: 'checked out',
    highlight: 'Abhi',
    time: 'Yesterday · 4:10 PM',
    group: 'Yesterday',
    unread: false,
    category: 'attendance',
    icon: 'checkout',
    detail: 'Abhi was checked out for the day.',
  },
  {
    id: '5',
    message: 'Leave Request Submitted by',
    highlight: 'Darshan Principal',
    time: '30 July',
    group: 'Earlier',
    unread: true,
    category: 'attendance',
    icon: 'leave',
    detail: 'Darshan Principal submitted a leave request awaiting review.',
  },
  {
    id: '6',
    message: 'New activity posted in Sunshine Room',
    time: '30 July',
    group: 'Earlier',
    unread: false,
    category: 'activity',
    icon: 'activity',
    detail: 'A new classroom activity was shared with parents in Sunshine Room.',
  },
  {
    id: '7',
    message: 'Event reminder: Parent Orientation',
    time: '29 July',
    group: 'Earlier',
    unread: false,
    category: 'events',
    icon: 'event',
    detail: 'Reminder for the upcoming Parent Orientation event on the calendar.',
  },
];

function RowIcon({ type }: { type: NotifIcon }) {
  const props = { size: 20, strokeWidth: 1.85 };
  switch (type) {
    case 'form':
      return <FileText {...props} />;
    case 'note':
      return <StickyNote {...props} />;
    case 'checkin':
      return <LogIn {...props} />;
    case 'checkout':
      return <LogOut {...props} />;
    case 'leave':
      return <UserRound {...props} />;
    case 'event':
      return <CalendarDays {...props} />;
    case 'activity':
      return <ClipboardList {...props} />;
    default:
      return <FileText {...props} />;
  }
}

function titleText(item: NotifItem) {
  if (!item.highlight) return item.message;
  if (item.message.endsWith('by') || item.message.endsWith('for')) {
    return (
      <>
        {item.message} <strong>{item.highlight}</strong>
      </>
    );
  }
  return (
    <>
      <strong>{item.highlight}</strong> {item.message}
    </>
  );
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function NotificationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(SEED);
  const [activeId, setActiveId] = useState<string | null>(SEED[0]?.id ?? null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (filter === 'unread' && !n.unread) return false;
      if (filter !== 'all' && filter !== 'unread' && n.category !== filter) return false;
      if (!q) return true;
      return (
        n.message.toLowerCase().includes(q) ||
        (n.highlight?.toLowerCase().includes(q) ?? false) ||
        n.detail.toLowerCase().includes(q) ||
        CATEGORY_LABEL[n.category].toLowerCase().includes(q)
      );
    });
  }, [filter, items, search]);

  const grouped = useMemo(() => {
    const order: NotifItem['group'][] = ['Today', 'Yesterday', 'Earlier'];
    return order
      .map((group) => ({ group, rows: filtered.filter((n) => n.group === group) }))
      .filter((g) => g.rows.length > 0);
  }, [filtered]);

  const total = items.length;
  const unreadCount = items.filter((n) => n.unread).length;
  const readCount = total - unreadCount;
  const active = items.find((n) => n.id === activeId) ?? null;
  const activeTone = active ? CATEGORY_TONE[active.category] : 'sky';
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((n) => selected.includes(n.id));

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    setSelected([]);
  };

  const clearRead = () => {
    setItems((prev) => prev.filter((n) => n.unread));
    setSelected((prev) => prev.filter((id) => items.find((n) => n.id === id)?.unread));
    if (active && !active.unread) setActiveId(null);
  };

  const markSelectedRead = () => {
    if (!selected.length) return;
    setItems((prev) =>
      prev.map((n) => (selected.includes(n.id) ? { ...n, unread: false } : n)),
    );
    setSelected([]);
  };

  const deleteSelected = () => {
    if (!selected.length) return;
    setItems((prev) => prev.filter((n) => !selected.includes(n.id)));
    if (activeId && selected.includes(activeId)) setActiveId(null);
    setSelected([]);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !filtered.some((n) => n.id === id)));
      return;
    }
    setSelected((prev) => Array.from(new Set([...prev, ...filtered.map((n) => n.id)])));
  };

  const openItem = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setActiveId(id);
  };

  const toggleUnread = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const removeOne = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="mod-page notif-page">
      <CenterManagementPageHeader
        title="Notifications"
        description="Stay on top of parent updates, attendance, activities, and center events."
        icon={<Bell />}
        actions={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} strokeWidth={2.2} aria-hidden />
              Back
            </button>
            <Link href="/notification-preferences" className="ui-btn ui-btn-outline">
              <Settings2 size={16} strokeWidth={2.2} aria-hidden />
              Preferences
            </Link>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} strokeWidth={2.2} aria-hidden />
              Mark all read
            </button>
          </>
        }
      />

      <section className="np-stats" aria-label="Notification summary">
        <button
          type="button"
          className={`np-stat tone-sky${filter === 'all' ? ' is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="np-statGlow" aria-hidden />
          <span className="np-statIcon">
            <Bell size={18} strokeWidth={1.9} />
          </span>
          <div className="np-statCopy">
            <p className="np-statLabel">Total</p>
            <p className="np-statValue">{total}</p>
          </div>
        </button>
        <button
          type="button"
          className={`np-stat tone-coral${filter === 'unread' ? ' is-active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          <span className="np-statGlow" aria-hidden />
          <span className="np-statIcon">
            <Sparkles size={18} strokeWidth={1.9} />
          </span>
          <div className="np-statCopy">
            <p className="np-statLabel">Unread</p>
            <p className="np-statValue">{unreadCount}</p>
          </div>
        </button>
        <button
          type="button"
          className="np-stat tone-mint"
          onClick={clearRead}
          disabled={readCount === 0}
          title="Clear all read notifications"
        >
          <span className="np-statGlow" aria-hidden />
          <span className="np-statIcon">
            <MailOpen size={18} strokeWidth={1.9} />
          </span>
          <div className="np-statCopy">
            <p className="np-statLabel">Read</p>
            <p className="np-statValue">{readCount}</p>
            <p className="np-statHint">Click to clear</p>
          </div>
        </button>
        <button
          type="button"
          className="np-stat tone-lavender"
          onClick={() => setFilter(filter === 'activity' ? 'all' : 'activity')}
        >
          <span className="np-statGlow" aria-hidden />
          <span className="np-statIcon">
            <ClipboardList size={18} strokeWidth={1.9} />
          </span>
          <div className="np-statCopy">
            <p className="np-statLabel">Showing</p>
            <p className="np-statValue">{filtered.length}</p>
          </div>
        </button>
      </section>

      <div className="np-toolbar">
        <div className="np-searchWrap">
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            className="ui-input np-search"
            type="search"
            placeholder="Search notifications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notifications"
          />
        </div>

        <LayoutGroup id="np-filter-tabs">
          <div className="np-tabs" role="tablist" aria-label="Notification filters">
            {FILTERS.map((f) => {
              const activeTab = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab}
                  className={`np-tab${activeTab ? ' is-active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {activeTab ? (
                    <motion.span
                      className="np-tabPill"
                      layoutId="np-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                    />
                  ) : null}
                  <span className="np-tabLabel">{f.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {selected.length > 0 ? (
        <div className="np-bulkBar" role="status">
          <p>
            <strong>{selected.length}</strong> selected
          </p>
          <div className="np-bulkActions">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={markSelectedRead}>
              <CheckCheck size={15} aria-hidden />
              Mark read
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={deleteSelected}>
              <Trash2 size={15} aria-hidden />
              Delete
            </button>
          </div>
        </div>
      ) : null}

      <div className="np-workspace">
        <section className="np-listPane" aria-label="Notification list">
          <div className="np-listHead">
            <label className="np-selectAll">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                disabled={!filtered.length}
              />
              Select all shown
            </label>
            <span className="np-listCount">
              {filtered.length} of {total}
            </span>
          </div>

          <motion.div
            className="np-list"
            key={`${filter}-${search}`}
            variants={reduceMotion ? undefined : listVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
          >
            {!filtered.length ? (
              <div className="np-empty">
                <BellOff size={28} strokeWidth={1.6} aria-hidden />
                <p>No notifications match this view.</p>
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={() => {
                    setFilter('all');
                    setSearch('');
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              grouped.map(({ group, rows }) => (
                <div key={group} className="np-group">
                  <h2 className="np-groupTitle">{group}</h2>
                  <ul className="np-groupList">
                    {rows.map((item) => {
                      const tone = CATEGORY_TONE[item.category];
                      const isActive = item.id === activeId;
                      const isChecked = selected.includes(item.id);
                      return (
                        <motion.li
                          key={item.id}
                          variants={reduceMotion ? undefined : itemVariants}
                        >
                          <div
                            className={`np-card tone-${tone}${item.unread ? '' : ' is-read'}${
                              isActive ? ' is-active' : ''
                            }`}
                          >
                            <label className="np-cardCheck" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelect(item.id)}
                                aria-label={`Select ${item.message}`}
                              />
                            </label>
                            <button
                              type="button"
                              className="np-cardMain"
                              onClick={() => openItem(item.id)}
                            >
                              <span className="np-cardAccent" aria-hidden />
                              <span className="np-cardIcon" aria-hidden>
                                <RowIcon type={item.icon} />
                              </span>
                              <span className="np-cardBody">
                                <span className="np-cardMeta">
                                  <span className="np-cardBadge">
                                    {CATEGORY_LABEL[item.category]}
                                  </span>
                                  <span className="np-cardTime">{item.time}</span>
                                </span>
                                <p className="np-cardTitle">{titleText(item)}</p>
                                <p className="np-cardDesc">{item.detail}</p>
                              </span>
                              {item.unread ? (
                                <span className="np-unreadPill" aria-label="Unread">
                                  New
                                </span>
                              ) : null}
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </motion.div>
        </section>

        <aside className={`np-detailPane tone-${activeTone}`} aria-label="Notification preview">
          {active ? (
            <>
              <div className="np-detailHero">
                <span className="np-detailIcon" aria-hidden>
                  <RowIcon type={active.icon} />
                </span>
                <div>
                  <p className="np-detailBadge">{CATEGORY_LABEL[active.category]}</p>
                  <h2 className="np-detailTitle">{titleText(active)}</h2>
                </div>
              </div>

              <dl className="np-detailBlock">
                <div className="np-detailRow">
                  <dt>When</dt>
                  <dd>{active.time}</dd>
                </div>
                <div className="np-detailRow">
                  <dt>Group</dt>
                  <dd>{active.group}</dd>
                </div>
                <div className="np-detailRow">
                  <dt>Status</dt>
                  <dd>
                    <span className={`np-statusChip${active.unread ? ' is-unread' : ''}`}>
                      {active.unread ? 'Unread' : 'Read'}
                    </span>
                  </dd>
                </div>
                <div className="np-detailRow np-detailRow--stack">
                  <dt>Details</dt>
                  <dd className="np-detailFull">{active.detail}</dd>
                </div>
              </dl>

              <div className="np-detailActions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => toggleUnread(active.id)}
                >
                  {active.unread ? (
                    <>
                      <MailOpen size={15} aria-hidden /> Mark as read
                    </>
                  ) : (
                    <>
                      <Bell size={15} aria-hidden /> Mark as unread
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-danger"
                  onClick={() => removeOne(active.id)}
                >
                  <Trash2 size={15} aria-hidden />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="np-detailEmpty">
              <Bell size={32} strokeWidth={1.5} aria-hidden />
              <p>Select a notification to preview details.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
