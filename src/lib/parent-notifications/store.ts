export type ParentNotifCategory = 'activity' | 'concern' | 'attendance' | 'events' | 'billing';

export type ParentNotifIcon = 'activity' | 'invoice';

export type ParentNotification = {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  category: ParentNotifCategory;
  icon: ParentNotifIcon;
};

export type ParentNotifFilter = 'all' | 'unread' | 'activity' | 'concern' | 'attendance' | 'events' | 'billing';

export const PARENT_NOTIF_FILTERS: { id: ParentNotifFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'activity', label: 'Activity' },
  { id: 'concern', label: 'Concern' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'events', label: 'Events' },
  { id: 'billing', label: 'Fees' },
];

export const PARENT_NOTIF_STORAGE_KEY = 'panacea.parent.notifications.v1';
export const PARENT_NOTIF_EVENT = 'panacea:parent-notifications';

export const PARENT_NOTIF_SEED: ParentNotification[] = [
  {
    id: 'pn1',
    message: 'Photo activity has been updated. Click to view',
    time: 'Today',
    unread: true,
    category: 'activity',
    icon: 'activity',
  },
  {
    id: 'pn2',
    message: 'A new invoice has been issued for Alex Demo Student',
    time: '08 August',
    unread: false,
    category: 'billing',
    icon: 'invoice',
  },
  {
    id: 'pn3',
    message: 'Invoice for Alex Demo Student was updated by Malika Thimisetty',
    time: '07 August',
    unread: false,
    category: 'billing',
    icon: 'invoice',
  },
  {
    id: 'pn4',
    message: 'A new debit note created for Alex Demo Student',
    time: '07 August',
    unread: false,
    category: 'billing',
    icon: 'invoice',
  },
  {
    id: 'pn5',
    message: 'Reminder to complete payment for invoice INV-3',
    time: '04 August',
    unread: false,
    category: 'billing',
    icon: 'invoice',
  },
  {
    id: 'pn6',
    message: 'Attendance marked for Rainbow Room — morning check-in complete',
    time: '03 August',
    unread: false,
    category: 'attendance',
    icon: 'activity',
  },
  {
    id: 'pn7',
    message: 'School event “Open House” is scheduled for next week',
    time: '02 August',
    unread: false,
    category: 'events',
    icon: 'activity',
  },
  {
    id: 'pn8',
    message: 'A concern was raised regarding snack preferences for Alex Demo Student',
    time: '01 August',
    unread: false,
    category: 'concern',
    icon: 'activity',
  },
];

function emitChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PARENT_NOTIF_EVENT));
}

export function loadParentNotifications(): ParentNotification[] {
  if (typeof window === 'undefined') return PARENT_NOTIF_SEED.map((n) => ({ ...n }));
  try {
    const raw = window.localStorage.getItem(PARENT_NOTIF_STORAGE_KEY);
    if (!raw) return PARENT_NOTIF_SEED.map((n) => ({ ...n }));
    const parsed = JSON.parse(raw) as ParentNotification[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return PARENT_NOTIF_SEED.map((n) => ({ ...n }));
    }
    return parsed;
  } catch {
    return PARENT_NOTIF_SEED.map((n) => ({ ...n }));
  }
}

export function saveParentNotifications(items: ParentNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PARENT_NOTIF_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  emitChange();
}

export function filterParentNotifications(
  items: ParentNotification[],
  filter: ParentNotifFilter,
): ParentNotification[] {
  return items.filter((n) => {
    if (filter === 'unread') return n.unread;
    if (filter === 'all') return true;
    return n.category === filter;
  });
}

export function markAllParentNotificationsRead(items: ParentNotification[]): ParentNotification[] {
  return items.map((n) => ({ ...n, unread: false }));
}

export function markParentNotificationRead(
  items: ParentNotification[],
  id: string,
): ParentNotification[] {
  return items.map((n) => (n.id === id ? { ...n, unread: false } : n));
}
