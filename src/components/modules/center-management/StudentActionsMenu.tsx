'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  History,
  PlusSquare,
  Sparkles,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import type { Student } from '@/lib/center-management/types';
import {
  formatActivityWhen,
  getActivityEvents,
  type ActivityActor,
  type ActivityEvent,
} from '@/lib/center-management/activityLogStore';
import { FloatingMenu } from './ui';
import './student-actions.css';

type Props = {
  student: Student;
  onDeleteStudent: () => void;
  onToast?: (message: string) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const MENU_ITEMS: {
  id: string;
  label: string;
  hint: string;
  tone: 'logs' | 'parent' | 'danger' | 'activity';
  actor?: ActivityActor;
  icon: typeof History;
}[] = [
  {
    id: 'stu-logs',
    label: 'Student Logs',
    hint: 'Profile change history',
    tone: 'logs',
    actor: 'student',
    icon: History,
  },
  {
    id: 'p1-logs',
    label: 'Parent One Logs',
    hint: 'Primary parent activity',
    tone: 'parent',
    actor: 'parent1',
    icon: UserRound,
  },
  {
    id: 'p2-logs',
    label: 'Parent Two Logs',
    hint: 'Secondary parent activity',
    tone: 'parent',
    actor: 'parent2',
    icon: Users,
  },
  {
    id: 'delete',
    label: 'Delete Student',
    hint: 'Remove permanently',
    tone: 'danger',
    icon: Trash2,
  },
  {
    id: 'post',
    label: 'Post Activity',
    hint: 'Share with parents',
    tone: 'activity',
    icon: PlusSquare,
  },
];

function drawerTitle(actor: ActivityActor) {
  if (actor === 'student') return 'Student Logs';
  if (actor === 'parent1') return 'Parent One Logs';
  return 'Parent Two Logs';
}

function drawerBlurb(actor: ActivityActor) {
  if (actor === 'student') return 'Every profile edit, status change, and field update';
  if (actor === 'parent1') return 'Records for the primary parent contact';
  return 'Records for the secondary parent contact';
}

function dayLabel(iso: string) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yday = new Date();
    yday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Earlier';
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function prettyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StudentActionsMenu({ student, onDeleteStudent }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [actor, setActor] = useState<ActivityActor>('student');
  const [detail, setDetail] = useState<ActivityEvent | null>(null);

  const events = useMemo(
    () => (logsOpen ? getActivityEvents(student, actor) : []),
    [student, actor, logsOpen],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const ev of events) {
      const key = dayLabel(ev.at);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [events]);

  const openLogs = (next: ActivityActor) => {
    setActor(next);
    setLogsOpen(true);
    setMenuOpen(false);
  };

  const onPick = (id: string, nextActor?: ActivityActor) => {
    if (id === 'delete') {
      setMenuOpen(false);
      onDeleteStudent();
      return;
    }
    if (id === 'post') {
      setMenuOpen(false);
      const returnTo = encodeURIComponent(`/center-management/students/${student.id}`);
      router.push(
        `/parent-communication/activities/post?studentId=${encodeURIComponent(student.id)}&returnTo=${returnTo}`,
      );
      return;
    }
    if (nextActor) openLogs(nextActor);
  };

  return (
    <>
      <FloatingMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        align="end"
        minWidth={280}
        maxHeight={420}
        menuClassName="sa-menu"
        trigger={
          <motion.button
            type="button"
            className={`ui-btn ui-btn-outline sa-trigger${menuOpen ? ' is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="sa-trigger-orb" aria-hidden>
              <Sparkles size={13} />
            </span>
            <span>Actions</span>
            <motion.span
              className="sa-trigger-chevron"
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.24, ease }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </motion.button>
        }
      >
        <div className="sa-menu-glow" aria-hidden />
        <div className="sa-menu-head">
          <strong>Quick actions</strong>
          <span>{student.name.split(/\s+/)[0]}</span>
        </div>
        <div className="cm-dd-list sa-menu-list" role="menu">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                role="menuitem"
                className={`sa-menu-item tone-${item.tone}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.28, ease }}
                whileHover={{ x: 3 }}
                onClick={() => onPick(item.id, item.actor)}
              >
                <span className="sa-menu-ico" aria-hidden>
                  <Icon size={15} />
                </span>
                <span className="sa-menu-copy">
                  <strong>{item.label}</strong>
                  <em>{item.hint}</em>
                </span>
                <span className="sa-menu-go" aria-hidden>
                  <ArrowRight size={14} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </FloatingMenu>

      <Drawer
        open={logsOpen}
        title={drawerTitle(actor)}
        subtitle={drawerBlurb(actor)}
        meta={`${events.length} event${events.length === 1 ? '' : 's'}`}
        icon={<History size={18} />}
        onClose={() => setLogsOpen(false)}
        bodyClassName="sa-drawer-body"
      >
        <div className="sa-drawer">
          <motion.div
            className="sa-drawer-hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease }}
          >
            <div className="sa-drawer-hero-orbits" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="sa-drawer-hero-copy">
              <span className="sa-drawer-kicker">Activity trail</span>
              <strong>{student.name}</strong>
              <p>{drawerBlurb(actor)}</p>
            </div>
            <div className="sa-drawer-count">
              <em>{events.length}</em>
              <span>entries</span>
            </div>
          </motion.div>

          {events.length === 0 ? (
            <motion.div
              className="sa-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease }}
            >
              <span className="sa-empty-ring" aria-hidden>
                <History size={26} strokeWidth={1.4} />
              </span>
              <strong>No activity yet</strong>
              <p>Updates will appear here when changes are made.</p>
            </motion.div>
          ) : (
            <div className="sa-groups">
              {grouped.map(([day, list], gi) => (
                <section key={day} className="sa-group">
                  <motion.header
                    className="sa-group-label"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.05, duration: 0.28, ease }}
                  >
                    <span>{day}</span>
                    <i />
                  </motion.header>
                  <ul className="sa-timeline">
                    <AnimatePresence initial={false}>
                      {list.map((ev, i) => (
                        <motion.li
                          key={ev.id}
                          className="sa-event"
                          initial={{ opacity: 0, x: 22, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                          transition={{
                            delay: Math.min(gi * 0.04 + i * 0.06, 0.35),
                            duration: 0.38,
                            ease,
                          }}
                        >
                          <span className="sa-event-rail" aria-hidden>
                            <span className="sa-event-pulse" />
                          </span>
                          <article className="sa-event-card">
                            <div className="sa-event-top">
                              <strong>{ev.title}</strong>
                              <button
                                type="button"
                                className="sa-view-detail"
                                onClick={() => setDetail(ev)}
                              >
                                View Detail
                                <ArrowRight size={13} />
                              </button>
                            </div>
                            <time dateTime={ev.at}>{formatActivityWhen(ev.at)}</time>
                            <div className="sa-event-by">
                              <span className="sa-event-avatar" aria-hidden>
                                {initials(ev.updatedBy)}
                              </span>
                              <p>
                                Updated by <strong>{ev.updatedBy}</strong>
                              </p>
                            </div>
                            {ev.changes.length ? (
                              <div className="sa-event-chips" aria-hidden>
                                {ev.changes.slice(0, 3).map((c) => (
                                  <span key={c.key}>{prettyKey(c.key)}</span>
                                ))}
                                {ev.changes.length > 3 ? (
                                  <span>+{ev.changes.length - 3}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </article>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        open={Boolean(detail)}
        title="Change Log"
        subtitle={detail ? `${formatActivityWhen(detail.at)} · ${detail.updatedBy}` : undefined}
        elevated
        icon={<Sparkles size={18} />}
        onClose={() => setDetail(null)}
        footer={
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => setDetail(null)}>
            Close
          </button>
        }
      >
        {detail ? (
          <motion.div
            className="sa-changelog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="sa-changelog-hero">
              <div className="sa-changelog-hero-glow" aria-hidden />
              <span className="sa-changelog-badge">{detail.title}</span>
              <p>
                Captured for <strong>{student.name}</strong>
              </p>
              <div className="sa-changelog-meta">
                <span>{formatActivityWhen(detail.at)}</span>
                <span className="sa-dot" aria-hidden />
                <span>by {detail.updatedBy}</span>
              </div>
            </div>

            {detail.snapshot ? (
              <div className="sa-snapshot">
                <div className="sa-section-head">
                  <h4>Record snapshot</h4>
                  <span>{Object.keys(detail.snapshot).length} fields</span>
                </div>
                <div className="sa-snapshot-grid">
                  {Object.entries(detail.snapshot).map(([key, value], i) => (
                    <motion.div
                      key={key}
                      className="sa-snap-row"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i, duration: 0.24, ease }}
                      whileHover={{ y: -2 }}
                    >
                      <span>{prettyKey(key)}</span>
                      <strong>{String(value ?? '—')}</strong>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}

            {detail.changes.length ? (
              <div className="sa-diff">
                <div className="sa-section-head">
                  <h4>Field changes</h4>
                  <span>{detail.changes.length} edits</span>
                </div>
                <ul>
                  {detail.changes.map((c, i) => {
                    const removed = c.before !== undefined && c.before !== null && c.before !== '';
                    const added = c.after !== undefined && c.after !== null && c.after !== '';
                    return (
                      <motion.li
                        key={`${c.key}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.26, ease }}
                      >
                        <div className="sa-diff-title">
                          <code className="sa-diff-key">{prettyKey(c.key)}</code>
                          <span className="sa-diff-tag">
                            {removed && added ? 'Updated' : added ? 'Added' : 'Cleared'}
                          </span>
                        </div>
                        <div className="sa-diff-vals">
                          {removed ? (
                            <span className="sa-diff-before">{String(c.before)}</span>
                          ) : (
                            <span className="sa-diff-empty">Empty</span>
                          )}
                          <motion.span
                            className="sa-diff-arrow"
                            aria-hidden
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <ArrowRight size={14} />
                          </motion.span>
                          {added ? (
                            <span className="sa-diff-after">{String(c.after)}</span>
                          ) : (
                            <span className="sa-diff-empty">Empty</span>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </Modal>
    </>
  );
}
