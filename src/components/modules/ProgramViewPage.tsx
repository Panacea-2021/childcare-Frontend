'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgramAssignStudentsView } from '@/components/modules/ProgramAssignStudentsView';
import { ProgramAssignStaffView } from '@/components/modules/ProgramAssignStaffView';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import {
  getProgramAssignments,
  removeProgramAssignments,
  setProgramStaff,
  setProgramStudents,
} from '@/lib/programAssignmentsStore';
import { removeProgram, updateProgram, type ProgramRecord } from '@/lib/programsStore';
import { loadStudents, roomName } from '@/lib/center-management/studentsStore';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import '@/components/ui/module.css';
import '@/components/modules/view-profile/field-picker.css';
import styles from './ProgramViewPage.module.css';

export type ViewProgramRecord = ProgramRecord;

type Props = {
  program: ViewProgramRecord;
  onBack: () => void;
  /** Open assign Students/Staff flow immediately (from Program list row menu). */
  initialAssign?: 'students' | 'staff' | null;
  onDeleted?: () => void;
};

type TabId =
  | 'overview'
  | 'students'
  | 'staff'
  | 'capacity'
  | 'occupancy'
  | 'forecast';

type AssignmentStatus = 'Active' | 'Completed' | 'Upcoming' | 'On hold' | 'Withdrawn' | 'Inactive';
type PersonStatus = 'Active' | 'On hold' | 'Withdrawn' | 'Inactive' | 'Signed up';

type AssignedStudent = {
  id: string;
  studentId?: string;
  name: string;
  age: string;
  studentStatus: PersonStatus;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  days: string[];
};

type AssignedStaff = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  startDate: string;
  endDate: string;
  days: string[];
  rooms?: string;
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Assigned Students' },
  { id: 'staff', label: 'Assigned Staff' },
  { id: 'capacity', label: 'Capacity Planner' },
  { id: 'occupancy', label: 'Occupancy Report' },
  { id: 'forecast', label: 'Attendance Forecast' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  'Active',
  'Completed',
  'Upcoming',
  'On hold',
  'Withdrawn',
  'Inactive',
];
const STATUS_FILTER_OPTIONS = ['All', 'Active', 'Completed', 'Upcoming'] as const;
const STUDENT_STATUS_FILTER_OPTIONS = [
  'All',
  'Active',
  'On hold',
  'Withdrawn',
  'Inactive',
  'Signed up',
] as const;

function SearchFilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.searchFilter} ref={rootRef}>
      <button
        id={id}
        type="button"
        className={`${styles.searchFilterTrigger} ${open ? styles.searchFilterTriggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <Search size={16} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div className={styles.searchFilterMenu} role="listbox" aria-label={label}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              className={`${styles.searchFilterOption} ${value === opt ? styles.searchFilterOptionActive : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Overview capacities / ages from the saved program record. */
function overviewExtras(program: ViewProgramRecord, activeStudents: number) {
  const maxStudents =
    (program.maxStudents ?? 20) + (program.allowExtraStudents ? program.extraStudents ?? 0 : 0);
  const maxStaff =
    (program.maxStaff ?? 20) + (program.allowExtraStaff ? program.extraStaff ?? 0 : 0);
  return {
    minAge: `${program.minAgeYears ?? 0} y - ${program.minAgeMonths ?? 0} m`,
    maxAge: `${program.maxAgeYears ?? 0} y - ${program.maxAgeMonths ?? 0} m`,
    maxStudents,
    maxStaff,
    extraStudents: program.allowExtraStudents ? program.extraStudents ?? 0 : 0,
    extraStaff: program.allowExtraStaff ? program.extraStaff ?? 0 : 0,
    activeStudents,
    upcomingAdmissions: 0,
  };
}

const FORECAST_DATES = [
  { label: 'Sun 26/07/2026', key: 'd0' },
  { label: 'Mon 27/07/2026', key: 'd1' },
  { label: 'Tue 28/07/2026', key: 'd2' },
  { label: 'Wed 29/07/2026', key: 'd3' },
  { label: 'Thu 30/07/2026', key: 'd4' },
  { label: 'Fri 31/07/2026', key: 'd5' },
  { label: 'Sat 01/08/2026', key: 'd6' },
];

const CAPACITY_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
const CAPACITY_DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatCapacityDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function startOfWeekSunday(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addCapacityDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function displayToIso(display: string): string {
  const m = display.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function DayPills({ days }: { days: string[] }) {
  return (
    <div className={styles.dayPills}>
      {days.map((d) => (
        <span key={d} className={styles.dayPill} data-day={d}>
          {d}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className={styles.assignStatus} data-status={status}>
      ● {status.toUpperCase()}
    </span>
  );
}

export function ProgramViewPage({ program, onBack, initialAssign = null, onDeleted }: Props) {
  const [tab, setTab] = useState<TabId>('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentRoomFilter, setStudentRoomFilter] = useState('All');
  const [staffRoomFilter, setStaffRoomFilter] = useState('All');
  const [forecastRoomFilter, setForecastRoomFilter] = useState('All');
  const [studentAssignStatusFilter, setStudentAssignStatusFilter] = useState('All');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>(() =>
    getProgramAssignments(program.id, program.name).students as AssignedStudent[],
  );
  const [assignedStaff, setAssignedStaff] = useState<AssignedStaff[]>(() =>
    getProgramAssignments(program.id, program.name).staff as AssignedStaff[],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AssignedStudent | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaffDraft, setEditStaffDraft] = useState<AssignedStaff | null>(null);
  const [menuKind, setMenuKind] = useState<'student' | 'staff' | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [profileStudent, setProfileStudent] = useState<AssignedStudent | null>(null);
  const [profileStaff, setProfileStaff] = useState<AssignedStaff | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [forecastSearch, setForecastSearch] = useState('');
  const [capacityMode, setCapacityMode] = useState<'Student' | 'Staff'>('Student');
  const [capacityWeekStart, setCapacityWeekStart] = useState(() =>
    startOfWeekSunday(new Date(2026, 7, 2)),
  );
  const [forecastMode, setForecastMode] = useState<'Student' | 'Staff'>('Student');
  const [occSplitBy, setOccSplitBy] = useState('Month');
  const [occStartFrom, setOccStartFrom] = useState('2026-08-05');
  const [occMonthCount, setOccMonthCount] = useState(5);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: '',
    days: [] as string[],
  });
  const [assigningStudents, setAssigningStudents] = useState(initialAssign === 'students');
  const [assigningStaff, setAssigningStaff] = useState(initialAssign === 'staff');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: program.name,
    room: program.room,
    status: program.status,
    maxStudents: String(program.maxStudents ?? 20),
    maxStaff: String(program.maxStaff ?? 20),
  });
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeStudentCount = useMemo(
    () =>
      assignedStudents.filter(
        (s) => s.status === 'Active' || (s.status !== 'Completed' && s.studentStatus === 'Active'),
      ).length,
    [assignedStudents],
  );
  const extras = overviewExtras(program, activeStudentCount);
  const dateLabel = program.endDate ? `${program.startDate} - ${program.endDate}` : program.startDate;
  const roomsLabel = program.rooms?.length ? program.rooms.join(', ') : program.room;
  const { roomNames: activeRoomNames } = useCenterCatalog();
  const programRoomList = useMemo(
    () => [...new Set([program.room, ...(program.rooms ?? [])].filter(Boolean))],
    [program.room, program.rooms],
  );
  const [studentRoomsById, setStudentRoomsById] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    const map = new Map<string, string[]>();
    loadStudents().forEach((s) => {
      const names = s.roomIds.map(roomName).filter((n) => n && n !== '—');
      map.set(s.id, names);
    });
    setStudentRoomsById(map);
  }, []);

  function roomsForAssignedStudent(s: AssignedStudent): string[] {
    const fromCenter = studentRoomsById.get(s.studentId || s.id);
    if (fromCenter?.length) return fromCenter;
    return programRoomList;
  }

  useEffect(() => {
    const data = getProgramAssignments(program.id, program.name);
    setAssignedStudents(data.students as AssignedStudent[]);
    setAssignedStaff(data.staff as AssignedStaff[]);
  }, [program.id, program.name]);

  useEffect(() => {
    if (!menuId || !menuKind) return;
    const close = () => {
      setMenuId(null);
      setMenuKind(null);
      setMenuPos(null);
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      const el = t as HTMLElement;
      if (menuKind === 'student' && el.closest?.(`[data-student-menu="${menuId}"]`)) return;
      if (menuKind === 'staff' && el.closest?.(`[data-staff-menu="${menuId}"]`)) return;
      close();
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuId, menuKind]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return assignedStudents.filter((s) => {
      const matchesName = !q || s.name.toLowerCase().includes(q);
      const matchesRoom =
        studentRoomFilter === 'All' || roomsForAssignedStudent(s).includes(studentRoomFilter);
      const matchesAssign =
        studentAssignStatusFilter === 'All' || s.status === studentAssignStatusFilter;
      const matchesStudent =
        studentStatusFilter === 'All' || s.studentStatus === studentStatusFilter;
      return matchesName && matchesRoom && matchesAssign && matchesStudent;
    });
  }, [
    assignedStudents,
    studentSearch,
    studentRoomFilter,
    studentAssignStatusFilter,
    studentStatusFilter,
    studentRoomsById,
    programRoomList,
  ]);

  const closeMenu = () => {
    setMenuId(null);
    setMenuKind(null);
    setMenuPos(null);
  };

  const startEdit = (student: AssignedStudent) => {
    closeMenu();
    setEditingStaffId(null);
    setEditStaffDraft(null);
    setEditingId(student.id);
    setEditDraft({ ...student, days: [...student.days] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (!editDraft || !editingId) return;
    setAssignedStudents((list) => {
      const next = list.map((s) => (s.id === editingId ? { ...editDraft } : s));
      setProgramStudents(program.id, program.name, next);
      return next;
    });
    setToast('Student assignment updated');
    window.setTimeout(() => setToast(null), 3000);
    cancelEdit();
  };

  const toggleEditDay = (day: string) => {
    if (!editDraft) return;
    setEditDraft({
      ...editDraft,
      days: editDraft.days.includes(day)
        ? editDraft.days.filter((d) => d !== day)
        : [...editDraft.days, day],
    });
  };

  const openStudentMenu = (id: string, btn: HTMLElement) => {
    if (menuKind === 'student' && menuId === id) {
      closeMenu();
      return;
    }
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setMenuKind('student');
    setMenuId(id);
  };

  const removeStudent = (id: string) => {
    setAssignedStudents((list) => {
      const next = list.filter((s) => s.id !== id);
      setProgramStudents(program.id, program.name, next);
      return next;
    });
    if (editingId === id) cancelEdit();
    closeMenu();
    setToast('Student removed from program');
    window.setTimeout(() => setToast(null), 3000);
  };

  const startStaffEdit = (staff: AssignedStaff) => {
    closeMenu();
    setEditingId(null);
    setEditDraft(null);
    setEditingStaffId(staff.id);
    setEditStaffDraft({ ...staff, days: [...staff.days] });
  };

  const cancelStaffEdit = () => {
    setEditingStaffId(null);
    setEditStaffDraft(null);
  };

  const saveStaffEdit = () => {
    if (!editStaffDraft || !editingStaffId) return;
    setAssignedStaff((list) => {
      const next = list.map((s) => (s.id === editingStaffId ? { ...editStaffDraft } : s));
      setProgramStaff(program.id, program.name, next);
      return next;
    });
    setToast('Staff assignment updated');
    window.setTimeout(() => setToast(null), 3000);
    cancelStaffEdit();
  };

  const toggleStaffEditDay = (day: string) => {
    if (!editStaffDraft) return;
    setEditStaffDraft({
      ...editStaffDraft,
      days: editStaffDraft.days.includes(day)
        ? editStaffDraft.days.filter((d) => d !== day)
        : [...editStaffDraft.days, day],
    });
  };

  const openStaffMenu = (id: string, btn: HTMLElement) => {
    if (menuKind === 'staff' && menuId === id) {
      closeMenu();
      return;
    }
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setMenuKind('staff');
    setMenuId(id);
  };

  const removeStaff = (id: string) => {
    setAssignedStaff((list) => {
      const next = list.filter((s) => s.id !== id);
      setProgramStaff(program.id, program.name, next);
      return next;
    });
    if (editingStaffId === id) cancelStaffEdit();
    closeMenu();
    setToast('Staff removed from program');
    window.setTimeout(() => setToast(null), 3000);
  };

  const menuStudent =
    menuKind === 'student' && menuId
      ? assignedStudents.find((s) => s.id === menuId) ?? null
      : null;
  const menuStaff =
    menuKind === 'staff' && menuId ? assignedStaff.find((s) => s.id === menuId) ?? null : null;

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    return assignedStaff.filter((s) => {
      const matchesName = !q || s.name.toLowerCase().includes(q);
      const staffRooms = (s.rooms || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      const rooms = staffRooms.length ? staffRooms : programRoomList;
      const matchesRoom = staffRoomFilter === 'All' || rooms.includes(staffRoomFilter);
      return matchesName && matchesRoom;
    });
  }, [assignedStaff, staffSearch, staffRoomFilter, programRoomList]);

  const forecastStudents = useMemo(() => {
    const q = forecastSearch.trim().toLowerCase();
    return assignedStudents.filter((s) => {
      const matchesName = !q || s.name.toLowerCase().includes(q);
      const matchesRoom =
        forecastRoomFilter === 'All' || roomsForAssignedStudent(s).includes(forecastRoomFilter);
      return matchesName && matchesRoom;
    });
  }, [forecastSearch, assignedStudents, forecastRoomFilter, studentRoomsById, programRoomList]);

  const forecastStaff = useMemo(() => {
    const q = forecastSearch.trim().toLowerCase();
    return assignedStaff.filter((s) => {
      const matchesName = !q || s.name.toLowerCase().includes(q);
      const staffRooms = (s.rooms || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      const rooms = staffRooms.length ? staffRooms : programRoomList;
      const matchesRoom = forecastRoomFilter === 'All' || rooms.includes(forecastRoomFilter);
      return matchesName && matchesRoom;
    });
  }, [forecastSearch, assignedStaff, forecastRoomFilter, programRoomList]);

  const forecastPeople = forecastMode === 'Student' ? forecastStudents : forecastStaff;
  const forecastExpected = forecastPeople.length;

  const capacityWeekLabel = useMemo(() => {
    const end = addCapacityDays(capacityWeekStart, 6);
    return `${formatCapacityDate(capacityWeekStart)} - ${formatCapacityDate(end)}`;
  }, [capacityWeekStart]);

  const capacityRows = useMemo(() => {
    const max = capacityMode === 'Staff' ? extras.maxStaff : extras.maxStudents;
    const studentCount = Math.max(assignedStudents.length, program.occupancy, 0);
    const staffCount = Math.max(assignedStaff.length, 0);
    const utilisedBase = capacityMode === 'Staff' ? staffCount : studentCount;
    const programDays = program.days.length
      ? program.days
      : (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[]);

    const rows: Array<{
      date: string;
      day: string;
      available: number;
      utilized: number;
      ratio: string;
      tone: 'green' | 'orange' | 'blue';
    }> = [];

    for (let offset = 0; offset < 7; offset += 1) {
      const dayDate = addCapacityDays(capacityWeekStart, offset);
      const short = CAPACITY_DAY_SHORT[dayDate.getDay()];
      if (!programDays.includes(short)) continue;

      // Mild weekday variance so the table feels like the reference screens.
      const dayAdjust =
        capacityMode === 'Student' ? (offset >= 3 ? 1 : 0) : offset >= 4 ? 1 : 0;
      const utilized = Math.max(0, utilisedBase - dayAdjust);
      const available = Math.max(0, max - utilized);
      const ratioStaff = Math.max(staffCount, utilized > 0 ? 1 : 0);
      const ratioStudents = Math.max(studentCount, utilized > 0 ? 1 : 0);
      const ratio =
        capacityMode === 'Staff'
          ? `${Math.max(ratioStaff, 1)} : ${Math.max(ratioStudents, 1)}`
          : `${Math.max(ratioStaff, 1)} : ${Math.max(utilized, 1)}`;

      const fill = utilized / Math.max(max, 1);
      const tone: 'green' | 'orange' | 'blue' =
        available <= 0 ? 'blue' : fill >= 0.8 ? 'orange' : 'green';

      rows.push({
        date: formatCapacityDate(dayDate),
        day: CAPACITY_DAY_NAMES[dayDate.getDay()],
        available,
        utilized,
        ratio,
        tone,
      });
    }

    return rows;
  }, [
    assignedStaff.length,
    assignedStudents.length,
    capacityMode,
    capacityWeekStart,
    extras.maxStaff,
    extras.maxStudents,
    program.days,
    program.occupancy,
  ]);

  const occupancyMonths = useMemo(() => {
    const count = Math.min(12, Math.max(1, occMonthCount || 1));
    const match = occStartFrom.match(/^(\d{4})-(\d{2})/);
    const year = match ? Number(match[1]) : 2026;
    const month = match ? Number(match[2]) : 8;
    const labels: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const d = new Date(year, month - 1 + i, 1);
      const mon = d.toLocaleString('en-US', { month: 'short' });
      labels.push(`${mon}-${d.getFullYear()}`);
    }
    return labels;
  }, [occStartFrom, occMonthCount]);

  const occupancySeries = useMemo(() => {
    const studentUsed = Math.max(activeStudentCount, 0);
    const staffUsed = Math.max(assignedStaff.filter((s) => s.status === 'Active').length, 0);
    const studentBase = Number(((studentUsed / Math.max(extras.maxStudents, 1)) * 100).toFixed(2));
    const staffBase = Number(((staffUsed / Math.max(extras.maxStaff, 1)) * 100).toFixed(2));
    const students = occupancyMonths.map(() => studentBase);
    const staff = occupancyMonths.map(() => staffBase);
    const peak = Math.max(15, ...students, ...staff, 1);
    return { students, staff, peak };
  }, [
    activeStudentCount,
    assignedStaff,
    extras.maxStudents,
    extras.maxStaff,
    occupancyMonths,
  ]);

  const occStartDisplay = useMemo(() => {
    const m = occStartFrom.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return occStartFrom;
    return `${m[3]}/${m[2]}/${m[1]}`;
  }, [occStartFrom]);

  const occupancyTone = (pct: number) => {
    if (pct > 100) return styles.occToneHigh;
    if (pct >= 80) return styles.occToneMid;
    return styles.occToneLow;
  };

  const toggleAvailabilityDay = (day: string) => {
    setAvailabilityForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const runAvailabilityCheck = () => {
    if (!availabilityForm.startDate || availabilityForm.days.length === 0) return;
    const dayOk = availabilityForm.days.some((d) => program.days.includes(d));
    const capacity = dayOk && program.status === 'Active' ? Math.max(0, extras.maxStudents - extras.activeStudents) : 0;
    setAvailabilityResult(`Available Capacity : ${capacity}`);
    setToast(capacity > 0 ? `Available capacity is ${capacity}` : 'No available capacity for the selected details');
    window.setTimeout(() => setToast(null), 3500);
  };

  const headerAction =
    tab === 'staff' || (tab === 'capacity' && capacityMode === 'Staff') ? (
      <button
        type="button"
        className="ui-btn ui-btn-primary"
        onClick={() => {
          setTab('staff');
          setAssigningStaff(true);
        }}
      >
        + Assign Staff
      </button>
    ) : (
      <button
        type="button"
        className="ui-btn ui-btn-primary"
        onClick={() => {
          setTab('students');
          setAssigningStudents(true);
        }}
      >
        + Assign Students
      </button>
    );

  if (assigningStudents) {
    return (
      <>
        {toast ? (
          <div className={styles.toast} role="status">
            <span aria-hidden>✓</span>
            <span>{toast}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        ) : null}
        <ProgramAssignStudentsView
          program={program}
          assignedCount={assignedStudents.length}
          maxCapacity={extras.maxStudents}
          alreadyAssignedNames={assignedStudents.map((s) => s.name)}
          onBack={() => setAssigningStudents(false)}
          onAssign={(students) => {
            setAssignedStudents((list) => {
              const names = new Set(list.map((s) => s.name.toLowerCase()));
              const fresh = students
                .filter((s) => !names.has(s.name.toLowerCase()))
                .map((s) => ({
                  id: s.id,
                  studentId: s.sourceId ?? s.id,
                  name: s.name,
                  age: s.age,
                  studentStatus: s.studentStatus,
                  status: s.status,
                  startDate: s.startDate,
                  endDate: s.endDate,
                  days: s.days,
                }));
              const next = [...fresh, ...list] as AssignedStudent[];
              setProgramStudents(program.id, program.name, next, {
                labels: program.labels ?? [],
              });
              return next;
            });
            setAssigningStudents(false);
            setTab('students');
            setStudentSearch('');
            setStudentRoomFilter('All');
            setStudentAssignStatusFilter('All');
            setStudentStatusFilter('All');
            setToast('Students assigned successfully');
            window.setTimeout(() => setToast(null), 3500);
          }}
        />
      </>
    );
  }

  if (assigningStaff) {
    return (
      <>
        {toast ? (
          <div className={styles.toast} role="status">
            <span aria-hidden>✓</span>
            <span>{toast}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        ) : null}
        <ProgramAssignStaffView
          program={program}
          assignedCount={assignedStaff.length}
          maxCapacity={extras.maxStaff}
          alreadyAssignedNames={assignedStaff.map((s) => s.name)}
          onBack={() => setAssigningStaff(false)}
          onAssign={(staff) => {
            setAssignedStaff((list) => {
              const names = new Set(list.map((s) => s.name.toLowerCase()));
              const fresh = staff
                .filter((s) => !names.has(s.name.toLowerCase()))
                .map((s) => ({
                  id: s.id,
                  name: s.name,
                  status: s.status,
                  startDate: s.startDate,
                  endDate: s.endDate,
                  days: s.days,
                  rooms: s.rooms,
                }));
              const next = [...fresh, ...list] as AssignedStaff[];
              setProgramStaff(program.id, program.name, next);
              return next;
            });
            setAssigningStaff(false);
            setTab('staff');
            setStaffSearch('');
            setToast('Staff assigned successfully');
            window.setTimeout(() => setToast(null), 3500);
          }}
        />
      </>
    );
  }

  return (
    <div className={`mod-page ${styles.page}`}>
      {toast ? (
        <div className={styles.toast} role="status">
          <span aria-hidden>✓</span>
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{program.name}</h1>
            <span className={styles.statusDot} data-status={program.status}>
              <i />
              {program.status}
            </span>
          </div>
          <p className={styles.breadcrumb}>
            <button type="button" className={styles.crumbInline} onClick={onBack}>
              Programs
            </button>
            <span> &gt; </span>
            <strong>Program Detail</strong>
          </p>
        </div>
        {tab !== 'overview' ? (
          <div className={styles.headActions}>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setAvailabilityForm({
                  startDate: '',
                  endDate: '',
                  days: [...program.days],
                });
                setAvailabilityResult('');
                setAvailabilityOpen(true);
              }}
            >
              Check Availability
            </button>
            {headerAction}
          </div>
        ) : null}
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          <span aria-hidden>📅</span>
          {program.startDate}
        </span>
        <span className={styles.summaryItem}>
          <span className={styles.runsOn}>Runs on :</span>
          <DayPills days={program.days} />
        </span>
        <span className={styles.summaryItem}>
          <span aria-hidden>🕒</span>
          {program.startTime} - {program.endTime}
          <span className={styles.durationNote}>{program.durationLabel}</span>
        </span>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'overview' ? (
        <section className={styles.overviewCard}>
          <div className={styles.overviewHead}>
            <h2 className={styles.sectionTitle}>Program Overview</h2>
            <div className={styles.overviewActions}>
              <button
                type="button"
                className={styles.iconBtn}
                title="Edit"
                aria-label="Edit"
                onClick={() => {
                  setEditForm({
                    name: program.name,
                    room: program.room,
                    status: program.status,
                    maxStudents: String(program.maxStudents ?? 20),
                    maxStaff: String(program.maxStaff ?? 20),
                  });
                  setEditOpen(true);
                }}
              >
                ✎
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                title="Delete"
                aria-label="Delete"
                onClick={() => {
                  if (typeof window !== 'undefined' && !window.confirm(`Delete program "${program.name}"?`)) {
                    return;
                  }
                  removeProgramAssignments(program.id);
                  if (onDeleted) onDeleted();
                  else {
                    removeProgram(program.id);
                    onBack();
                  }
                }}
              >
                🗑
              </button>
            </div>
          </div>
          <div className={styles.overviewTableWrap}>
            <table className={styles.overviewTable}>
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>{program.name}</td>
                </tr>
                <tr>
                  <th scope="row">Date Range</th>
                  <td>{dateLabel}</td>
                </tr>
                <tr>
                  <th scope="row">Time Range</th>
                  <td>
                    {program.startTime} - {program.endTime} ({program.durationLabel})
                  </td>
                </tr>
                <tr>
                  <th scope="row">Days of a week</th>
                  <td>
                    <DayPills days={program.days} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Rooms</th>
                  <td>{roomsLabel}</td>
                </tr>
                <tr>
                  <th scope="row">Labels</th>
                  <td>{program.labels.length ? program.labels.join(', ') : ''}</td>
                </tr>
                <tr>
                  <th scope="row">Min Age</th>
                  <td>{extras.minAge}</td>
                </tr>
                <tr>
                  <th scope="row">Max Age</th>
                  <td>{extras.maxAge}</td>
                </tr>
                <tr>
                  <th scope="row">Max capacity for students</th>
                  <td>{extras.maxStudents} students</td>
                </tr>
                <tr>
                  <th scope="row">Max capacity for staff</th>
                  <td>{extras.maxStaff} staff</td>
                </tr>
                <tr>
                  <th scope="row">Number of extra admission allowed for student</th>
                  <td>{extras.extraStudents}</td>
                </tr>
                <tr>
                  <th scope="row">Number of extra admission allowed for staff</th>
                  <td>{extras.extraStaff}</td>
                </tr>
                <tr>
                  <th scope="row">Active Students</th>
                  <td>{extras.activeStudents}</td>
                </tr>
                <tr>
                  <th scope="row">Upcoming Admissions</th>
                  <td>{extras.upcomingAdmissions}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
      <div className={styles.panel}>
        {tab === 'students' ? (
          <section>
            <div className={styles.filters}>
              <div className={styles.filterField}>
                <label htmlFor="view-student-search">Student</label>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    id="view-student-search"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by name"
                  />
                </div>
              </div>
              <div className={styles.filterField}>
                <label>Date Range</label>
                <input className="ui-input" readOnly value="01/01/2026 - 01/01/2031" />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-student-room">Room</label>
                <select
                  id="view-student-room"
                  className="ui-filter"
                  value={studentRoomFilter}
                  onChange={(e) => setStudentRoomFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {activeRoomNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-student-status">Status</label>
                <SearchFilterSelect
                  id="view-student-status"
                  label="Status"
                  value={studentAssignStatusFilter}
                  options={STATUS_FILTER_OPTIONS}
                  onChange={setStudentAssignStatusFilter}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-student-person-status">Student Status</label>
                <SearchFilterSelect
                  id="view-student-person-status"
                  label="Student Status"
                  value={studentStatusFilter}
                  options={STUDENT_STATUS_FILTER_OPTIONS}
                  onChange={setStudentStatusFilter}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <EmptyState title="No Data" description="No students assigned to this program." />
            ) : (
              <div className={styles.tableScroll}>
                <table className={`ui-table ${styles.studentsTable}`}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days Of Week</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const isEditing = editingId === s.id && editDraft;
                      return (
                        <tr key={s.id} className={isEditing ? styles.editingRow : undefined}>
                          <td>
                            <div className={styles.personCell}>
                              <span className={styles.avatar} aria-hidden>
                                {s.name.charAt(0)}
                              </span>
                              <div>
                                <strong>{s.name}</strong>
                                <span className={styles.meta}>{s.studentStatus}</span>
                                <span className={styles.meta}>Age: {s.age}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {isEditing && editDraft ? (
                              <select
                                className="ui-select"
                                value={editDraft.status}
                                onChange={(e) =>
                                  setEditDraft({
                                    ...editDraft,
                                    status: e.target.value as AssignmentStatus,
                                  })
                                }
                              >
                                {ASSIGNMENT_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <StatusBadge status={s.status} />
                            )}
                          </td>
                          <td>
                            {isEditing && editDraft ? (
                              <FieldDatePicker
                                value={displayToIso(editDraft.startDate)}
                                onChange={(iso) =>
                                  setEditDraft({
                                    ...editDraft,
                                    startDate: isoToDisplay(iso),
                                  })
                                }
                                ariaLabel="Student start date"
                              />
                            ) : (
                              s.startDate
                            )}
                          </td>
                          <td>
                            {isEditing && editDraft ? (
                              <FieldDatePicker
                                value={displayToIso(editDraft.endDate)}
                                onChange={(iso) =>
                                  setEditDraft({
                                    ...editDraft,
                                    endDate: isoToDisplay(iso),
                                  })
                                }
                                ariaLabel="Student end date"
                              />
                            ) : (
                              s.endDate
                            )}
                          </td>
                          <td>
                            {isEditing && editDraft ? (
                              <div className={styles.editDays}>
                                {WEEK_DAYS.map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    className={`${styles.dayChip} ${
                                      editDraft.days.includes(d) ? styles.dayChipOn : ''
                                    }`}
                                    data-day={d}
                                    onClick={() => toggleEditDay(d)}
                                  >
                                    {d}
                                    {editDraft.days.includes(d) ? <span aria-hidden>×</span> : null}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <DayPills days={s.days} />
                            )}
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                title="Edit"
                                aria-label={`Edit ${s.name}`}
                                onClick={() => startEdit(s)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                title="More actions"
                                aria-label={`More actions for ${s.name}`}
                                data-student-menu={s.id}
                                onClick={(e) => openStudentMenu(s.id, e.currentTarget)}
                              >
                                ⋮
                              </button>
                            </div>
                            {isEditing ? (
                              <div className={styles.editFooter}>
                                <button type="button" className="ui-btn ui-btn-outline" onClick={cancelEdit}>
                                  Cancel
                                </button>
                                <button type="button" className="ui-btn ui-btn-primary" onClick={saveEdit}>
                                  Update
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className={styles.pagerInfo}>
              Showing {filteredStudents.length === 0 ? 0 : 1}-{filteredStudents.length} of{' '}
              {filteredStudents.length} results
            </p>
          </section>
        ) : null}

        {tab === 'staff' ? (
          <section>
            <div className={styles.filters}>
              <div className={styles.filterField}>
                <label htmlFor="view-staff-search">Staff</label>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    id="view-staff-search"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Search by name"
                  />
                </div>
              </div>
              <div className={styles.filterField}>
                <label>Date Range</label>
                <input className="ui-input" readOnly value="01/01/2026 - 01/01/2031" />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-staff-room">Room</label>
                <select
                  id="view-staff-room"
                  className="ui-filter"
                  value={staffRoomFilter}
                  onChange={(e) => setStaffRoomFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {activeRoomNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-staff-status">Status</label>
                <select id="view-staff-status" className="ui-filter" defaultValue="All">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <EmptyState title="No Data" description="No staff assigned to this program." />
            ) : (
              <div className={styles.tableScroll}>
                <table className={`ui-table ${styles.studentsTable}`}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days Of Week</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((s) => {
                      const isEditing = editingStaffId === s.id && editStaffDraft;
                      return (
                        <tr key={s.id} className={isEditing ? styles.editingRow : undefined}>
                          <td>
                            <div className={styles.personCell}>
                              <span className={styles.avatar} aria-hidden>
                                {s.name.charAt(0)}
                              </span>
                              <div>
                                <strong>{s.name}</strong>
                                <span className={styles.meta}>{s.status}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {isEditing && editStaffDraft ? (
                              <select
                                className="ui-select"
                                value={editStaffDraft.status}
                                onChange={(e) =>
                                  setEditStaffDraft({
                                    ...editStaffDraft,
                                    status: e.target.value as 'Active' | 'Inactive',
                                  })
                                }
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={styles.activeStatus}>
                                ● {s.status.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing && editStaffDraft ? (
                              <FieldDatePicker
                                value={displayToIso(editStaffDraft.startDate)}
                                onChange={(iso) =>
                                  setEditStaffDraft({
                                    ...editStaffDraft,
                                    startDate: isoToDisplay(iso),
                                  })
                                }
                                ariaLabel="Staff start date"
                              />
                            ) : (
                              s.startDate
                            )}
                          </td>
                          <td>
                            {isEditing && editStaffDraft ? (
                              <FieldDatePicker
                                value={displayToIso(editStaffDraft.endDate)}
                                onChange={(iso) =>
                                  setEditStaffDraft({
                                    ...editStaffDraft,
                                    endDate: isoToDisplay(iso),
                                  })
                                }
                                ariaLabel="Staff end date"
                              />
                            ) : (
                              s.endDate || '—'
                            )}
                          </td>
                          <td>
                            {isEditing && editStaffDraft ? (
                              <div className={styles.editDays}>
                                {WEEK_DAYS.map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    className={`${styles.dayChip} ${
                                      editStaffDraft.days.includes(d) ? styles.dayChipOn : ''
                                    }`}
                                    data-day={d}
                                    onClick={() => toggleStaffEditDay(d)}
                                  >
                                    {d}
                                    {editStaffDraft.days.includes(d) ? (
                                      <span aria-hidden>×</span>
                                    ) : null}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <DayPills days={s.days} />
                            )}
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                title="More actions"
                                aria-label={`More actions for ${s.name}`}
                                aria-expanded={menuKind === 'staff' && menuId === s.id}
                                data-staff-menu={s.id}
                                onClick={(e) => openStaffMenu(s.id, e.currentTarget)}
                              >
                                ⋮
                              </button>
                            </div>
                            {isEditing ? (
                              <div className={styles.editFooter}>
                                <button
                                  type="button"
                                  className="ui-btn ui-btn-outline"
                                  onClick={cancelStaffEdit}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="ui-btn ui-btn-primary"
                                  onClick={saveStaffEdit}
                                >
                                  Update
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className={styles.pagerInfo}>
              Showing {filteredStaff.length === 0 ? 0 : 1}-{filteredStaff.length} of {filteredStaff.length}{' '}
              results
            </p>
          </section>
        ) : null}

        {tab === 'capacity' ? (
          <section>
            <div className={styles.capacityBar}>
              <div className={styles.segmented} role="group" aria-label="Capacity type">
                {(['Student', 'Staff'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={capacityMode === mode ? styles.segmentActive : styles.segment}
                    onClick={() => setCapacityMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className={styles.weekNav}>
                <button
                  type="button"
                  className="ui-page-btn"
                  aria-label="Previous week"
                  onClick={() => setCapacityWeekStart((d) => addCapacityDays(d, -7))}
                >
                  ‹
                </button>
                <span className={styles.weekRange}>
                  {capacityWeekLabel}
                  <span aria-hidden>📅</span>
                </span>
                <button
                  type="button"
                  className="ui-page-btn"
                  aria-label="Next week"
                  onClick={() => setCapacityWeekStart((d) => addCapacityDays(d, 7))}
                >
                  ›
                </button>
              </div>
              <div className={styles.capacityAssignWrap}>
                {capacityMode === 'Staff' ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => {
                      setTab('staff');
                      setAssigningStaff(true);
                    }}
                  >
                    Assign Staff
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => {
                      setTab('students');
                      setAssigningStudents(true);
                    }}
                  >
                    Assign Students
                  </button>
                )}
              </div>
            </div>
            <div className={styles.capacityMeta}>
              <span>
                Maximum capacity :{' '}
                {capacityMode === 'Staff' ? extras.maxStaff : extras.maxStudents}
              </span>
              <div className={styles.legend}>
                <span>
                  <i className={styles.legendGreen} /> Abundant capacity
                </span>
                <span>
                  <i className={styles.legendOrange} /> Limited capacity
                </span>
                <span>
                  <i className={styles.legendBlue} /> Full capacity
                </span>
              </div>
            </div>
            <div className={styles.tableScroll}>
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Available Capacity</th>
                    <th>Utilised Capacity</th>
                    <th>Staff/Student ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {capacityRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No capacity data for this week.</td>
                    </tr>
                  ) : (
                    capacityRows.map((row) => (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td>{row.day}</td>
                        <td
                          className={
                            row.tone === 'blue'
                              ? styles.capFull
                              : row.tone === 'orange'
                                ? styles.capLimited
                                : styles.capAvailable
                          }
                        >
                          {row.available} seats
                        </td>
                        <td>
                          <strong>{row.utilized} seats</strong>
                        </td>
                        <td>{row.ratio}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === 'occupancy' ? (
          <section className={styles.occReport}>
            <div className={styles.occFilters}>
              <div className={styles.filterField}>
                <label htmlFor="view-occ-split">Split By</label>
                <select
                  id="view-occ-split"
                  className="ui-filter"
                  value={occSplitBy}
                  onChange={(e) => setOccSplitBy(e.target.value)}
                >
                  <option value="Month">Month</option>
                  <option value="Week">Week</option>
                </select>
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-occ-start">Start From</label>
                <FieldDatePicker
                  value={occStartFrom}
                  onChange={setOccStartFrom}
                  ariaLabel="Occupancy start from"
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-occ-months">Number Of Months</label>
                <input
                  id="view-occ-months"
                  className="ui-input"
                  type="number"
                  min={1}
                  max={12}
                  value={occMonthCount}
                  onChange={(e) => setOccMonthCount(Number(e.target.value) || 1)}
                />
              </div>
            </div>

            <p className={styles.occHelper}>
              You are looking at occupancy data for the next {Math.min(12, Math.max(1, occMonthCount || 1))}{' '}
              months starting from {occStartDisplay}
            </p>

            <div className={styles.occChartCard}>
              <div className={styles.occChartHead}>
                <div>
                  <h3>Monthly Average Occupancy</h3>
                  <p>
                    Visualize student and staff utilised capacity by day to efficiently manage enrollment and
                    staffing at the childcare center.
                  </p>
                </div>
                <div className={styles.occChartLegend}>
                  <span>
                    <i className={styles.occSwatchStudent} aria-hidden /> Student
                  </span>
                  <span>
                    <i className={styles.occSwatchStaff} aria-hidden /> Staff
                  </span>
                </div>
              </div>
              <div className={styles.occChartBody}>
                <div className={styles.occYAxis} aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => {
                    const value = Math.round((occupancySeries.peak * (4 - i)) / 4);
                    return <span key={value}>{value}%</span>;
                  })}
                </div>
                <div className={styles.occBars}>
                  {occupancyMonths.map((label, index) => {
                    const studentH = (occupancySeries.students[index] / occupancySeries.peak) * 100;
                    const staffH = (occupancySeries.staff[index] / occupancySeries.peak) * 100;
                    return (
                      <div key={label} className={styles.occBarGroup}>
                        <div className={styles.occBarPair}>
                          <span
                            className={styles.occBarStudent}
                            style={{ height: `${Math.max(studentH, 4)}%` }}
                            title={`Student ${occupancySeries.students[index]}%`}
                          />
                          <span
                            className={styles.occBarStaff}
                            style={{ height: `${Math.max(staffH, 4)}%` }}
                            title={`Staff ${occupancySeries.staff[index]}%`}
                          />
                        </div>
                        <span className={styles.occBarLabel}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.occTableCard}>
              <div className={styles.occTableHead}>
                <h3>Student Occupancy</h3>
                <div className={styles.occUtilLegend}>
                  <span>
                    <i style={{ background: '#f59e0b' }} aria-hidden /> {'< 80% (under utilised)'}
                  </span>
                  <span>
                    <i style={{ background: '#16a34a' }} aria-hidden /> 80% - 100% (moderately utilised)
                  </span>
                  <span>
                    <i style={{ background: '#dc2626' }} aria-hidden /> {'> 100% (over utilised)'}
                  </span>
                </div>
              </div>
              <div className={styles.tableScroll}>
                <table className={`ui-table ${styles.occTable}`}>
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      {occupancyMonths.map((m) => (
                        <th key={`stu-${m}`}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className={styles.occProgCell}>
                          <strong>{program.name}</strong>
                          <span>
                            Max occupancy : <em>{extras.maxStudents}</em>
                          </span>
                          <span>
                            Over capacity limit : <b>{extras.extraStudents}</b>
                          </span>
                        </div>
                      </td>
                      {occupancySeries.students.map((pct, i) => (
                        <td key={`stu-pct-${occupancyMonths[i]}`} className={occupancyTone(pct)}>
                          {pct} %
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.occTableCard}>
              <div className={styles.occTableHead}>
                <h3>Staff Occupancy</h3>
                <div className={styles.occUtilLegend}>
                  <span>
                    <i style={{ background: '#f59e0b' }} aria-hidden /> {'< 80% (under utilised)'}
                  </span>
                  <span>
                    <i style={{ background: '#16a34a' }} aria-hidden /> 80% - 100% (moderately utilised)
                  </span>
                  <span>
                    <i style={{ background: '#dc2626' }} aria-hidden /> {'> 100% (over utilised)'}
                  </span>
                </div>
              </div>
              <div className={styles.tableScroll}>
                <table className={`ui-table ${styles.occTable}`}>
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      {occupancyMonths.map((m) => (
                        <th key={`staff-${m}`}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className={styles.occProgCell}>
                          <strong>{program.name}</strong>
                          <span>
                            Max occupancy : <em>{extras.maxStaff}</em>
                          </span>
                          <span>
                            Over capacity limit : <b>{extras.extraStaff}</b>
                          </span>
                        </div>
                      </td>
                      {occupancySeries.staff.map((pct, i) => (
                        <td key={`staff-pct-${occupancyMonths[i]}`} className={occupancyTone(pct)}>
                          {pct} %
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'forecast' ? (
          <section>
            <div className={styles.capacityBar}>
              <div className={styles.segmented} role="group" aria-label="Forecast type">
                {(['Student', 'Staff'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={forecastMode === mode ? styles.segmentActive : styles.segment}
                    onClick={() => {
                      setForecastMode(mode);
                      setForecastSearch('');
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className={styles.weekNav}>
                <button type="button" className="ui-page-btn" aria-label="Previous week">
                  ‹
                </button>
                <span>26/07/2026 - 01/08/2026</span>
                <button type="button" className="ui-page-btn" aria-label="Next week">
                  ›
                </button>
              </div>
              <div className={styles.filterField} style={{ minWidth: 180 }}>
                <label htmlFor="view-forecast-search">Search</label>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    id="view-forecast-search"
                    value={forecastSearch}
                    onChange={(e) => setForecastSearch(e.target.value)}
                    placeholder={
                      forecastMode === 'Student' ? 'Search By Student Name' : 'Search by staff name'
                    }
                  />
                </div>
              </div>
              <div className={styles.filterField}>
                <label htmlFor="view-forecast-room">Room</label>
                <select
                  id="view-forecast-room"
                  className="ui-filter"
                  value={forecastRoomFilter}
                  onChange={(e) => setForecastRoomFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {activeRoomNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.tableScroll}>
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>{forecastMode === 'Student' ? 'Student Name' : 'Staff Name'}</th>
                    {FORECAST_DATES.map((d) => (
                      <th key={d.key}>{d.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Signed In</strong>
                    </td>
                    {FORECAST_DATES.map((d) => (
                      <td key={d.key}>{d.key === 'd0' || d.key === 'd6' ? '—' : '0'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Total Expected</strong>
                    </td>
                    {FORECAST_DATES.map((d) => (
                      <td key={d.key}>
                        {d.key === 'd0' || d.key === 'd6' ? '—' : String(forecastExpected)}
                      </td>
                    ))}
                  </tr>
                  {forecastMode === 'Student'
                    ? forecastStudents.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <button
                              type="button"
                              className={styles.forecastNameBtn}
                              onClick={() => {
                                setProfileStaff(null);
                                setProfileStudent(s);
                              }}
                            >
                              <span className={styles.avatar} aria-hidden>
                                {s.name.charAt(0)}
                              </span>
                              <strong>{s.name}</strong>
                            </button>
                          </td>
                          {FORECAST_DATES.map((d) => (
                            <td key={d.key}>
                              {d.key === 'd0' || d.key === 'd6' ? (
                                '—'
                              ) : (
                                <span className={styles.forecastExpected}>Expected</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    : forecastStaff.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <button
                              type="button"
                              className={styles.forecastNameBtn}
                              onClick={() => {
                                setProfileStudent(null);
                                setProfileStaff(s);
                              }}
                            >
                              <span className={styles.avatar} aria-hidden>
                                {s.name.charAt(0)}
                              </span>
                              <strong>{s.name}</strong>
                            </button>
                          </td>
                          {FORECAST_DATES.map((d) => (
                            <td key={d.key}>
                              {d.key === 'd0' || d.key === 'd6' ? (
                                '—'
                              ) : (
                                <span className={styles.forecastExpected}>Expected</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
      )}

      <Modal
        open={availabilityOpen}
        title="Check Availability"
        onClose={() => setAvailabilityOpen(false)}
        footer={
          <div className={styles.availabilityFooter}>
            <button type="button" className="ui-btn ui-btn-primary" onClick={runAvailabilityCheck}>
              Check Availability
            </button>
            {availabilityResult ? <p className={styles.availabilityCapacity}>{availabilityResult}</p> : null}
          </div>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Start Date <span className="req">*</span>
            </label>
            <FieldDatePicker
              value={availabilityForm.startDate}
              onChange={(startDate) => setAvailabilityForm({ ...availabilityForm, startDate })}
              ariaLabel="Availability start date"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">End Date</label>
            <FieldDatePicker
              value={availabilityForm.endDate}
              onChange={(endDate) => setAvailabilityForm({ ...availabilityForm, endDate })}
              ariaLabel="Availability end date"
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label">
            Day Of Week <span className="req">*</span>
          </label>
          <div className={styles.dayToggles}>
            {WEEK_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.dayToggle} ${availabilityForm.days.includes(d) ? styles.dayToggleActive : ''}`}
                onClick={() => toggleAvailabilityDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(profileStudent)}
        title="Student Profile"
        onClose={() => setProfileStudent(null)}
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setProfileStudent(null)}>
            Close
          </button>
        }
      >
        {profileStudent ? (
          <div className={styles.profileBody}>
            <div className={styles.personCell}>
              <span className={styles.avatarLarge} aria-hidden>
                {profileStudent.name.charAt(0)}
              </span>
              <div>
                <strong>{profileStudent.name}</strong>
                <span className={styles.meta}>Age: {profileStudent.age}</span>
              </div>
            </div>
            <div className={styles.kvMini}>
              <span>Student status</span>
              <strong>{profileStudent.studentStatus}</strong>
            </div>
            <div className={styles.kvMini}>
              <span>Assignment status</span>
              <StatusBadge status={profileStudent.status} />
            </div>
            <div className={styles.kvMini}>
              <span>Date range</span>
              <strong>
                {profileStudent.startDate} – {profileStudent.endDate}
              </strong>
            </div>
            <div className={styles.kvMini}>
              <span>Days</span>
              <DayPills days={profileStudent.days} />
            </div>
            <div className={styles.kvMini}>
              <span>Program</span>
              <strong>{program.name}</strong>
            </div>
            <div className={styles.kvMini}>
              <span>Room</span>
              <strong>{program.room}</strong>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(profileStaff)}
        title="Staff Profile"
        onClose={() => setProfileStaff(null)}
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setProfileStaff(null)}>
            Close
          </button>
        }
      >
        {profileStaff ? (
          <div className={styles.profileBody}>
            <div className={styles.personCell}>
              <span className={styles.avatarLarge} aria-hidden>
                {profileStaff.name.charAt(0)}
              </span>
              <div>
                <strong>{profileStaff.name}</strong>
                <span className={styles.meta}>{profileStaff.status}</span>
              </div>
            </div>
            <div className={styles.kvMini}>
              <span>Status</span>
              <strong>{profileStaff.status}</strong>
            </div>
            <div className={styles.kvMini}>
              <span>Date range</span>
              <strong>
                {profileStaff.startDate}
                {profileStaff.endDate ? ` – ${profileStaff.endDate}` : ''}
              </strong>
            </div>
            <div className={styles.kvMini}>
              <span>Days</span>
              <DayPills days={profileStaff.days} />
            </div>
            <div className={styles.kvMini}>
              <span>Program</span>
              <strong>{program.name}</strong>
            </div>
            <div className={styles.kvMini}>
              <span>Room</span>
              <strong>{profileStaff.rooms || program.room}</strong>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editOpen}
        title="Edit Program"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                if (!editForm.name.trim()) return;
                updateProgram(program.id, {
                  name: editForm.name.trim(),
                  room: editForm.room,
                  rooms: program.rooms?.length ? program.rooms : [editForm.room],
                  status: editForm.status,
                  maxStudents: Number(editForm.maxStudents) || 0,
                  maxStaff: Number(editForm.maxStaff) || 0,
                });
                setEditOpen(false);
                setToast('Program updated');
                window.setTimeout(() => setToast(null), 3000);
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">Program Name</label>
            <input
              className="ui-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Room</label>
            <select
              className="ui-select"
              value={editForm.room}
              onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
            >
              {(activeRoomNames.includes(editForm.room) || !editForm.room
                ? activeRoomNames
                : [...activeRoomNames, editForm.room]
              ).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-field">
            <label className="ui-label">Status</label>
            <select
              className="ui-select"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  status: e.target.value as ViewProgramRecord['status'],
                })
              }
            >
              {(['Active', 'Expired', 'Upcoming'] as const).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-field">
            <label className="ui-label">Max Students</label>
            <input
              className="ui-input"
              type="number"
              min={0}
              value={editForm.maxStudents}
              onChange={(e) => setEditForm({ ...editForm, maxStudents: e.target.value })}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Max Staff</label>
            <input
              className="ui-input"
              type="number"
              min={0}
              value={editForm.maxStaff}
              onChange={(e) => setEditForm({ ...editForm, maxStaff: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {menuStudent && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className={styles.studentMenu}
              role="menu"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileStudent(menuStudent);
                  closeMenu();
                }}
              >
                <span aria-hidden>👤</span> View Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.menuDanger}
                onClick={() => removeStudent(menuStudent.id)}
              >
                <span aria-hidden>🗑</span> Remove Student
              </button>
            </div>,
            document.body,
          )
        : null}

      {menuStaff && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className={styles.studentMenu}
              role="menu"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileStaff(menuStaff);
                  closeMenu();
                }}
              >
                <span aria-hidden>👤</span> View Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => startStaffEdit(menuStaff)}
              >
                <span aria-hidden>✎</span> Edit Detail
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.menuDanger}
                onClick={() => removeStaff(menuStaff.id)}
              >
                <span aria-hidden>🗑</span> Remove Staff
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
