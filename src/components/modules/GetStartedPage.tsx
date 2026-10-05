'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  DoorOpen,
  Megaphone,
  Rocket,
  UserPlus,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import './get-started.css';

type TaskAction = 'explore-students' | 'add-student' | 'navigate';

type StepTask = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  action: TaskAction;
  href?: string;
};

type StepGroup = {
  id: string;
  title: string;
  hint: string;
  icon: 'student' | 'room' | 'staff' | 'announce';
  tasks: StepTask[];
};

type MockStudent = {
  id: string;
  firstName: string;
  lastName: string;
  room: string;
  ageGroup: string;
  status: string;
};

const STORAGE_KEY = 'panacea.getStarted.v1';
const STUDENTS_KEY = 'panacea.getStarted.students.v1';

const SEED_STUDENTS: MockStudent[] = [
  {
    id: 's1',
    firstName: 'Aanya',
    lastName: 'Sharma',
    room: 'Sunshine Room',
    ageGroup: '3–4 years',
    status: 'Active',
  },
  {
    id: 's2',
    firstName: 'Kabir',
    lastName: 'Mehta',
    room: 'Rainbow Room',
    ageGroup: '2–3 years',
    status: 'Active',
  },
  {
    id: 's3',
    firstName: 'Mia',
    lastName: 'Patel',
    room: 'Star Room',
    ageGroup: '4–5 years',
    status: 'On Hold',
  },
];

const ROOM_OPTIONS = ['Sunshine Room', 'Rainbow Room', 'Star Room', 'Moon Room'];
const AGE_OPTIONS = ['Infant', '1–2 years', '2–3 years', '3–4 years', '4–5 years'];

const GROUPS: StepGroup[] = [
  {
    id: 'students',
    title: 'Add your first student',
    hint: 'Set up student profiles so families can get started.',
    icon: 'student',
    tasks: [
      {
        id: 'explore-students',
        title: 'Explore student profiles',
        description: 'Browse sample profiles and see how student records are organized.',
        actionLabel: 'Explore profiles',
        action: 'explore-students',
      },
      {
        id: 'add-first-student',
        title: 'Add first student',
        description: 'Create your first student record with basic details.',
        actionLabel: 'Add student',
        action: 'add-student',
      },
    ],
  },
  {
    id: 'rooms',
    title: 'Add your first room',
    hint: 'Create classrooms so you can assign students and staff.',
    icon: 'room',
    tasks: [
      {
        id: 'explore-rooms',
        title: 'Review room setup',
        description: 'See capacity, age groups, and room assignments.',
        actionLabel: 'Open rooms',
        action: 'navigate',
        href: '/center-management/rooms',
      },
      {
        id: 'add-first-room',
        title: 'Add first room',
        description: 'Create a classroom with name and capacity.',
        actionLabel: 'Add room',
        action: 'navigate',
        href: '/center-management/rooms',
      },
    ],
  },
  {
    id: 'staff',
    title: 'Add your first staff',
    hint: 'Invite teachers and admins to help run the center.',
    icon: 'staff',
    tasks: [
      {
        id: 'explore-staff',
        title: 'Browse staff directory',
        description: 'Check roles, rooms, and staff contact details.',
        actionLabel: 'Open staff',
        action: 'navigate',
        href: '/center-management/staff',
      },
      {
        id: 'add-first-staff',
        title: 'Add first staff',
        description: 'Add a teacher or admin to your team.',
        actionLabel: 'Add staff',
        action: 'navigate',
        href: '/center-management/staff/add',
      },
    ],
  },
  {
    id: 'announce',
    title: 'Create first announcement',
    hint: 'Share a welcome message with parents or staff.',
    icon: 'announce',
    tasks: [
      {
        id: 'explore-announce',
        title: 'Open announcements',
        description: 'See how announcements appear for your audience.',
        actionLabel: 'Open announcements',
        action: 'navigate',
        href: '/messages/staff-announcement',
      },
      {
        id: 'create-announce',
        title: 'Send a welcome announcement',
        description: 'Post a short welcome note for families or staff.',
        actionLabel: 'Create announcement',
        action: 'navigate',
        href: '/messages/staff-announcement',
      },
    ],
  },
];

function GroupIcon({ type }: { type: StepGroup['icon'] }) {
  if (type === 'student') return <UserPlus size={18} />;
  if (type === 'room') return <DoorOpen size={18} />;
  if (type === 'staff') return <Users size={18} />;
  return <Megaphone size={18} />;
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const emptyForm = {
  firstName: '',
  lastName: '',
  room: ROOM_OPTIONS[0],
  ageGroup: AGE_OPTIONS[2],
};

export function GetStartedPage() {
  const router = useRouter();
  const allTaskIds = useMemo(() => GROUPS.flatMap((g) => g.tasks.map((t) => t.id)), []);

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    students: true,
    rooms: false,
    staff: false,
    announce: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [students, setStudents] = useState<MockStudent[]>(SEED_STUDENTS);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          done?: Record<string, boolean>;
          open?: Record<string, boolean>;
        };
        if (parsed.done) setDone(parsed.done);
        if (parsed.open) setOpenGroups((prev) => ({ ...prev, ...parsed.open }));
      }
      const sRaw = localStorage.getItem(STUDENTS_KEY);
      if (sRaw) {
        const parsedStudents = JSON.parse(sRaw) as MockStudent[];
        if (Array.isArray(parsedStudents) && parsedStudents.length) {
          setStudents(parsedStudents);
        }
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ done, open: openGroups }));
    } catch {
      /* quota */
    }
  }, [done, openGroups, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch {
      /* quota */
    }
  }, [students, loaded]);

  const completedCount = allTaskIds.filter((id) => done[id]).length;
  const totalCount = allTaskIds.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const nextTask = useMemo(() => {
    for (const group of GROUPS) {
      for (const task of group.tasks) {
        if (!done[task.id]) return task;
      }
    }
    return null;
  }, [done]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDone = (taskId: string) => {
    setDone((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const markDone = (taskId: string) => {
    setDone((prev) => ({ ...prev, [taskId]: true }));
  };

  const runTaskAction = (task: StepTask) => {
    if (task.action === 'explore-students') {
      setExploreOpen(true);
      markDone('explore-students');
      return;
    }
    if (task.action === 'add-student') {
      setForm(emptyForm);
      setFormError('');
      setAddOpen(true);
      return;
    }
    if (task.href) router.push(task.href);
  };

  const saveStudent = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    if (!firstName || !lastName) {
      setFormError('First name and last name are required.');
      return;
    }
    const next: MockStudent = {
      id: `local-${Date.now()}`,
      firstName,
      lastName,
      room: form.room,
      ageGroup: form.ageGroup,
      status: 'Active',
    };
    setStudents((prev) => [next, ...prev]);
    markDone('add-first-student');
    setAddOpen(false);
    setForm(emptyForm);
    setFormError('');
  };

  return (
    <div className="mod-page gs-page">
      <nav className="gs-crumbs" aria-label="Breadcrumb">
        <span>Panacea</span>
        <span className="gs-crumbsSep" aria-hidden>
          {'>>'}
        </span>
        <strong>Get started</strong>
      </nav>

      <div className="gs-pageTitleRow">
        <button
          type="button"
          className="gs-backBtn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <div>
          <h1 className="gs-pageTitle">Get Started</h1>
          <p className="gs-pageDesc">
            Complete a few quick setup steps to make your center ready for families and staff.
          </p>
        </div>
      </div>

      <section className="gs-hero" aria-label="First steps progress">
        <div className="gs-heroTop">
          <div className="gs-titleRow">
            <span className="gs-titleIcon" aria-hidden>
              <Rocket size={22} />
            </span>
            <div>
              <h2 className="gs-title">First steps</h2>
              <p className="gs-subtitle">
                Walk through students, rooms, staff, and your first announcement.
              </p>
            </div>
          </div>
          <div className="gs-progressMeta">
            <p className="gs-progressCount">
              {completedCount} of {totalCount} complete
            </p>
            <p className="gs-nextUp">
              {nextTask ? `Next up: ${nextTask.title}` : 'All setup steps are complete'}
            </p>
          </div>
        </div>
        <div className="gs-progressTrack" aria-hidden>
          <div className="gs-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <div className="gs-list">
        {GROUPS.map((group) => {
          const groupDone = group.tasks.filter((t) => done[t.id]).length;
          const expanded = Boolean(openGroups[group.id]);
          const allDone = groupDone === group.tasks.length;

          return (
            <article key={group.id} className="gs-card">
              <button
                type="button"
                className="gs-cardHead"
                aria-expanded={expanded}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="gs-cardIcon" aria-hidden>
                  <GroupIcon type={group.icon} />
                </span>
                <span className="gs-cardHeadText">
                  <p className="gs-cardTitle">{group.title}</p>
                  <p className="gs-cardHint">{group.hint}</p>
                </span>
                <span className="gs-cardMeta">
                  <span className={`gs-cardCount${allDone ? ' is-done' : ''}`}>
                    {groupDone}/{group.tasks.length}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`gs-chevron${expanded ? ' is-open' : ''}`}
                    aria-hidden
                  />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="gs-cardBody">
                      {group.tasks.map((task) => {
                        const isDone = Boolean(done[task.id]);
                        return (
                          <div key={task.id} className={`gs-task${isDone ? ' is-done' : ''}`}>
                            <button
                              type="button"
                              className={`gs-check${isDone ? ' is-on' : ''}`}
                              aria-label={
                                isDone
                                  ? `Mark ${task.title} incomplete`
                                  : `Mark ${task.title} done`
                              }
                              onClick={() => toggleDone(task.id)}
                            >
                              {isDone ? <Check size={13} strokeWidth={3} /> : null}
                            </button>
                            <div className="gs-taskMain">
                              <div className="gs-taskCopy">
                                <p className="gs-taskTitle">{task.title}</p>
                                <p className="gs-taskDesc">{task.description}</p>
                              </div>
                              <div className="gs-taskActions">
                                {isDone ? (
                                  <button
                                    type="button"
                                    className="gs-linkBtn is-muted"
                                    onClick={() => toggleDone(task.id)}
                                  >
                                    Undo
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="gs-linkBtn"
                                      onClick={() => toggleDone(task.id)}
                                    >
                                      Mark as done
                                    </button>
                                    <button
                                      type="button"
                                      className="ui-btn ui-btn-primary"
                                      onClick={() => runTaskAction(task)}
                                    >
                                      {task.actionLabel}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          );
        })}
      </div>

      <Modal
        open={exploreOpen}
        title="Student profiles"
        onClose={() => setExploreOpen(false)}
        wide
        footer={
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => setExploreOpen(false)}
          >
            Close
          </button>
        }
      >
        <p className="gs-exploreLead">
          Sample profiles for this center. Explore how names, rooms, and status appear — no
          navigation away from Get Started.
        </p>
        <div className="gs-profileList">
          {students.map((s) => (
            <div key={s.id} className="gs-profileCard">
              <span className="gs-avatar" aria-hidden>
                {initials(s.firstName, s.lastName)}
              </span>
              <div className="gs-profileBody">
                <p className="gs-profileName">
                  {s.firstName} {s.lastName}
                </p>
                <p className="gs-profileMeta">
                  {s.room} · {s.ageGroup}
                </p>
              </div>
              <span className={`gs-status${s.status === 'Active' ? ' is-active' : ''}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={addOpen}
        title="Add student"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveStudent}>
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label" htmlFor="gs-first-name">
              First name <span className="req">*</span>
            </label>
            <input
              id="gs-first-name"
              className="ui-input"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="e.g. Aanya"
              autoComplete="off"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="gs-last-name">
              Last name <span className="req">*</span>
            </label>
            <input
              id="gs-last-name"
              className="ui-input"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="e.g. Sharma"
              autoComplete="off"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="gs-room">
              Room
            </label>
            <select
              id="gs-room"
              className="ui-select"
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            >
              {ROOM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="gs-age">
              Age group
            </label>
            <select
              id="gs-age"
              className="ui-select"
              value={form.ageGroup}
              onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value }))}
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        {formError ? <p className="gs-formError">{formError}</p> : null}
      </Modal>
    </div>
  );
}
