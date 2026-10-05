'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  FileText,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  filterParentNotifications,
  loadParentNotifications,
  markAllParentNotificationsRead,
  markParentNotificationRead,
  PARENT_NOTIF_EVENT,
  PARENT_NOTIF_FILTERS,
  saveParentNotifications,
  type ParentNotifFilter,
  type ParentNotification,
} from '@/lib/parent-notifications';
import { ParentEmptyState, ParentPageHeader, ParentSkeleton } from '../shared';
import '../shared/parent-shared.css';
import './parent-notifications-page.css';

function NotifIcon({ icon, category }: { icon: ParentNotification['icon']; category: string }) {
  if (icon === 'invoice' || category === 'billing') return <FileText size={20} />;
  if (category === 'attendance') return <ClipboardList size={20} />;
  if (category === 'events') return <CalendarDays size={20} />;
  if (category === 'concern') return <Bell size={20} />;
  return <Sparkles size={20} />;
}

export function ParentNotificationsPage() {
  const [items, setItems] = useState<ParentNotification[]>([]);
  const [filter, setFilter] = useState<ParentNotifFilter>('all');
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<ParentNotification | null>(null);

  useEffect(() => {
    const boot = window.setTimeout(() => {
      setItems(loadParentNotifications());
      setReady(true);
    }, 400);
    const sync = () => setItems(loadParentNotifications());
    window.addEventListener(PARENT_NOTIF_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.clearTimeout(boot);
      window.removeEventListener(PARENT_NOTIF_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const unreadCount = items.filter((n) => n.unread).length;

  const visible = useMemo(() => {
    const base = filterParentNotifications(items, filter);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (n) => n.message.toLowerCase().includes(q) || n.category.toLowerCase().includes(q),
    );
  }, [items, filter, query]);

  const persist = (next: ParentNotification[]) => {
    setItems(next);
    saveParentNotifications(next);
  };

  const markAllRead = () => {
    persist(markAllParentNotificationsRead(items));
  };

  const openItem = (item: ParentNotification) => {
    persist(markParentNotificationRead(items, item.id));
    setDetail({ ...item, unread: false });
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="psh-page pnp-page">
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <ParentPageHeader
              title="Notifications"
              description="Stay on top of activities, attendance, events and billing updates."
              icon={<Bell size={22} strokeWidth={2.1} />}
              actions={
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={markAllRead}
                  disabled={!ready || unreadCount === 0}
                >
                  <CheckCheck size={16} aria-hidden />
                  Mark all as read
                </button>
              }
            />
          </m.div>

          {!ready ? (
            <ParentSkeleton variant="list" rows={5} />
          ) : (
            <>
              <div className="psh-surface psh-surface--pad pnp-toolbar">
                <div className="pnp-filters" role="tablist" aria-label="Notification filters">
                  {PARENT_NOTIF_FILTERS.map((f) => {
                    const active = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`pnp-filter${active ? ' is-active' : ''}`}
                        onClick={() => setFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                <div className="psh-search pnp-search">
                  <Search size={16} className="psh-search-ico" aria-hidden />
                  <input
                    className="ui-input psh-search-input"
                    type="search"
                    placeholder="Search notifications..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search notifications"
                  />
                  {query ? (
                    <button
                      type="button"
                      className="psh-search-clear"
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </div>

              <section className="pnp-card" aria-label="Notifications">
                <div className="pnp-cardHead">
                  <h2 className="pnp-this">
                    {filter === 'unread' ? 'Unread' : 'Inbox'}
                    <span className="pnp-count">({unreadCount} unread)</span>
                  </h2>
                </div>

                <AnimatePresence mode="wait">
                  {visible.length === 0 ? (
                    <m.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ParentEmptyState
                        icon={<CheckCheck size={28} />}
                        title="You're all caught up!"
                        description="Looks like you haven't received any new notifications in this view."
                        action={
                          filter !== 'all' || query ? (
                            <button
                              type="button"
                              className="ui-btn ui-btn-outline"
                              onClick={() => {
                                setFilter('all');
                                setQuery('');
                              }}
                            >
                              Show all
                            </button>
                          ) : undefined
                        }
                      />
                    </m.div>
                  ) : (
                    <m.ul
                      key="list"
                      className="pnp-list"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {visible.map((item, idx) => (
                        <m.li
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.18) }}
                        >
                          <button
                            type="button"
                            className={`pnp-row${item.unread ? ' is-unread' : ''}`}
                            onClick={() => openItem(item)}
                          >
                            <span className={`pnp-icon pnp-icon--${item.category}`}>
                              <NotifIcon icon={item.icon} category={item.category} />
                            </span>
                            <span className="pnp-body">
                              <span className="pnp-cat">{item.category}</span>
                              <span className="pnp-message">{item.message}</span>
                              <span className="pnp-time">{item.time}</span>
                            </span>
                            {item.unread ? <span className="pnp-dot" aria-label="Unread" /> : null}
                          </button>
                        </m.li>
                      ))}
                    </m.ul>
                  )}
                </AnimatePresence>
              </section>
            </>
          )}

          <Modal
            open={!!detail}
            title="Notification"
            onClose={() => setDetail(null)}
            footer={
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDetail(null)}>
                Close
              </button>
            }
          >
            {detail ? (
              <div className="pnp-detail">
                <span className={`psh-badge psh-badge--info`}>{detail.category}</span>
                <p className="pnp-detail-msg">{detail.message}</p>
                <p className="pnp-detail-time">{detail.time}</p>
              </div>
            ) : null}
          </Modal>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
