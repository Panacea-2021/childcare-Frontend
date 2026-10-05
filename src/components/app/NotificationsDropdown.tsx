'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import {
  filterParentNotifications,
  loadParentNotifications,
  markAllParentNotificationsRead,
  markParentNotificationRead,
  PARENT_NOTIF_EVENT,
  saveParentNotifications,
  type ParentNotification,
} from '@/lib/parent-notifications';
import './notifications-dropdown.css';

type StaffNotif = {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  icon: 'activity' | 'invoice';
};

const STAFF_SEED: StaffNotif[] = [
  {
    id: 'n1',
    message: 'Someone recommended SmartBlog',
    time: '10:25 PM, 12th July',
    unread: true,
    icon: 'activity',
  },
  {
    id: 'n2',
    message: 'New requested date on Training 985',
    time: '1 hour ago',
    unread: true,
    icon: 'invoice',
  },
  {
    id: 'n3',
    message: 'New form submission received',
    time: 'Today',
    unread: true,
    icon: 'activity',
  },
  {
    id: 'n4',
    message: 'Staff leave request pending approval',
    time: 'Yesterday',
    unread: false,
    icon: 'invoice',
  },
];

type Props = {
  /** Where “View All” navigates. */
  viewAllHref?: string;
  /** Sync with Parent Notifications page via localStorage. */
  useParentStore?: boolean;
};

function ActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 6.5l4 3-4 3V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="6" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.5 15.2l1.4 1.4 2.6-2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.2 8.2h5.6M9.2 11.2h5.6M9.2 14.2h3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="14.2" y="13.2" width="4.2" height="3.6" rx="0.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15.1 15h2.4M15.1 16.2h1.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function RowIcon({ type }: { type: 'activity' | 'invoice' }) {
  return (
    <span className={`notif-dd__icon notif-dd__icon--${type}`}>
      {type === 'invoice' ? <InvoiceIcon /> : <ActivityIcon />}
    </span>
  );
}

export function NotificationsDropdown({
  viewAllHref = '/notifications',
  useParentStore = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shiftLeft, setShiftLeft] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [staffItems, setStaffItems] = useState(STAFF_SEED);
  const [parentItems, setParentItems] = useState<ParentNotification[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!useParentStore) return;
    setParentItems(loadParentNotifications());
    const sync = () => setParentItems(loadParentNotifications());
    window.addEventListener(PARENT_NOTIF_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PARENT_NOTIF_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [useParentStore]);

  const items = useParentStore ? parentItems : staffItems;
  const unreadCount = items.filter((n) => n.unread).length;
  const visible = useMemo(() => {
    if (useParentStore) {
      return filterParentNotifications(parentItems, unreadOnly ? 'unread' : 'all');
    }
    return unreadOnly ? staffItems.filter((n) => n.unread) : staffItems;
  }, [useParentStore, parentItems, staffItems, unreadOnly]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShiftLeft(false);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (rect.left < 8) setShiftLeft(true);
  }, [open]);

  const persistParent = (next: ParentNotification[]) => {
    setParentItems(next);
    saveParentNotifications(next);
  };

  const markAllRead = () => {
    if (useParentStore) {
      persistParent(markAllParentNotificationsRead(parentItems));
      return;
    }
    setStaffItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const openItem = (id: string) => {
    if (useParentStore) {
      persistParent(markParentNotificationRead(parentItems, id));
    } else {
      setStaffItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    }
    setOpen(false);
  };

  return (
    <div className="notif-dd" ref={rootRef}>
      <button
        type="button"
        className="shell-iconBtn shell-bell notif-dd__trigger"
        aria-label="Notifications"
        title="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 9a6 6 0 1 1 12 0c0 3.2 1.2 4.6 1.8 5.2H4.2C4.8 13.6 6 12.2 6 9Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 ? <i>{Math.min(unreadCount, 9)}</i> : null}
      </button>

      <div
        id={menuId}
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className={`notif-dd__panel${open ? ' is-open' : ''}${shiftLeft ? ' is-shift-left' : ''}`}
      >
        <div className="notif-dd__top">
          <h2 className="notif-dd__title">Notifications</h2>
          <button type="button" className="notif-dd__x" aria-label="Close" onClick={() => setOpen(false)}>
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="notif-dd__toolbar">
          <p className="notif-dd__this">This ({unreadCount})</p>
          <button
            type="button"
            className={`notif-dd__unreadToggle${unreadOnly ? ' is-on' : ''}`}
            onClick={() => setUnreadOnly((v) => !v)}
            aria-pressed={unreadOnly}
          >
            <span className="notif-dd__check" aria-hidden>
              {unreadOnly ? <Check size={10} strokeWidth={3} /> : null}
            </span>
            Unread notifications
          </button>
        </div>

        <ul className="notif-dd__list">
          {!visible.length ? (
            <li>
              <p className="notif-dd__empty">
                {unreadOnly ? 'No unread notifications' : 'No notifications'}
              </p>
            </li>
          ) : (
            visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`notif-dd__row${item.unread ? ' is-unread' : ''}`}
                  onClick={() => openItem(item.id)}
                >
                  <RowIcon type={item.icon} />
                  <span className="notif-dd__content">
                    <p className="notif-dd__headline">{item.message}</p>
                    <p className="notif-dd__meta">{item.time}</p>
                  </span>
                  {item.unread ? <span className="notif-dd__dot" aria-label="Unread" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="notif-dd__footer">
          <button
            type="button"
            className="notif-dd__markAll"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary notif-dd__viewAll"
            onClick={() => {
              setOpen(false);
              router.push(viewAllHref);
            }}
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
