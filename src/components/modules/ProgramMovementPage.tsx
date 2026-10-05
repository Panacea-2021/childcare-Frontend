'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/Modal';
import { ProgramReveal } from '@/components/modules/ProgramReveal';
import { ProgramPageHeader } from '@/components/modules/ProgramPageHeader';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import { students as seedStudents } from '@/lib/moduleData';
import {
  getProgramAssignments,
  listAllAssignedStudents,
  setProgramStudents,
  subscribeProgramAssignments,
} from '@/lib/programAssignmentsStore';
import { getPrograms, subscribePrograms } from '@/lib/programsStore';
import { ArrowLeftRight, MoreVertical } from 'lucide-react';
import '@/components/ui/module.css';
import styles from './ProgramMovementPage.module.css';

type TabId = 'scheduled' | 'program';
type RuleType = 'Manual' | 'Automatic';
type ActionKind = 'move' | 'leave';

type ScheduledMovement = {
  id: string;
  student: string;
  age: string;
  currentProgram: string;
  nextProgram: string;
  movementDate: string;
  ruleType: RuleType;
  confirmed: boolean;
};

type ProgramLevelRule = {
  id: string;
  programName: string;
  movementRule: string;
  nextProgram: string;
  movementDate: string;
  action: ActionKind;
  ageYears?: string;
  ageMonths?: string;
};

type ActionMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  danger?: boolean;
};

/** Portaled row menu — avoids clipping inside the scrollable table. */
function RowActionMenu({ items, ariaLabel }: { items: ActionMenuItem[]; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const width = 220;
      const estimatedHeight = items.length * 42 + 16;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const openUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
      const top = openUp ? rect.top - estimatedHeight - 4 : rect.bottom + 4;
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setPos({ top, left });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const menu =
    open && mounted && pos ? (
      <div
        ref={menuRef}
        className={styles.actionMenuPortal}
        style={{ top: pos.top, left: pos.left }}
        role="menu"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            className={`${styles.actionItem}${item.danger ? ` ${styles.actionDanger}` : ''}`}
            onClick={() => {
              item.onSelect();
              setOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className={styles.menuWrap}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.kebab}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const RULE_OPTIONS = ['When reaching certain age', 'Date based', 'Manual override'];
const AGE_BASED_RULE = 'When reaching certain age';
const MOVEMENT_STORAGE_KEY = 'panacea.program.movement.v1';

function parseAgeFromMovementDate(raw: string): { years: string; months: string } {
  const m = raw.match(/(\d+)\s*Years?\s+(\d+)\s*Months?/i);
  if (!m) return { years: '1', months: '0' };
  return { years: m[1], months: m[2] };
}

function normalizeRuleKey(rule: string) {
  const lower = rule.toLowerCase();
  if (lower.includes('age')) return AGE_BASED_RULE;
  if (lower.includes('date')) return 'Date based';
  if (lower.includes('manual')) return 'Manual override';
  return rule;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Normalize stored dates into `YYYY-MM-DD` for `<input type="date">` (avoids timezone shifts). */
function toDateInputValue(raw?: string): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const dd = slash[1].padStart(2, '0');
    const mm = slash[2].padStart(2, '0');
    return `${slash[3]}-${mm}-${dd}`;
  }
  const named = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (named) {
    const months: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };
    const mm = months[named[2]];
    if (mm) return `${named[3]}-${mm}-${named[1].padStart(2, '0')}`;
  }
  return '';
}

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function loadMovementState(): { scheduled: ScheduledMovement[]; programRules: ProgramLevelRule[] } {
  if (typeof window === 'undefined') return { scheduled: [], programRules: [] };
  try {
    const raw = window.localStorage.getItem(MOVEMENT_STORAGE_KEY);
    if (!raw) return { scheduled: [], programRules: [] };
    const parsed = JSON.parse(raw) as {
      scheduled?: ScheduledMovement[];
      programRules?: ProgramLevelRule[];
    };
    return {
      scheduled: Array.isArray(parsed.scheduled) ? parsed.scheduled : [],
      programRules: Array.isArray(parsed.programRules) ? parsed.programRules : [],
    };
  } catch {
    return { scheduled: [], programRules: [] };
  }
}

function saveMovementState(scheduled: ScheduledMovement[], programRules: ProgramLevelRule[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MOVEMENT_STORAGE_KEY, JSON.stringify({ scheduled, programRules }));
  } catch {
    /* ignore */
  }
}

function resolveStudentAge(studentName: string): string {
  const assigned = listAllAssignedStudents().find((s) => s.name === studentName);
  if (assigned?.age) return assigned.age;
  const seed = seedStudents.find((s) => s.name === studentName);
  return seed?.age ?? '';
}

export function ProgramMovementPage() {
  const [tab, setTab] = useState<TabId>('scheduled');
  const [search, setSearch] = useState('');
  const [currentProgram, setCurrentProgram] = useState('All');
  const [ruleType, setRuleType] = useState('All');
  const [timeRange, setTimeRange] = useState('Life time');
  const [nextProgramFilter, setNextProgramFilter] = useState('All');

  const [programNames, setProgramNames] = useState<string[]>(() => getPrograms().map((p) => p.name));
  const [studentNames, setStudentNames] = useState<string[]>(() => {
    const assigned = listAllAssignedStudents().map((s) => s.name);
    const seed = seedStudents.map((s) => s.name);
    return [...new Set([...assigned, ...seed])];
  });

  const [scheduled, setScheduled] = useState<ScheduledMovement[]>([]);
  const [programRules, setProgramRules] = useState<ProgramLevelRule[]>([]);
  const [movementReady, setMovementReady] = useState(false);
  const [toast, setToast] = useState('');

  const [studentModal, setStudentModal] = useState(false);
  const [programModal, setProgramModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ScheduledMovement | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [programEditId, setProgramEditId] = useState<string | null>(null);

  const [studentForm, setStudentForm] = useState({
    student: '',
    currentProgram: '',
    action: 'move' as ActionKind,
    nextProgram: '',
    date: '',
  });

  const [programForm, setProgramForm] = useState({
    currentProgram: '',
    action: 'move' as ActionKind,
    nextProgram: '',
    movementRule: '',
    ageYears: '1',
    ageMonths: '0',
  });

  const [confirmForm, setConfirmForm] = useState({
    startDate: '',
    endDate: '',
    endCurrent: true,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    updateClassroom: true,
  });

  useEffect(() => {
    const loaded = loadMovementState();
    setScheduled(loaded.scheduled);
    setProgramRules(loaded.programRules);
    setMovementReady(true);
  }, []);

  useEffect(() => {
    const refreshPeople = () => {
      setProgramNames(getPrograms().map((p) => p.name));
      const assigned = listAllAssignedStudents().map((s) => s.name);
      const seed = seedStudents.map((s) => s.name);
      setStudentNames([...new Set([...assigned, ...seed])]);
    };
    refreshPeople();
    const unsubP = subscribePrograms(refreshPeople);
    const unsubA = subscribeProgramAssignments(refreshPeople);
    return () => {
      unsubP();
      unsubA();
    };
  }, []);

  useEffect(() => {
    if (!movementReady) return;
    saveMovementState(scheduled, programRules);
  }, [scheduled, programRules, movementReady]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const PROGRAMS = programNames;
  const STUDENTS = studentNames;

  const filteredScheduled = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scheduled.filter((row) => {
      if (q && !row.student.toLowerCase().includes(q)) return false;
      if (currentProgram !== 'All' && row.currentProgram !== currentProgram) return false;
      if (ruleType !== 'All' && row.ruleType !== ruleType) return false;
      return true;
    });
  }, [scheduled, search, currentProgram, ruleType]);

  const filteredProgramRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programRules.filter((row) => {
      if (q && !`${row.programName} ${row.nextProgram}`.toLowerCase().includes(q)) return false;
      if (nextProgramFilter !== 'All' && row.nextProgram !== nextProgramFilter) return false;
      return true;
    });
  }, [programRules, search, nextProgramFilter]);

  const openConfigure = () => {
    if (tab === 'scheduled') {
      setEditId(null);
      setStudentForm({
        student: STUDENTS[0] ?? '',
        currentProgram: PROGRAMS[0] ?? '',
        action: 'move',
        nextProgram: '',
        date: '',
      });
      setStudentModal(true);
    } else {
      setProgramEditId(null);
      setProgramForm({
        currentProgram: PROGRAMS[0] ?? '',
        action: 'move',
        nextProgram: '',
        movementRule: '',
        ageYears: '1',
        ageMonths: '0',
      });
      setProgramModal(true);
    }
  };

  const submitStudentRule = () => {
    const movementDate = toDateInputValue(studentForm.date);
    if (!studentForm.student || !studentForm.currentProgram || !movementDate) return;
    if (studentForm.action === 'move' && !studentForm.nextProgram) return;

    const nextProgram = studentForm.action === 'leave' ? '—' : studentForm.nextProgram;
    const payload: ScheduledMovement = {
      id: editId ?? `s-${Date.now()}`,
      student: studentForm.student,
      age: resolveStudentAge(studentForm.student),
      currentProgram: studentForm.currentProgram,
      nextProgram,
      movementDate,
      ruleType: 'Manual',
      confirmed: false,
    };

    setScheduled((items) => {
      if (editId) return items.map((r) => (r.id === editId ? payload : r));
      return [payload, ...items];
    });
    setStudentModal(false);
    setEditId(null);
    setToast(editId ? 'Manual rule updated' : 'Student movement rule added');
  };

  const submitProgramRule = () => {
    if (!programForm.currentProgram) return;
    if (!programForm.movementRule) return;
    if (programForm.action === 'move' && !programForm.nextProgram) return;

    const isAgeRule = programForm.movementRule === AGE_BASED_RULE;
    if (isAgeRule && (programForm.ageYears.trim() === '' || programForm.ageMonths.trim() === '')) {
      return;
    }

    const payload: ProgramLevelRule = {
      id: programEditId ?? `p-${Date.now()}`,
      programName: programForm.currentProgram,
      movementRule: programForm.movementRule,
      nextProgram: programForm.action === 'leave' ? '—' : programForm.nextProgram,
      movementDate: isAgeRule
        ? `${Number(programForm.ageYears) || 0} Years ${Number(programForm.ageMonths) || 0} Months`
        : programForm.action === 'leave'
          ? '—'
          : '—',
      action: programForm.action,
      ageYears: isAgeRule ? programForm.ageYears : undefined,
      ageMonths: isAgeRule ? programForm.ageMonths : undefined,
    };

    setProgramRules((items) => {
      if (programEditId) return items.map((r) => (r.id === programEditId ? payload : r));
      return [payload, ...items];
    });
    setProgramModal(false);
    setProgramEditId(null);
    setToast(programEditId ? 'Program level rule updated' : 'Program level movement configured');
  };

  const editProgramRule = (row: ProgramLevelRule) => {
    const age =
      row.ageYears != null && row.ageMonths != null
        ? { years: row.ageYears, months: row.ageMonths }
        : parseAgeFromMovementDate(row.movementDate);
    const action: ActionKind =
      row.action ?? (row.nextProgram === '—' || !row.nextProgram ? 'leave' : 'move');

    setProgramEditId(row.id);
    setProgramForm({
      currentProgram: row.programName,
      action,
      nextProgram: action === 'leave' || row.nextProgram === '—' ? '' : row.nextProgram,
      movementRule: normalizeRuleKey(row.movementRule),
      ageYears: age.years,
      ageMonths: age.months,
    });
    setProgramModal(true);
  };

  const deleteProgramRule = (id: string) => {
    setProgramRules((items) => items.filter((r) => r.id !== id));
    setToast('Program level rule deleted');
  };

  const openConfirm = (row: ScheduledMovement) => {
    setConfirmForm({
      startDate: toDateInputValue(row.movementDate),
      endDate: '',
      endCurrent: true,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      updateClassroom: true,
    });
    setConfirmModal(row);
  };

  const applyConfirmedMovement = (row: ScheduledMovement, startIso: string, endIso: string) => {
    const catalog = getPrograms();
    const fromProg = catalog.find((p) => p.name === row.currentProgram);
    if (!fromProg) return;

    const fromAssign = getProgramAssignments(fromProg.id, fromProg.name);
    const student =
      fromAssign.students.find((s) => s.name === row.student) ??
      (() => {
        const seed = seedStudents.find((s) => s.name === row.student);
        if (!seed) return null;
        return {
          id: seed.id,
          name: seed.name,
          age: seed.age,
          studentStatus: 'Active' as const,
          status: 'Active' as const,
          startDate: isoToDisplay(startIso),
          endDate: endIso ? isoToDisplay(endIso) : '',
          days: fromProg.days.slice(),
        };
      })();
    if (!student) return;

    const dayShort = confirmForm.days.map((d) => d.slice(0, 3));
    const moved = {
      ...student,
      startDate: isoToDisplay(startIso),
      endDate: endIso ? isoToDisplay(endIso) : student.endDate,
      days: dayShort.length ? dayShort : student.days,
      status: 'Active' as const,
      studentStatus: 'Active' as const,
    };

    if (confirmForm.endCurrent || row.nextProgram === '—') {
      setProgramStudents(
        fromProg.id,
        fromProg.name,
        fromAssign.students.filter((s) => s.name !== row.student),
      );
    }

    if (row.nextProgram && row.nextProgram !== '—') {
      const toProg = catalog.find((p) => p.name === row.nextProgram);
      if (toProg) {
        const toAssign = getProgramAssignments(toProg.id, toProg.name);
        const withoutDup = toAssign.students.filter((s) => s.id !== moved.id && s.name !== moved.name);
        setProgramStudents(toProg.id, toProg.name, [...withoutDup, moved]);
      }
    }
  };

  const submitConfirm = () => {
    if (!confirmModal || !confirmForm.startDate) return;
    applyConfirmedMovement(confirmModal, confirmForm.startDate, confirmForm.endDate);
    setScheduled((items) =>
      items.map((r) =>
        r.id === confirmModal.id
          ? { ...r, confirmed: true, movementDate: confirmForm.startDate }
          : r,
      ),
    );
    setConfirmModal(null);
    setToast('Room movement confirmed');
  };

  const switchRuleType = (row: ScheduledMovement) => {
    setScheduled((items) =>
      items.map((r) =>
        r.id === row.id
          ? { ...r, ruleType: r.ruleType === 'Manual' ? 'Automatic' : 'Manual' }
          : r,
      ),
    );
    setToast(row.ruleType === 'Manual' ? 'Changed to automatic' : 'Changed to manual');
  };

  const editManual = (row: ScheduledMovement) => {
    setEditId(row.id);
    setStudentForm({
      student: row.student,
      currentProgram: row.currentProgram,
      action: row.nextProgram === '—' ? 'leave' : 'move',
      nextProgram: row.nextProgram === '—' ? '' : row.nextProgram,
      date: toDateInputValue(row.movementDate),
    });
    setStudentModal(true);
  };

  const deleteManual = (id: string) => {
    setScheduled((items) => items.filter((r) => r.id !== id));
    setToast('Manual rule deleted');
  };

  return (
    <div className={`mod-page ${styles.page}`}>
      <div className={styles.ambient} aria-hidden />
      {toast ? (
        <div className={styles.toast} role="status">
          <span aria-hidden>✓</span>
          {toast}
        </div>
      ) : null}

      <ProgramPageHeader
        title="Program Movement"
        description="Configure student and program level movement rules."
        icon={<ArrowLeftRight />}
        actions={
          <>
            <button
              type="button"
              className={styles.infoBtn}
              title="Configure student and program level movement rules"
              aria-label="About Program Movement"
            >
              i
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openConfigure}>
              {tab === 'scheduled' ? '+ Configure student movement' : '+ Configure Program level movement'}
            </button>
          </>
        }
      />

      <ProgramReveal delayMs={100} className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="Program movement tabs">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'scheduled'}
            className={`${styles.tab} ${tab === 'scheduled' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('scheduled');
              setSearch('');
            }}
          >
            All scheduled movements
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'program'}
            className={`${styles.tab} ${tab === 'program' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('program');
              setSearch('');
            }}
          >
            Program level movements
          </button>
        </div>

        {tab === 'scheduled' ? (
          <>
            <div className={styles.filters}>
              <div className={`${styles.field} ${styles.searchWrap}`}>
                <label htmlFor="pm-search">Search</label>
                <input
                  id="pm-search"
                  className="ui-filter"
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className={styles.searchIcon} aria-hidden>
                  ⌕
                </span>
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-current">Current program</label>
                <SearchableSelect
                  id="pm-current"
                  value={currentProgram}
                  onChange={setCurrentProgram}
                  options={['All', ...PROGRAMS]}
                  placeholder="All"
                  searchable
                  searchPlaceholder="Search program…"
                  ariaLabel="Current program"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-rule">Rule type</label>
                <SearchableSelect
                  id="pm-rule"
                  value={ruleType}
                  onChange={setRuleType}
                  options={['All', 'Manual', 'Automatic']}
                  placeholder="All"
                  searchable={false}
                  ariaLabel="Rule type"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-range">Time range</label>
                <SearchableSelect
                  id="pm-range"
                  value={timeRange}
                  onChange={setTimeRange}
                  options={['Life time', 'This month', 'This year']}
                  placeholder="Life time"
                  searchable={false}
                  ariaLabel="Time range"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name ↕</th>
                    <th>Current Program</th>
                    <th>Next Program</th>
                    <th>Movement Date</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredScheduled.length === 0 ? (
                    <tr>
                      <td className={styles.empty} colSpan={5}>
                        No Data
                      </td>
                    </tr>
                  ) : (
                    filteredScheduled.map((row, index) => (
                      <tr key={row.id} style={{ '--stagger': `${index * 45}ms` } as CSSProperties}>
                        <td>
                          <div className={styles.nameCell}>
                            <span className={styles.avatar} aria-hidden>
                              {initials(row.student)}
                            </span>
                            <div className={styles.nameCopy}>
                              <strong>{row.student}</strong>
                              <span className={styles.age}>{row.age}</span>
                              <span
                                className={`${styles.badge} ${
                                  row.ruleType === 'Manual' ? styles.badgeManual : styles.badgeAuto
                                }`}
                              >
                                {row.ruleType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{row.currentProgram}</td>
                        <td>{row.nextProgram}</td>
                        <td>{isoToDisplay(row.movementDate)}</td>
                        <td>
                          <div className={styles.rowActions}>
                            {!row.confirmed ? (
                              <button type="button" className={styles.confirmBtn} onClick={() => openConfirm(row)}>
                                Confirm
                              </button>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeManual}`}>Confirmed</span>
                            )}
                            <RowActionMenu
                              ariaLabel={`Actions for ${row.student}`}
                              items={[
                                {
                                  id: 'switch',
                                  label: `⇄ Change to ${row.ruleType === 'Manual' ? 'automatic' : 'manual'}`,
                                  onSelect: () => switchRuleType(row),
                                },
                                {
                                  id: 'edit',
                                  label: '✎ Edit manual rule',
                                  onSelect: () => editManual(row),
                                },
                                {
                                  id: 'delete',
                                  label: '🗑 Delete manual rule',
                                  onSelect: () => deleteManual(row.id),
                                  danger: true,
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.filters} ${styles.filtersTwo}`}>
              <div className={`${styles.field} ${styles.searchWrap}`}>
                <label htmlFor="pm-search-2">Search</label>
                <input
                  id="pm-search-2"
                  className="ui-filter"
                  placeholder="Search by current program"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className={styles.searchIcon} aria-hidden>
                  ⌕
                </span>
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-next-filter">Next program</label>
                <SearchableSelect
                  id="pm-next-filter"
                  value={nextProgramFilter}
                  onChange={setNextProgramFilter}
                  options={['All', ...PROGRAMS]}
                  placeholder="All"
                  searchable
                  searchPlaceholder="Search program…"
                  ariaLabel="Next program"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Movement Rule</th>
                    <th>Next Program</th>
                    <th>Movement Date</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProgramRules.length === 0 ? (
                    <tr>
                      <td className={styles.empty} colSpan={5}>
                        No Data
                      </td>
                    </tr>
                  ) : (
                    filteredProgramRules.map((row, index) => (
                      <tr key={row.id} style={{ '--stagger': `${index * 45}ms` } as CSSProperties}>
                        <td>
                          <strong>{row.programName}</strong>
                        </td>
                        <td>{row.movementRule}</td>
                        <td>{row.nextProgram}</td>
                        <td>{isoToDisplay(row.movementDate)}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <RowActionMenu
                              ariaLabel={`Actions for ${row.programName}`}
                              items={[
                                {
                                  id: 'edit',
                                  label: '✎ Edit',
                                  onSelect: () => editProgramRule(row),
                                },
                                {
                                  id: 'delete',
                                  label: '🗑 Delete',
                                  onSelect: () => deleteProgramRule(row.id),
                                  danger: true,
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className={styles.pager}>
          <button type="button" className={styles.pageBtn} disabled aria-label="Previous page">
            ‹
          </button>
          <button type="button" className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
            1
          </button>
          <button type="button" className={styles.pageBtn} disabled aria-label="Next page">
            ›
          </button>
        </div>
      </ProgramReveal>

      <Modal
        open={studentModal}
        title={editId ? 'Edit manual rule' : 'Add new rule'}
        onClose={() => {
          setStudentModal(false);
          setEditId(null);
        }}
        footer={
          <div className={styles.modalActions}>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setStudentModal(false);
                setEditId(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className={`ui-btn ui-btn-primary ${styles.submitAccent}`} onClick={submitStudentRule}>
              Submit
            </button>
          </div>
        }
      >
        <div className={styles.formStack}>
          <div className={styles.field}>
            <label htmlFor="sf-student">
              <span className={styles.req}>*</span>Select Student
            </label>
            <SearchableSelect
              id="sf-student"
              value={studentForm.student}
              onChange={(student) => setStudentForm((f) => ({ ...f, student }))}
              options={STUDENTS}
              placeholder="Select student"
              searchable
              searchPlaceholder="Search student…"
              ariaLabel="Select student"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sf-current">
              <span className={styles.req}>*</span>When Leaving Current Program
            </label>
            <SearchableSelect
              id="sf-current"
              value={studentForm.currentProgram}
              onChange={(currentProgram) => setStudentForm((f) => ({ ...f, currentProgram }))}
              options={PROGRAMS}
              placeholder="Select program"
              searchable
              searchPlaceholder="Search program…"
              ariaLabel="Current program"
            />
          </div>
          <div className={styles.field}>
            <label>A student will :</label>
            <div className={styles.radioRow}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="student-action"
                  checked={studentForm.action === 'move'}
                  onChange={() => setStudentForm((f) => ({ ...f, action: 'move' }))}
                />
                Move to next program
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="student-action"
                  checked={studentForm.action === 'leave'}
                  onChange={() => setStudentForm((f) => ({ ...f, action: 'leave', nextProgram: '' }))}
                />
                Leave the program
              </label>
            </div>
          </div>
          {studentForm.action === 'move' ? (
            <div className={styles.field}>
              <label htmlFor="sf-next">Next Program</label>
              <SearchableSelect
                id="sf-next"
                value={studentForm.nextProgram}
                onChange={(nextProgram) => setStudentForm((f) => ({ ...f, nextProgram }))}
                options={PROGRAMS.filter((p) => p !== studentForm.currentProgram)}
                placeholder="Select next program"
                searchable
                searchPlaceholder="Search program…"
                ariaLabel="Next program"
              />
            </div>
          ) : null}
          <div className={styles.field}>
            <label>
              <span className={styles.req}>*</span>Date
            </label>
            <FieldDatePicker
              value={studentForm.date}
              onChange={(date) => setStudentForm((f) => ({ ...f, date }))}
              ariaLabel="Movement date"
              placeholder="Select date"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={programModal}
        title={programEditId ? 'Edit rule' : 'Add new rule'}
        onClose={() => {
          setProgramModal(false);
          setProgramEditId(null);
        }}
        footer={
          <div className={styles.modalActions}>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setProgramModal(false);
                setProgramEditId(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className={`ui-btn ui-btn-primary ${styles.submitAccent}`} onClick={submitProgramRule}>
              Submit
            </button>
          </div>
        }
      >
        <div className={styles.formStack}>
          <div className={styles.field}>
            <label htmlFor="pf-current">
              <span className={styles.req}>*</span>When Leaving Current Program
            </label>
            <SearchableSelect
              id="pf-current"
              value={programForm.currentProgram}
              onChange={(currentProgram) => setProgramForm((f) => ({ ...f, currentProgram }))}
              options={PROGRAMS}
              placeholder="Select program"
              searchable
              searchPlaceholder="Search program…"
              ariaLabel="Current program"
            />
          </div>
          <div className={styles.field}>
            <label>A student will :</label>
            <div className={styles.radioRow}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="program-action"
                  checked={programForm.action === 'move'}
                  onChange={() => setProgramForm((f) => ({ ...f, action: 'move', movementRule: '' }))}
                />
                Move to next program
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="program-action"
                  checked={programForm.action === 'leave'}
                  onChange={() =>
                    setProgramForm((f) => ({
                      ...f,
                      action: 'leave',
                      nextProgram: '',
                      movementRule: '',
                    }))
                  }
                />
                Leave the program
              </label>
            </div>
          </div>

          {programForm.action === 'move' ? (
            <div className={styles.field}>
              <label htmlFor="pf-next">Next Program</label>
              <SearchableSelect
                id="pf-next"
                value={programForm.nextProgram}
                onChange={(nextProgram) => setProgramForm((f) => ({ ...f, nextProgram }))}
                options={PROGRAMS.filter((p) => p !== programForm.currentProgram)}
                placeholder="Select next program"
                searchable
                searchPlaceholder="Search program…"
                ariaLabel="Next program"
              />
            </div>
          ) : null}

          <div className={styles.field}>
            <label htmlFor="pf-rule">
              <span className={styles.req}>*</span>Movement rule
            </label>
            <SearchableSelect
              id="pf-rule"
              value={programForm.movementRule}
              onChange={(movementRule) => setProgramForm((f) => ({ ...f, movementRule }))}
              options={RULE_OPTIONS}
              placeholder="Select movement rule"
              searchable={false}
              ariaLabel="Movement rule"
            />
          </div>

          {programForm.movementRule === AGE_BASED_RULE ? (
            <div className={styles.field}>
              <label>Select Age</label>
              <div className={styles.ageRow}>
                <div className={styles.ageField}>
                  <div className={styles.ageInputWrap}>
                    <input
                      className={`ui-filter ${styles.ageInput}`}
                      inputMode="numeric"
                      value={programForm.ageYears}
                      onChange={(e) =>
                        setProgramForm((f) => ({
                          ...f,
                          ageYears: e.target.value.replace(/[^\d]/g, ''),
                        }))
                      }
                      aria-label="Years"
                    />
                    <span className={styles.ageUnitIn}>Years</span>
                  </div>
                </div>
                <div className={styles.ageField}>
                  <div className={styles.ageInputWrap}>
                    <input
                      className={`ui-filter ${styles.ageInput}`}
                      inputMode="numeric"
                      value={programForm.ageMonths}
                      onChange={(e) =>
                        setProgramForm((f) => ({
                          ...f,
                          ageMonths: e.target.value.replace(/[^\d]/g, ''),
                        }))
                      }
                      aria-label="Months"
                    />
                    <span className={styles.ageUnitIn}>Months</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmModal)}
        title="Confirm room movement"
        wide
        onClose={() => setConfirmModal(null)}
        footer={
          <div className={styles.modalActions}>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setConfirmModal(null)}>
              Cancel
            </button>
            <button type="button" className={`ui-btn ui-btn-primary ${styles.submitAccent}`} onClick={submitConfirm}>
              Submit
            </button>
          </div>
        }
      >
        {confirmModal ? (
          <div className={styles.formStack}>
            <div>
              <p className={styles.confirmName}>
                {confirmModal.student}, {confirmModal.age}
              </p>
              <div className={styles.confirmMeta}>
                <span>Planned movement : {confirmModal.nextProgram}</span>
                <span>From &apos;{confirmModal.currentProgram}&apos;</span>
              </div>
            </div>

            <p className={styles.sectionTitle}>Configure Assignment Period</p>
            <div className={styles.dateGrid}>
              <div className={styles.field}>
                <label>
                  <span className={styles.req}>*</span>Start Date
                </label>
                <FieldDatePicker
                  value={confirmForm.startDate}
                  onChange={(startDate) => setConfirmForm((f) => ({ ...f, startDate }))}
                  ariaLabel="Start date"
                  placeholder="Select date"
                  displayFormat="dd/mm/yy"
                />
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <FieldDatePicker
                  value={confirmForm.endDate}
                  onChange={(endDate) => setConfirmForm((f) => ({ ...f, endDate }))}
                  ariaLabel="End date"
                  placeholder="Select date"
                  displayFormat="dd/mm/yy"
                />
              </div>
            </div>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={confirmForm.endCurrent}
                onChange={(e) => setConfirmForm((f) => ({ ...f, endCurrent: e.target.checked }))}
              />
              End current program
              <span className={styles.infoBtn} title="Ends the student’s current program assignment" aria-hidden>
                i
              </span>
            </label>

            <div className={styles.field}>
              <label>
                <span className={styles.req}>*</span>Day Of Week
              </label>
              <div className={styles.dayTags}>
                {confirmForm.days.map((day) => (
                  <span className={styles.dayTag} key={day}>
                    {day}
                    <button
                      type="button"
                      aria-label={`Remove ${day}`}
                      onClick={() =>
                        setConfirmForm((f) => ({ ...f, days: f.days.filter((d) => d !== day) }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                {WEEK_DAYS.filter((d) => !confirmForm.days.includes(d)).length > 0 ? (
                  <div className={styles.dayAddSelect}>
                    <SearchableSelect
                      value=""
                      onChange={(day) => {
                        if (!day) return;
                        setConfirmForm((f) =>
                          f.days.includes(day) ? f : { ...f, days: [...f.days, day] },
                        );
                      }}
                      options={WEEK_DAYS.filter((d) => !confirmForm.days.includes(d))}
                      placeholder="Add day"
                      searchable={false}
                      ariaLabel="Add day of week"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <p className={styles.sectionTitle}>Other details</p>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={confirmForm.updateClassroom}
                onChange={(e) => setConfirmForm((f) => ({ ...f, updateClassroom: e.target.checked }))}
              />
              Update Student classroom based on program changes
              <span className={styles.infoBtn} title="Syncs classroom with the next program room" aria-hidden>
                i
              </span>
            </label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
