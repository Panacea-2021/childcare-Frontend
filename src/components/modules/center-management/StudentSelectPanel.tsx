'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  Layers,
  LayoutGrid,
  List,
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import {
  GROUP_OPTIONS,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  groupNames,
  initials,
  programNames,
  roomName,
} from '@/lib/center-management/studentsStore';
import { AppSelect } from './ui';
import './student-select-panel.css';

type Props = {
  students: Student[];
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  onSubmit: (selected: Student[]) => void;
  onCancel?: () => void;
};

type ViewMode = 'grid' | 'list';

const ease = [0.22, 1, 0.36, 1] as const;

function avatarTone(name: string) {
  const n = name.charCodeAt(0) % 4;
  return n === 0 ? '' : `tone-${n + 1}`;
}

function isQrReady(s: Student) {
  return Boolean(s.kioskCode || s.admissionNumber);
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 16;
    const id = requestAnimationFrame(function tick() {
      frame += 1;
      setValue(Math.round((target * frame) / steps));
      if (frame < steps) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [target]);
  return value;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone: string;
}) {
  const n = useCountUp(value);
  return (
    <motion.div
      className={`ssp-stat ssp-stat-${tone}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      <span className="ssp-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <strong>{n}</strong>
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

export function StudentSelectPanel({
  students,
  title = 'Student Kiosk Generator',
  subtitle = 'Select students to generate printable QR cards for check-in.',
  submitLabel = 'Continue',
  onSubmit,
  onCancel,
}: Props) {
  const [room, setRoom] = useState('all');
  const [group, setGroup] = useState('all');
  const [program, setProgram] = useState('all');
  const [qrReadyOnly, setQrReadyOnly] = useState(false);
  const [q, setQ] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    setSelected(new Set());
  }, [students]);

  useEffect(() => {
    setFiltering(true);
    const t = window.setTimeout(() => setFiltering(false), 220);
    return () => window.clearTimeout(t);
  }, [room, group, program, q, qrReadyOnly]);

  const classroomCount = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.roomIds.forEach((id) => set.add(id)));
    return set.size;
  }, [students]);

  const programCount = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.programIds.forEach((id) => set.add(id)));
    return set.size;
  }, [students]);

  const qrReadyCount = useMemo(() => students.filter(isQrReady).length, [students]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return students.filter((s) => {
      if (room !== 'all' && !s.roomIds.includes(room)) return false;
      if (group !== 'all' && !s.groupIds.includes(group)) return false;
      if (program !== 'all' && !s.programIds.includes(program)) return false;
      if (qrReadyOnly && !isQrReady(s)) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        (s.admissionNumber || '').toLowerCase().includes(needle)
      );
    });
  }, [students, room, group, program, q, qrReadyOnly]);

  const selectedStudents = useMemo(
    () => students.filter((s) => selected.has(s.id)),
    [students, selected],
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const readyPct = students.length
    ? Math.round((selected.size / students.length) * 100)
    : 0;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const s of filtered) next.delete(s.id);
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of filtered) next.add(s.id);
      return next;
    });
  };

  const resetFilters = () => {
    setRoom('all');
    setGroup('all');
    setProgram('all');
    setQrReadyOnly(false);
    setQ('');
  };

  const submit = () => {
    const picked = students.filter((s) => selected.has(s.id));
    if (!picked.length) return;
    onSubmit(picked);
  };

  const hasFilters =
    room !== 'all' || group !== 'all' || program !== 'all' || qrReadyOnly || q.trim();

  return (
    <motion.div
      className="ssp-workspace"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.38, ease }}
    >
      <div className="ssp-blobs" aria-hidden="true">
        <span className="ssp-blob ssp-blob-a" />
        <span className="ssp-blob ssp-blob-b" />
        <span className="ssp-blob ssp-blob-c" />
      </div>

      <header className="ssp-hero">
        <div className="ssp-hero-copy">
          <span className="ssp-kicker">
            <Sparkles size={13} /> Student actions
          </span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <div className="ssp-hero-line" aria-hidden="true" />
          <div className="ssp-hero-meta">
            <span>
              <strong>{students.length}</strong> total
            </span>
            <span>
              <strong>{selected.size}</strong> selected
            </span>
            <span>
              <strong>{readyPct}%</strong> ready
            </span>
          </div>
        </div>

        <motion.div
          className="ssp-orbit"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.4, ease }}
          aria-label={`${students.length} students on roll`}
        >
          <div className="ssp-orbit-ring" aria-hidden="true" />
          <QrCode size={28} className="ssp-orbit-icon" aria-hidden="true" />
          <strong>{students.length}</strong>
          <em>Students</em>
          <div className="ssp-orbit-bar" aria-hidden="true">
            <motion.i
              initial={false}
              animate={{ width: `${Math.max(readyPct, 6)}%` }}
              transition={{ duration: 0.4, ease }}
            />
          </div>
        </motion.div>
      </header>

      <section className="ssp-stats" aria-label="Workspace statistics">
        <StatCard label="Students" value={students.length} icon={Users} tone="purple" />
        <StatCard label="Showing" value={filtered.length} icon={Search} tone="blue" />
        <StatCard label="Programs" value={programCount} icon={BookOpen} tone="soft" />
        <StatCard label="Classrooms" value={classroomCount} icon={GraduationCap} tone="amber" />
        <StatCard label="QR Ready" value={qrReadyCount} icon={QrCode} tone="green" />
      </section>

      <section className="ssp-toolbar" aria-label="Filters">
        <label className="ssp-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or admission #"
            aria-label="Search students"
          />
        </label>

        <div className="ssp-filter">
          <MapPin size={14} aria-hidden="true" />
          <AppSelect
            value={room}
            onChange={setRoom}
            options={[
              { value: 'all', label: 'All Classroom' },
              ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
        </div>

        <div className="ssp-filter">
          <Layers size={14} aria-hidden="true" />
          <AppSelect
            value={group}
            onChange={setGroup}
            options={[
              { value: 'all', label: 'All Group' },
              ...GROUP_OPTIONS.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        </div>

        <div className="ssp-filter">
          <BookOpen size={14} aria-hidden="true" />
          <AppSelect
            value={program}
            onChange={setProgram}
            options={[
              { value: 'all', label: 'All Programs' },
              ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>

        <button
          type="button"
          className={`ssp-chip${qrReadyOnly ? ' is-on' : ''}`}
          onClick={() => setQrReadyOnly((v) => !v)}
          aria-pressed={qrReadyOnly}
        >
          <Sparkles size={14} />
          QR Ready
        </button>

        <button
          type="button"
          className="ssp-reset"
          onClick={resetFilters}
          disabled={!hasFilters}
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <div className="ssp-view" role="group" aria-label="View mode">
          <button
            type="button"
            className={view === 'grid' ? 'is-on' : ''}
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            className={view === 'list' ? 'is-on' : ''}
            onClick={() => setView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <List size={15} />
          </button>
        </div>
      </section>

      <div className="ssp-list-head">
        <div>
          <strong>{filtered.length}</strong>
          <span> matches</span>
        </div>
        <button type="button" className="ssp-select-all" onClick={toggleAll}>
          {allFilteredSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div
        className={`ssp-board ssp-board-${view}`}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Students"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {filtering
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="ssp-skeleton" aria-hidden="true" />
              ))
            : filtered.map((s, i) => {
                const on = selected.has(s.id);
                const classroom = s.roomIds[0] ? roomName(s.roomIds[0]) : '—';
                const prog = programNames(s.programIds);
                const grp = groupNames(s.groupIds);
                const ready = isQrReady(s);

                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    className={`ssp-card${on ? ' is-on' : ''}${view === 'list' ? ' is-list' : ''}`}
                    onClick={() => toggle(s.id)}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(i * 0.02, 0.18), duration: 0.28, ease }}
                    whileHover={{ y: -5, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    layout
                  >
                    <span className="ssp-card-glow" aria-hidden="true" />
                    <span className={`ssp-avatar ${avatarTone(s.name)}`}>
                      {s.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.photoUrl} alt="" />
                      ) : (
                        initials(s.name)
                      )}
                      <AnimatePresence>
                        {on ? (
                          <motion.span
                            className="ssp-avatar-pulse"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            aria-hidden="true"
                          />
                        ) : null}
                      </AnimatePresence>
                    </span>

                    <span className="ssp-card-body">
                      <strong>{s.name}</strong>
                      <em>{s.admissionNumber || 'No admission #'}</em>
                      <span className="ssp-card-meta">
                        <span>
                          <MapPin size={12} /> {classroom}
                        </span>
                        <span>
                          <BookOpen size={12} /> {prog}
                        </span>
                        {view === 'list' ? (
                          <span>
                            <Layers size={12} /> {grp}
                          </span>
                        ) : null}
                      </span>
                      <span className={`ssp-badge${ready ? ' is-ready' : ''}`}>
                        <span className="ssp-badge-dot" aria-hidden="true" />
                        {ready ? 'QR Ready' : 'Needs setup'}
                      </span>
                    </span>

                    <span className={`ssp-check${on ? ' is-on' : ''}`} aria-hidden="true">
                      <AnimatePresence>
                        {on ? (
                          <motion.span
                            key="ck"
                            initial={{ scale: 0, rotate: -50 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                          >
                            <Check size={14} strokeWidth={2.8} />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                );
              })}
        </AnimatePresence>

        {!filtering && !filtered.length ? (
          <div className="ssp-empty">
            <Users size={28} strokeWidth={1.5} />
            <strong>No matches</strong>
            <span>Try adjusting filters or reset to see all students.</span>
          </div>
        ) : null}
      </div>

      <motion.footer
        className="ssp-dock"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35, ease }}
      >
        <div className="ssp-dock-left">
          <div className="ssp-dock-count">
            <em>
              <motion.span
                key={selected.size}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {selected.size}
              </motion.span>
            </em>
            <span>Selected · {selected.size} QR{selected.size === 1 ? '' : 's'}</span>
          </div>
          <div className="ssp-dock-avatars" aria-label="Selected students preview">
            {selectedStudents.slice(0, 8).map((s) => (
              <span key={s.id} className={`ssp-dock-av ${avatarTone(s.name)}`} title={s.name}>
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt="" />
                ) : (
                  initials(s.name)
                )}
              </span>
            ))}
            {selectedStudents.length > 8 ? (
              <span className="ssp-dock-more">+{selectedStudents.length - 8}</span>
            ) : null}
            {!selectedStudents.length ? (
              <span className="ssp-dock-hint">Pick students to continue</span>
            ) : null}
          </div>
        </div>

        <div className="ssp-dock-actions">
          {onCancel ? (
            <button type="button" className="ui-btn ui-btn-outline" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <motion.button
            type="button"
            className="ssp-continue"
            disabled={!selected.size}
            onClick={submit}
            whileHover={selected.size ? { y: -2 } : undefined}
            whileTap={selected.size ? { scale: 0.98 } : undefined}
          >
            <span>{submitLabel}</span>
            <ArrowRight size={16} />
            {selected.size ? (
              <motion.span
                className="ssp-continue-count"
                key={selected.size}
                initial={{ scale: 0.75 }}
                animate={{ scale: 1 }}
              >
                {selected.size}
              </motion.span>
            ) : null}
          </motion.button>
        </div>
      </motion.footer>
    </motion.div>
  );
}
