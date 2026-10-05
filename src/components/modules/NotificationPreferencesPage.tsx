'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  BellRing,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  MessageCircle,
  MessageSquareText,
  Search,
  Shield,
  Smartphone,
  Syringe,
  UserRound,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import '@/components/ui/module.css';
import './notification-preferences.css';

type Channel = 'push' | 'inApp';

type Situation = {
  id: string;
  label: string;
};

type Group = {
  id: string;
  /** Empty string = column headers only (no named subgroup), e.g. Comments. */
  title: string;
  situations: Situation[];
  /** When true, group header shows master Push / In-App controls (frontend convenience). */
  groupLevelControls?: boolean;
};

type Category = {
  id: string;
  title: string;
  groups: Group[];
};

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'parent-communication': <Users size={16} strokeWidth={2.1} />,
  attendance: <ClipboardList size={16} strokeWidth={2.1} />,
  'event-calendar': <CalendarDays size={16} strokeWidth={2.1} />,
  comments: <MessageSquareText size={16} strokeWidth={2.1} />,
  messaging: <MessageCircle size={16} strokeWidth={2.1} />,
  billing: <CreditCard size={16} strokeWidth={2.1} />,
  forms: <FileText size={16} strokeWidth={2.1} />,
  assessment: <ClipboardList size={16} strokeWidth={2.1} />,
  immunization: <Syringe size={16} strokeWidth={2.1} />,
  profile: <UserRound size={16} strokeWidth={2.1} />,
  'school-info': <Building2 size={16} strokeWidth={2.1} />,
  'security-features': <Shield size={16} strokeWidth={2.1} />,
};

type PrefState = Record<string, { push: boolean; inApp: boolean }>;

type GroupChannelState = 'on' | 'off' | 'mixed';

const STORAGE_KEY = 'panacea.notificationPreferences.v1';

const ACTIVITY_ITEMS: Situation[] = [
  { id: 'pc-act-bottle', label: 'Bottle' },
  { id: 'pc-act-dancing', label: 'Dancing' },
  { id: 'pc-act-playing', label: 'Playing' },
  { id: 'pc-act-cricket', label: 'Cricket' },
  { id: 'pc-act-photo', label: 'Photo' },
  { id: 'pc-act-video', label: 'Video' },
  { id: 'pc-act-announcement', label: 'Announcement' },
  { id: 'pc-act-diary', label: 'Diary' },
  { id: 'pc-act-todays-mood', label: "Today's Mood" },
  { id: 'pc-act-stem', label: 'Stem' },
  { id: 'pc-act-sensorial', label: 'Sensorial' },
  { id: 'pc-act-epl', label: 'EPL' },
  { id: 'pc-act-file-upload', label: 'File Upload' },
  { id: 'pc-act-gross-motor', label: 'Gross Motor' },
  { id: 'pc-act-fine-motor', label: 'Fine Motor' },
  { id: 'pc-act-dramatics', label: 'Dramatics' },
  { id: 'pc-act-circle-time', label: 'Circle Time' },
  { id: 'pc-act-self-reliance', label: 'Self Reliance' },
  { id: 'pc-act-block-hour', label: 'Block Hour' },
  { id: 'pc-act-language', label: 'Language' },
  { id: 'pc-act-math', label: 'Math' },
  { id: 'pc-act-rhyme', label: 'Rhyme' },
  { id: 'pc-act-art-craft', label: 'Art & Craft' },
  { id: 'pc-act-science', label: 'Science' },
  { id: 'pc-act-stories', label: 'Stories' },
  { id: 'pc-act-food', label: 'Food' },
  { id: 'pc-act-nap', label: 'Nap' },
  { id: 'pc-act-potty', label: 'Potty' },
  { id: 'pc-act-milestone', label: 'Milestone' },
  { id: 'pc-act-kudos', label: 'Kudos' },
  { id: 'pc-act-medicine', label: 'Medicine' },
  { id: 'pc-act-incident', label: 'Incident' },
  { id: 'pc-act-accident', label: 'Accident' },
  { id: 'pc-act-reminder', label: 'Reminder' },
  { id: 'pc-act-newsletter', label: 'Newsletter' },
  { id: 'pc-act-virtual-class', label: 'Virtual Class' },
  { id: 'pc-act-medical-log', label: 'Medical Log' },
  { id: 'pc-act-technology', label: 'Technology' },
  { id: 'pc-act-observations', label: 'Observations' },
  { id: 'pc-act-nap-time-mode', label: 'Nap (Time Mode)' },
  { id: 'pc-act-art', label: 'Art' },
  { id: 'pc-act-research', label: 'Research' },
  { id: 'pc-act-environment', label: 'Environment' },
  { id: 'pc-act-portfolio', label: 'Portfolio' },
];

const CATEGORIES: Category[] = [
  {
    id: 'parent-communication',
    title: 'Parent Communication',
    groups: [
      {
        id: 'concern',
        title: 'Concern',
        situations: [
          { id: 'pc-concern-approved', label: 'When your concern is approved' },
        ],
      },
      {
        id: 'notes',
        title: 'Notes',
        situations: [
          { id: 'pc-note-approved', label: 'When a student note is approved' },
        ],
      },
      {
        id: 'activity',
        title: 'Activity (i.e., New Activity Post)',
        groupLevelControls: true,
        situations: ACTIVITY_ITEMS,
      },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    groups: [
      {
        id: 'student-attendance',
        title: 'Student Attendance',
        situations: [
          { id: 'att-checkin', label: 'Student Check-in/ Check-out' },
          { id: 'att-absent', label: 'Attendance marked as absent.' },
        ],
      },
      {
        id: 'student-leave',
        title: 'Student Leave',
        situations: [
          {
            id: 'att-student-leave',
            label: 'New leave requests or any update to the leave request',
          },
          { id: 'att-leave-decision', label: 'Leave approval and rejection' },
        ],
      },
    ],
  },
  {
    id: 'event-calendar',
    title: 'Event Calendar',
    groups: [
      {
        id: 'events',
        title: 'Events',
        situations: [
          { id: 'ev-related-updates', label: 'New Events and related updates' },
        ],
      },
    ],
  },
  {
    id: 'comments',
    title: 'Comments',
    groups: [
      {
        id: 'comments',
        title: '',
        situations: [
          {
            id: 'cm-tagged',
            label:
              'New comments on posts you are tagged in Activity, Lesson, Notes, Concerns, Leaves, Observations, Events and Invoices',
          },
          { id: 'cm-likes', label: 'New likes on comments added by you' },
        ],
      },
    ],
  },
  {
    id: 'messaging',
    title: 'Private & Group Messaging',
    groups: [
      {
        id: 'chat',
        title: '',
        situations: [{ id: 'msg-new', label: 'New chat messages' }],
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    groups: [
      {
        id: 'invoice-debit-notes',
        title: 'Invoice and Debit Notes',
        situations: [
          {
            id: 'bill-invoice-create-update',
            label:
              'New invoice creation and updation for students within your assigned Room',
          },
        ],
      },
      {
        id: 'payment',
        title: 'Payment',
        situations: [
          { id: 'bill-payment-updates', label: 'Payment updates' },
          { id: 'bill-fee-reminders', label: 'Fee reminders' },
        ],
      },
      {
        id: 'stripe-auto-charge',
        title: 'Stripe auto charge setting',
        situations: [
          {
            id: 'bill-autopay-alert',
            label:
              'Alert about AutoPay setting as soon as you are added to the School Account',
          },
        ],
      },
      {
        id: 'ach',
        title: 'ACH',
        situations: [
          { id: 'bill-payment-failures', label: 'Payment failures' },
          {
            id: 'bill-bank-payments',
            label:
              'Bank payments (You will receive a micro-deposit link where you have to enter the otp for verification)',
          },
        ],
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    groups: [
      {
        id: 'student-forms',
        title: 'Student Forms',
        situations: [
          { id: 'form-shared', label: 'New forms are shared with you' },
          {
            id: 'form-approval',
            label: 'Form approval, rejection or resubmissions required',
          },
          { id: 'form-reminders', label: 'Form Reminders' },
        ],
      },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment',
    groups: [
      {
        id: 'assessment',
        title: '',
        situations: [
          { id: 'as-observations-shared', label: 'Observations shared with you' },
        ],
      },
    ],
  },
  {
    id: 'immunization',
    title: 'Immunization',
    groups: [
      {
        id: 'immunization',
        title: '',
        situations: [
          { id: 'imm-vaccine-reminder', label: 'Get vaccine reminder from school' },
        ],
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profile',
    groups: [
      {
        id: 'documents',
        title: 'Documents',
        situations: [
          { id: 'pf-docs-upload-school', label: 'Documents upload by school' },
        ],
      },
    ],
  },
  {
    id: 'school-info',
    title: 'School Info',
    groups: [
      {
        id: 'school-info',
        title: '',
        situations: [{ id: 'si-resource-center', label: 'Resource Center' }],
      },
    ],
  },
  {
    id: 'security-features',
    title: 'Security Features',
    groups: [
      {
        id: 'security-features',
        title: '',
        situations: [{ id: 'sec-bus-tracking', label: 'Bus Tracking' }],
      },
    ],
  },
];

function buildDefaultPrefs(): PrefState {
  const next: PrefState = {};
  for (const cat of CATEGORIES) {
    for (const group of cat.groups) {
      for (const sit of group.situations) {
        next[sit.id] = { push: true, inApp: true };
      }
    }
  }
  // Match screenshot: messaging In-App may be off
  next['msg-new'] = { push: true, inApp: false };
  return next;
}

function getGroupChannelState(
  prefs: PrefState,
  situations: Situation[],
  channel: Channel
): GroupChannelState {
  if (!situations.length) return 'off';
  let onCount = 0;
  for (const sit of situations) {
    const value = prefs[sit.id] ?? { push: true, inApp: true };
    if (value[channel]) onCount += 1;
  }
  if (onCount === 0) return 'off';
  if (onCount === situations.length) return 'on';
  return 'mixed';
}

function Switch({
  on,
  label,
  onToggle,
  indeterminate = false,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
  indeterminate?: boolean;
}) {
  return (
    <button
      type="button"
      className={`npref-switch${on ? ' is-on' : ''}${indeterminate ? ' is-mixed' : ''}`}
      role="switch"
      aria-checked={indeterminate ? 'mixed' : on}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="npref-switchThumb" aria-hidden />
    </button>
  );
}

export function NotificationPreferencesPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [prefs, setPrefs] = useState<PrefState>(() => buildDefaultPrefs());
  const [open, setOpen] = useState<Record<string, boolean>>({
    'parent-communication': true,
  });
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabledCount = useMemo(() => {
    let count = 0;
    for (const value of Object.values(prefs)) {
      if (value.push || value.inApp) count += 1;
    }
    return count;
  }, [prefs]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          prefs?: PrefState;
          open?: Record<string, boolean>;
        };
        if (parsed.prefs) setPrefs((prev) => ({ ...prev, ...parsed.prefs }));
        if (parsed.open) setOpen((prev) => ({ ...prev, ...parsed.open }));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ prefs, open }));
    } catch {
      /* quota */
    }
  }, [prefs, open, loaded]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showPreferenceUpdated = () => {
    setToast('Preference updated');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => {
      const groups = cat.groups
        .map((group) => {
          const situations = group.situations.filter(
            (s) =>
              s.label.toLowerCase().includes(q) ||
              group.title.toLowerCase().includes(q) ||
              cat.title.toLowerCase().includes(q)
          );
          return { ...group, situations };
        })
        .filter((g) => g.situations.length > 0);
      return { ...cat, groups };
    }).filter((c) => c.groups.length > 0);
  }, [query]);

  const toggleOpen = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePref = (situationId: string, channel: Channel) => {
    setPrefs((prev) => {
      const current = prev[situationId] ?? { push: true, inApp: true };
      return {
        ...prev,
        [situationId]: { ...current, [channel]: !current[channel] },
      };
    });
    showPreferenceUpdated();
  };

  const toggleGroupChannel = (group: Group, channel: Channel) => {
    const state = getGroupChannelState(prefs, group.situations, channel);
    // Mixed / all-off → turn all ON; all-on → turn all OFF
    const nextValue = state !== 'on';
    setPrefs((prev) => {
      const next = { ...prev };
      for (const sit of group.situations) {
        const current = next[sit.id] ?? { push: true, inApp: true };
        next[sit.id] = { ...current, [channel]: nextValue };
      }
      return next;
    });
    showPreferenceUpdated();
  };

  return (
    <div className="mod-page npref-page">
      <nav className="npref-crumbs" aria-label="Breadcrumb">
        <span>Panacea</span>
        <span className="npref-crumbsSep" aria-hidden>
          {'>>'}
        </span>
        <strong>Notification preferences</strong>
      </nav>

      <motion.header
        className="npref-hero"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="npref-heroTop">
          <button
            type="button"
            className="npref-backBtn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>

          <div className="npref-heroMain">
            <div className="npref-heroArt" aria-hidden>
              <motion.div
                className="npref-heroBell"
                animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <BellRing size={28} strokeWidth={2} />
                <span className="npref-heroBadge">{Math.min(enabledCount, 99)}</span>
              </motion.div>
              <span className="npref-heroSpark npref-heroSpark--a" />
              <span className="npref-heroSpark npref-heroSpark--b" />
            </div>

            <div className="npref-heroCopy">
              <div className="npref-nickRow">
                <span className="npref-nickname">Ping Buddy</span>
                <span className="npref-nickHint">your friendly alert desk</span>
              </div>
              <h1 className="npref-pageTitle">Notification Preferences</h1>
              <p className="npref-pageDesc">
                Tune Push and In-App alerts so you only hear what matters — school updates stay
                close, noise stays out.
              </p>
              <div className="npref-featureRow" aria-label="Features">
                <span className="npref-featureChip">
                  <Smartphone size={13} strokeWidth={2.2} aria-hidden />
                  Push
                </span>
                <span className="npref-featureChip">
                  <Bell size={13} strokeWidth={2.2} aria-hidden />
                  In-App
                </span>
                <span className="npref-featureChip">
                  <Shield size={13} strokeWidth={2.2} aria-hidden />
                  Instant save
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="npref-search">
        <Search size={16} aria-hidden />
        <input
          type="search"
          placeholder="Search notification preferences..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search notification preferences"
        />
      </div>

      <div className="npref-list">
        {!filtered.length ? (
          <p className="npref-empty">No matching notifications found</p>
        ) : (
          filtered.map((cat) => {
            const expanded = Boolean(open[cat.id]) || Boolean(query.trim());
            return (
              <article key={cat.id} className="npref-card">
                <button
                  type="button"
                  className="npref-cardHead"
                  aria-expanded={expanded}
                  onClick={() => toggleOpen(cat.id)}
                >
                  <span className="npref-cardHeadLeft">
                    <span className="npref-catBadge" aria-hidden>
                      {CATEGORY_ICONS[cat.id] ?? <Bell size={16} strokeWidth={2.1} />}
                    </span>
                    <h2 className="npref-cardTitle">{cat.title}</h2>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`npref-chevron${expanded ? ' is-open' : ''}`}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="npref-cardBody">
                        {cat.groups.map((group) => {
                          const pushState = group.groupLevelControls
                            ? getGroupChannelState(prefs, group.situations, 'push')
                            : null;
                          const inAppState = group.groupLevelControls
                            ? getGroupChannelState(prefs, group.situations, 'inApp')
                            : null;

                          return (
                            <div key={group.id} className="npref-group">
                              <div
                                className={`npref-groupHead${
                                  group.groupLevelControls ? ' has-controls' : ''
                                }${!group.title ? ' is-columns-only' : ''}`}
                              >
                                {group.title ? (
                                  <p className="npref-groupTitle">{group.title}</p>
                                ) : (
                                  <span className="npref-groupTitleSpacer" aria-hidden />
                                )}
                                {group.groupLevelControls && pushState && inAppState ? (
                                  <>
                                    <div className="npref-switchCell npref-groupControl">
                                      <span className="npref-colLabel">Push</span>
                                      <Switch
                                        on={pushState === 'on'}
                                        indeterminate={pushState === 'mixed'}
                                        label={`Enable Push notifications for all ${group.title}`}
                                        onToggle={() => toggleGroupChannel(group, 'push')}
                                      />
                                    </div>
                                    <div className="npref-switchCell npref-groupControl">
                                      <span className="npref-colLabel">In-App</span>
                                      <Switch
                                        on={inAppState === 'on'}
                                        indeterminate={inAppState === 'mixed'}
                                        label={`Enable In-App notifications for all ${group.title}`}
                                        onToggle={() => toggleGroupChannel(group, 'inApp')}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="npref-colLabel">Push</p>
                                    <p className="npref-colLabel">In-App</p>
                                  </>
                                )}
                              </div>
                              {group.situations.map((sit) => {
                                const value = prefs[sit.id] ?? { push: true, inApp: true };
                                return (
                                  <div key={sit.id} className="npref-row">
                                    <p className="npref-rowLabel">{sit.label}</p>
                                    <div className="npref-switchCell">
                                      <Switch
                                        on={value.push}
                                        label={`Enable Push notifications for ${sit.label}`}
                                        onToggle={() => togglePref(sit.id, 'push')}
                                      />
                                    </div>
                                    <div className="npref-switchCell">
                                      <Switch
                                        on={value.inApp}
                                        label={`Enable In-App notifications for ${sit.label}`}
                                        onToggle={() => togglePref(sit.id, 'inApp')}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="npref-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
