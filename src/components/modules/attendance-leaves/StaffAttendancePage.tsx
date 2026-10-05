'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  LogIn,
  LogOut,
  MoreVertical,
  QrCode,
  RotateCcw,
  Search,
  Sparkles,
  Thermometer,
  Trash2,
  UserCog,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AttendanceLeavePageHeader } from './AttendanceLeavePageHeader';
import { ProfileTablePagination } from '@/components/modules/center-management/ui';
import type { AttendanceRecord } from '@/lib/center-management/types';
import {
  ABSENT_TYPES,
  STAFF_GROUP_FILTERS,
  STAFF_ROLE_FILTERS,
  STAFF_ROOM_FILTERS,
  buildIsoFromParts,
  clearStaffDayRecord,
  dateInputValue,
  dayStatus,
  ensureTodayDemoStaffAttendance,
  formatAttDate,
  formatAttMonth,
  formatTimeDisplay,
  getStaffDayRecord,
  loadStaffAttendees,
  monthKey,
  monthlyStatsForStaff,
  parseTimeParts,
  staffPrimaryRoom,
  studentInitials,
  upsertStaffDayRecord,
  upsertStaffDayRecords,
  type StaffAttendee,
} from '@/lib/center-management/staffAttendanceStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import { AppMenu, AppMultiSelect, AppSelect, DayDatePicker, MonthPicker } from '@/components/modules/center-management/ui';
import { StaffLeavesPanel } from './StaffLeavesPanel';
import '@/components/modules/center-management/students.css';
import './student-attendance.css';


type MainTab = 'attendance' | 'leaves';
type ViewMode = 'daily' | 'monthly';
type RecordMode = 'check-in' | 'check-out';
type StatusFilter = 'all' | 'pending' | 'checked-in' | 'checked-out' | 'absent';

const ease = [0.22, 1, 0.36, 1] as const;

const notifyStaffOptions = loadStaff()
  .filter((x) => x.status === 'Active')
  .map((x) => ({ value: x.name, label: x.name }));
const absentOptions = ABSENT_TYPES.map((t) => ({ value: t, label: t }));
const roleFilterOptions = STAFF_ROLE_FILTERS.map((r) => ({ value: r.id, label: r.name }));
const ampmOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const h = String(i + 1);
  return { value: h, label: h.padStart(2, '0') };
});

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const m = String(i).padStart(2, '0');
  return { value: m, label: m };
});

function Time12Fields({
  hour,
  minute,
  ampm,
  onHour,
  onMinute,
  onAmpm,
}: {
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
  onHour: (v: string) => void;
  onMinute: (v: string) => void;
  onAmpm: (v: 'AM' | 'PM') => void;
}) {
  return (
    <div className="sa-time-inputs">
      <AppSelect
        value={hour}
        onChange={onHour}
        options={HOUR_OPTIONS}
        placeholder="Hr"
        className="sa-time-dd"
        triggerClassName="sa-time-trigger"
      />
      <span>:</span>
      <AppSelect
        value={minute}
        onChange={onMinute}
        options={MINUTE_OPTIONS}
        placeholder="Min"
        className="sa-time-dd"
        triggerClassName="sa-time-trigger"
      />
      <AppSelect
        value={ampm}
        onChange={(v) => onAmpm(v as 'AM' | 'PM')}
        options={ampmOptions}
        className="sa-time-dd sa-time-ampm"
        triggerClassName="sa-time-trigger"
      />
    </div>
  );
}

function avatarTone(name: string) {
  const tones = ['tone-a', 'tone-b', 'tone-c', 'tone-d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % tones.length;
  return tones[h];
}

type RecordDraft = {
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
  late: boolean;
  notes: string;
  temp: string;
  notifyStaff: string[];
  notifyTeam: boolean;
};

function blankDraft(parts?: ReturnType<typeof parseTimeParts>): RecordDraft {
  const p = parts ?? parseTimeParts();
  return {
    hour: p.hour,
    minute: p.minute,
    ampm: p.ampm,
    late: false,
    notes: '',
    temp: '',
    notifyStaff: [],
    notifyTeam: false,
  };
}

type AbsentDraft = {
  type: string;
  note: string;
};

function blankAbsentDraft(type = 'Fever'): AbsentDraft {
  return { type, note: '' };
}

export function StaffAttendancePage() {
  const searchParams = useSearchParams();
  const [mainTab, setMainTab] = useState<MainTab>(
    searchParams.get('tab') === 'leaves' ? 'leaves' : 'attendance',
  );
  useEffect(() => {
    if (searchParams.get('tab') === 'leaves') setMainTab('leaves');
  }, [searchParams]);

  const [view, setView] = useState<ViewMode>('daily');
  const [staffMembers, setStaffMembers] = useState<StaffAttendee[]>([]);
  const [dateKey, setDateKey] = useState(dateInputValue);
  const [monthYm, setMonthYm] = useState(monthKey());
  const [room, setRoom] = useState('all');
  const [group, setGroup] = useState('all');
  const [role, setRole] = useState('all');
  const roomFilterOptions = useMemo(
    () => STAFF_ROOM_FILTERS.map((r) => ({ value: r.id, label: r.name })),
    [],
  );
  const groupFilterOptions = useMemo(
    () => STAFF_GROUP_FILTERS.map((g) => ({ value: g.id, label: g.name })),
    [],
  );
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const [recordOpen, setRecordOpen] = useState(false);
  const [recordMode, setRecordMode] = useState<RecordMode>('check-in');
  const [recordTargets, setRecordTargets] = useState<StaffAttendee[]>([]);
  const [recordIndex, setRecordIndex] = useState(0);
  const [recordDrafts, setRecordDrafts] = useState<Record<string, RecordDraft>>({});
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [late, setLate] = useState(false);
  const [notes, setNotes] = useState('');
  const [temp, setTemp] = useState('');
  const [notifyStaff, setNotifyStaff] = useState<string[]>([]);
  const [notifyTeam, setNotifyTeam] = useState(false);

  const [absentOpen, setAbsentOpen] = useState(false);
  const [absentTargets, setAbsentTargets] = useState<StaffAttendee[]>([]);
  const [absentIndex, setAbsentIndex] = useState(0);
  const [absentDrafts, setAbsentDrafts] = useState<Record<string, AbsentDraft>>({});
  const [absentType, setAbsentType] = useState('Fever');
  const [absentNote, setAbsentNote] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffAttendee | null>(null);
  const [editInHour, setEditInHour] = useState('');
  const [editInMinute, setEditInMinute] = useState('');
  const [editInAmpm, setEditInAmpm] = useState<'AM' | 'PM'>('AM');
  const [editOutHour, setEditOutHour] = useState('');
  const [editOutMinute, setEditOutMinute] = useState('');
  const [editOutAmpm, setEditOutAmpm] = useState<'AM' | 'PM'>('PM');
  const [editInLate, setEditInLate] = useState(false);
  const [editOutLate, setEditOutLate] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrCardRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setStaffMembers(ensureTodayDemoStaffAttendance(loadStaffAttendees(), dateKey));
  };

  const syncStaff = () => {
    setStaffMembers(loadStaffAttendees());
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!qrOpen) return;
    let cancelled = false;
    (async () => {
      const QR = await import('qrcode');
      const url = await QR.toDataURL(`panacea-staff-attendance:${dateKey}`, {
        width: 280,
        margin: 1,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      });
      if (!cancelled) setQrDataUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [qrOpen, dateKey]);

  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staffMembers.filter((s) => {
      if (room !== 'all' && !s.rooms.includes(room)) return false;
      if (group !== 'all' && !s.groups.includes(group)) return false;
      if (role !== 'all' && s.role !== role) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [staffMembers, room, group, role, query]);

  const stats = useMemo(() => {
    let pending = 0;
    let checkedIn = 0;
    let checkedOut = 0;
    let absent = 0;
    for (const s of scoped) {
      const st = dayStatus(getStaffDayRecord(s, dateKey));
      if (st === 'pending') pending += 1;
      else if (st === 'checked-in') checkedIn += 1;
      else if (st === 'checked-out') checkedOut += 1;
      else if (st === 'absent') absent += 1;
    }
    return { all: scoped.length, pending, checkedIn, checkedOut, absent };
  }, [scoped, dateKey]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return scoped;
    return scoped.filter((s) => dayStatus(getStaffDayRecord(s, dateKey)) === statusFilter);
  }, [scoped, statusFilter, dateKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, page, pageSize, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, room, group, role, dateKey, view, statusFilter, pageSize, monthYm]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedStaff = () => filtered.filter((s) => selected.has(s.id));

  const requireSelection = () => {
    const list = selectedStaff();
    if (list.length === 0) {
      setToast({ type: 'err', message: 'Select at least one staff member to continue' });
      return null;
    }
    return list;
  };

  const loadDraftIntoForm = (draft: RecordDraft) => {
    setHour(draft.hour);
    setMinute(draft.minute);
    setAmpm(draft.ampm);
    setLate(draft.late);
    setNotes(draft.notes);
    setTemp(draft.temp);
    setNotifyStaff([...draft.notifyStaff]);
    setNotifyTeam(draft.notifyTeam);
  };

  const currentFormDraft = (): RecordDraft => ({
    hour,
    minute,
    ampm,
    late,
    notes,
    temp,
    notifyStaff: [...notifyStaff],
    notifyTeam,
  });

  const openRecord = (mode: RecordMode, targets: StaffAttendee[]) => {
    if (targets.length === 0) {
      setToast({ type: 'err', message: 'Select at least one staff member to continue' });
      return;
    }
    const seed = blankDraft(parseTimeParts());
    const drafts: Record<string, RecordDraft> = {};
    for (const t of targets) drafts[t.id] = { ...seed, notifyStaff: [] };
    setRecordDrafts(drafts);
    setRecordIndex(0);
    loadDraftIntoForm(seed);
    setRecordMode(mode);
    setRecordTargets(targets);
    setRecordOpen(true);
  };

  const persistCurrentDraft = () => {
    const member = recordTargets[recordIndex];
    if (!member) return { ...recordDrafts };
    const next = { ...recordDrafts, [member.id]: currentFormDraft() };
    setRecordDrafts(next);
    return next;
  };

  const goRecordPrev = () => {
    if (recordIndex <= 0) return;
    const drafts = persistCurrentDraft();
    const prev = recordIndex - 1;
    setRecordIndex(prev);
    const member = recordTargets[prev];
    if (member) loadDraftIntoForm(drafts[member.id] ?? blankDraft());
  };

  const applyRecordUpdates = (drafts: Record<string, RecordDraft>) => {
    const snapshot = loadStaffAttendees();
    const updates: { staffId: string; record: AttendanceRecord }[] = [];
    for (const target of recordTargets) {
      const draft = drafts[target.id];
      if (!draft) continue;
      const current = snapshot.find((s) => s.id === target.id);
      if (!current) continue;
      const prev = getStaffDayRecord(current, dateKey);
      const roomLabel = staffPrimaryRoom(current, prev?.room);
      const staffLabel = draft.notifyStaff.length
        ? draft.notifyStaff.join(', ')
        : 'Malika Thimisetty';
      const iso = buildIsoFromParts(dateKey, draft.hour, draft.minute, draft.ampm);
      const base: AttendanceRecord = prev
        ? { ...prev }
        : { id: `att-${current.id}-${dateKey}`, date: dateKey, room: roomLabel };

      if (recordMode === 'check-in') {
        Object.assign(base, {
          checkIn: iso,
          checkInBy: staffLabel,
          lateCheckIn: draft.late,
          notes: draft.notes || base.notes,
          temperature: draft.temp || base.temperature,
          notifyStaff: staffLabel,
          markedAbsent: false,
          absentType: undefined,
          absentNote: undefined,
        });
      } else {
        Object.assign(base, {
          checkOut: iso,
          checkOutBy: staffLabel,
          lateCheckOut: draft.late,
          notes: draft.notes || base.notes,
          notifyStaff: staffLabel,
        });
      }
      updates.push({ staffId: current.id, record: base });
    }
    setStaffMembers(upsertStaffDayRecords(updates));
    setRecordOpen(false);
    setSelected(new Set());
    setToast({
      type: 'ok',
      message:
        recordMode === 'check-in'
          ? `Check-in recorded for ${updates.length} staff member${updates.length === 1 ? '' : 's'}`
          : `Check-out recorded for ${updates.length} staff member${updates.length === 1 ? '' : 's'}`,
    });
  };

  const goRecordNextOrSubmit = () => {
    const current = recordTargets[recordIndex];
    if (!current) return;
    const form = currentFormDraft();
    const drafts: Record<string, RecordDraft> = { ...recordDrafts, [current.id]: form };

    if (recordIndex < recordTargets.length - 1) {
      const next = recordIndex + 1;
      const nextMember = recordTargets[next];
      if (nextMember) {
        const existing = drafts[nextMember.id] ?? blankDraft();
        const carried: RecordDraft = {
          ...existing,
          hour: form.hour,
          minute: form.minute,
          ampm: form.ampm,
          late: form.late,
          notifyStaff: [...form.notifyStaff],
          notifyTeam: form.notifyTeam,
        };
        drafts[nextMember.id] = carried;
        setRecordDrafts(drafts);
        setRecordIndex(next);
        loadDraftIntoForm(carried);
      }
      return;
    }

    setRecordDrafts(drafts);
    applyRecordUpdates(drafts);
  };

  const activeRecordStaff = recordTargets[recordIndex];
  const isMultiRecord = recordTargets.length > 1;
  const isLastRecordStep = recordIndex >= recordTargets.length - 1;
  const recordStepLabel =
    recordMode === 'check-in'
      ? isLastRecordStep
        ? 'Check-in'
        : 'Next'
      : isLastRecordStep
        ? 'Check-out'
        : 'Next';

  const resetFilters = () => {
    setRoom('all');
    setGroup('all');
    setRole('all');
    setQuery('');
    setStatusFilter('all');
    setSelected(new Set());
    setDateKey(dateInputValue());
    setPage(1);
    setToast({ type: 'ok', message: 'Filters reset' });
  };

  const openAbsent = (targets: StaffAttendee[]) => {
    if (targets.length === 0) {
      setToast({ type: 'err', message: 'Select at least one staff member to continue' });
      return;
    }
    const seed = blankAbsentDraft('Fever');
    const drafts: Record<string, AbsentDraft> = {};
    for (const t of targets) drafts[t.id] = { ...seed };
    setAbsentDrafts(drafts);
    setAbsentIndex(0);
    setAbsentType(seed.type);
    setAbsentNote(seed.note);
    setAbsentTargets(targets);
    setAbsentOpen(true);
  };

  const loadAbsentDraft = (draft: AbsentDraft) => {
    setAbsentType(draft.type);
    setAbsentNote(draft.note);
  };

  const currentAbsentDraft = (): AbsentDraft => ({
    type: absentType,
    note: absentNote,
  });

  const persistAbsentDraft = () => {
    const member = absentTargets[absentIndex];
    if (!member) return { ...absentDrafts };
    const next = { ...absentDrafts, [member.id]: currentAbsentDraft() };
    setAbsentDrafts(next);
    return next;
  };

  const goAbsentPrev = () => {
    if (absentIndex <= 0) return;
    const drafts = persistAbsentDraft();
    const prev = absentIndex - 1;
    setAbsentIndex(prev);
    const member = absentTargets[prev];
    if (member) loadAbsentDraft(drafts[member.id] ?? blankAbsentDraft());
  };

  const applyAbsentUpdates = (drafts: Record<string, AbsentDraft>) => {
    const snapshot = loadStaffAttendees();
    const updates: { staffId: string; record: AttendanceRecord }[] = [];
    for (const target of absentTargets) {
      const draft = drafts[target.id];
      if (!draft?.type) continue;
      const current = snapshot.find((s) => s.id === target.id);
      if (!current) continue;
      updates.push({
        staffId: current.id,
        record: {
          id: `att-${current.id}-${dateKey}`,
          date: dateKey,
          room: staffPrimaryRoom(current),
          markedAbsent: true,
          absentType: draft.type,
          absentNote: draft.note.trim() || undefined,
        },
      });
    }
    setStaffMembers(upsertStaffDayRecords(updates));
    setAbsentOpen(false);
    setSelected(new Set());
    setToast({
      type: 'ok',
      message: `Marked absent for ${updates.length} staff member${updates.length === 1 ? '' : 's'}`,
    });
  };

  const goAbsentNextOrSubmit = () => {
    if (!absentType) {
      setToast({ type: 'err', message: 'Select an absence type' });
      return;
    }
    const current = absentTargets[absentIndex];
    if (!current) return;
    const form = currentAbsentDraft();
    const drafts: Record<string, AbsentDraft> = { ...absentDrafts, [current.id]: form };

    if (absentIndex < absentTargets.length - 1) {
      const next = absentIndex + 1;
      const nextMember = absentTargets[next];
      if (nextMember) {
        const existing = drafts[nextMember.id] ?? blankAbsentDraft();
        const carried: AbsentDraft = { ...existing, type: form.type };
        drafts[nextMember.id] = carried;
        setAbsentDrafts(drafts);
        setAbsentIndex(next);
        loadAbsentDraft(carried);
      }
      return;
    }

    setAbsentDrafts(drafts);
    applyAbsentUpdates(drafts);
  };

  const activeAbsentStaff = absentTargets[absentIndex];
  const isMultiAbsent = absentTargets.length > 1;
  const isLastAbsentStep = absentIndex >= absentTargets.length - 1;
  const absentStepLabel = isLastAbsentStep ? 'Mark Absent' : 'Next';

  const openEdit = (staff: StaffAttendee) => {
    const rec = getStaffDayRecord(staff, dateKey);
    setEditStaff(staff);
    if (rec?.checkIn) {
      const p = parseTimeParts(new Date(rec.checkIn));
      setEditInHour(p.hour);
      setEditInMinute(p.minute);
      setEditInAmpm(p.ampm);
    } else {
      setEditInHour('');
      setEditInMinute('');
      setEditInAmpm('AM');
    }
    if (rec?.checkOut) {
      const p = parseTimeParts(new Date(rec.checkOut));
      setEditOutHour(p.hour);
      setEditOutMinute(p.minute);
      setEditOutAmpm(p.ampm);
    } else {
      setEditOutHour('');
      setEditOutMinute('');
      setEditOutAmpm('PM');
    }
    setEditInLate(Boolean(rec?.lateCheckIn));
    setEditOutLate(Boolean(rec?.lateCheckOut));
    setEditOpen(true);
  };

  const saveEditModal = () => {
    if (!editStaff) return;
    const prev = getStaffDayRecord(editStaff, dateKey);
    if (!prev) return;
    const nextIn =
      editInHour && editInMinute
        ? buildIsoFromParts(dateKey, editInHour, editInMinute, editInAmpm)
        : undefined;
    const nextOut =
      editOutHour && editOutMinute
        ? buildIsoFromParts(dateKey, editOutHour, editOutMinute, editOutAmpm)
        : undefined;
    upsertStaffDayRecord(editStaff.id, {
      ...prev,
      checkIn: nextIn,
      checkOut: nextOut,
      lateCheckIn: editInLate,
      lateCheckOut: editOutLate,
      checkInBy: nextIn ? prev.checkInBy || 'Malika Thimisetty' : undefined,
      checkOutBy: nextOut ? prev.checkOutBy || 'Malika Thimisetty' : undefined,
    });
    setEditOpen(false);
    setEditStaff(null);
    syncStaff();
    setToast({ type: 'ok', message: 'Attendance updated' });
  };

  const deleteEditEntry = () => {
    if (!editStaff) return;
    clearStaffDayRecord(editStaff.id, dateKey);
    setEditOpen(false);
    setEditStaff(null);
    syncStaff();
    setToast({ type: 'ok', message: 'Attendance entry deleted' });
  };

  const downloadMonthlyPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 48;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Monthly Staff Attendance Report', 40, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(formatAttMonth(monthYm), 40, y);
    y += 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    ['Name', 'Present', 'Absent', 'Leave', '%'].forEach((h, i) => {
      doc.text(h, 40 + i * 100, y);
    });
    y += 14;
    doc.setFont('helvetica', 'normal');
    filtered.forEach((s) => {
      if (y > 760) {
        doc.addPage();
        y = 48;
      }
      const m = monthlyStatsForStaff(s, monthYm);
      doc.text(s.name.slice(0, 22), 40, y);
      doc.text(String(m.present), 140, y);
      doc.text(String(m.absent), 240, y);
      doc.text(String(m.leave), 340, y);
      doc.text(`${m.percentage}%`, 440, y);
      y += 16;
    });
    doc.save(`staff-attendance-${monthYm}.pdf`);
    setToast({ type: 'ok', message: 'PDF downloaded' });
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `staff-attendance-qr-${dateKey}.png`;
    a.click();
    setToast({ type: 'ok', message: 'QR downloaded' });
  };

  const editRecord = editStaff ? getStaffDayRecord(editStaff, dateKey) : undefined;

  return (
    <div className="sa-root">
      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`sa-toast is-${toast.type}`}
            exit={{ opacity: 0, y: -8 }}
          >
            {toast.type === 'ok' ? <Check size={15} /> : <AlertTriangle size={15} />}
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AttendanceLeavePageHeader
        title={mainTab === 'leaves' ? 'Staff Leaves' : 'Staff Attendance'}
        description={
          mainTab === 'leaves'
            ? 'Manage staff leave requests, policies, and holiday coverage.'
            : 'Track daily check-in, check-out, and absence for every staff member.'
        }
        icon={mainTab === 'leaves' ? <CalendarDays /> : <UserCog />}
      />

      <motion.div
        className="sa-shell"
      >
        <div className="sa-top">
          <div className="sa-tabs" role="tablist">
            {(
              [
                ['attendance', 'Staff Attendance', UserCog] as const,
                ['leaves', 'Staff Leaves', FileText] as const,
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mainTab === id}
                className={`sa-tab ${mainTab === id ? 'is-active' : ''}`}
                onClick={() => setMainTab(id)}
              >
                {mainTab === id ? (
                  <motion.span
                    layoutId="staff-att-tab-pill"
                    className="sa-tab-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="sa-tab-inner">
                  <Icon size={15} strokeWidth={2.1} />
                  {label}
                </span>
              </button>
            ))}
          </div>

          {mainTab === 'attendance' ? (
            <div className="sa-toolbar sa-top-actions">
              <Link
                href="/reports"
                className="ui-btn ui-btn-outline sa-ghost-btn sa-tool-btn"
              >
                <FileText size={15} /> Reports
              </Link>
              <button
                type="button"
                className="ui-btn ui-btn-outline sa-ghost-btn sa-tool-btn"
                onClick={() => setQrOpen(true)}
              >
                <QrCode size={15} /> Attendance QR
              </button>
              <div className="sa-view-toggle" role="group" aria-label="View mode" data-view={view}>
                <span className="sa-view-pill" aria-hidden />
                <button
                  type="button"
                  className={view === 'daily' ? 'is-active' : ''}
                  onClick={() => setView('daily')}
                >
                  DAILY
                </button>
                <button
                  type="button"
                  className={view === 'monthly' ? 'is-active' : ''}
                  onClick={() => setView('monthly')}
                >
                  MONTHLY
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {mainTab === 'leaves' ? (
            <motion.div
              key="leaves"
              className="sa-panel"
              exit={{ opacity: 0, y: -8 }}
            >
              <StaffLeavesPanel onToast={setToast} />
            </motion.div>
          ) : (
            <motion.div
              key={`att-${view}`}
              className="sa-panel"
              exit={{ opacity: 0, y: -8 }}
            >
              {view === 'daily' ? (
                <>
                  <div className="sa-filters">
                    <DayDatePicker value={dateKey} onChange={setDateKey} />
                    <AppSelect
                      value={room}
                      onChange={setRoom}
                      options={roomFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                    <AppSelect
                      value={group}
                      onChange={setGroup}
                      options={groupFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                    <AppSelect
                      value={role}
                      onChange={setRole}
                      options={roleFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                  </div>

                  {stats.absent > 0 ? (
                    <div className="sa-off-banner">
                      <span>
                        {stats.absent} staff member{stats.absent === 1 ? '' : 's'}{' '}
                        {stats.absent === 1 ? 'is' : 'are'} off today
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('absent');
                          setPage(1);
                          setSelected(new Set());
                        }}
                      >
                        View More
                      </button>
                    </div>
                  ) : null}

                  <div className="sa-stats">
                    {(
                      [
                        { id: 'all' as const, label: 'All Staff', value: stats.all, tone: 'all', icon: <Users size={18} /> },
                        { id: 'pending' as const, label: 'Pending', value: stats.pending, tone: 'pending', icon: <AlertTriangle size={18} /> },
                        { id: 'checked-in' as const, label: 'Check in', value: stats.checkedIn, tone: 'in', icon: <LogIn size={18} /> },
                        { id: 'checked-out' as const, label: 'Check Out', value: stats.checkedOut, tone: 'out', icon: <LogOut size={18} /> },
                        { id: 'absent' as const, label: 'Absent', value: stats.absent, tone: 'absent', icon: <XCircle size={18} /> },
                      ] as const
                    ).map((c, i) => (
                      <motion.button
                        key={c.tone}
                        type="button"
                        className={`sa-stat sa-stat-${c.tone}${statusFilter === c.id ? ' is-active' : ''}`}
                        onClick={() => {
                          setStatusFilter(c.id);
                          setPage(1);
                          setSelected(new Set());
                        }}
                        whileHover={{ y: -3 }}
                      >
                        <span className="sa-stat-ico">{c.icon}</span>
                        <div>
                          <strong>{c.value}</strong>
                          <em>{c.label}</em>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="sa-toolbar">
                    <div className="sa-search">
                      <Search size={15} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name"
                      />
                    </div>
                    <div className="sa-bulk">
                      <button type="button" className="sa-action sa-action-in" onClick={() => openRecord('check-in', selectedStaff())}>
                        <LogIn size={14} /> Check In
                      </button>
                      <button type="button" className="sa-action sa-action-out" onClick={() => openRecord('check-out', selectedStaff())}>
                        <LogOut size={14} /> Check Out
                      </button>
                      <button type="button" className="sa-action sa-action-abs" onClick={() => openAbsent(selectedStaff())}>
                        <X size={14} /> Mark Absent
                      </button>
                      <button type="button" className="sa-action sa-action-reset" onClick={resetFilters}>
                        <RotateCcw size={14} /> Reset
                      </button>
                    </div>
                  </div>

                  <div className="sa-table-card">
                    <DailyTable
                      staffMembers={pageRows}
                      dateKey={dateKey}
                      selected={selected}
                      allFilteredCount={filtered.length}
                      onToggle={toggleSelect}
                      onToggleAll={() => {
                        if (selected.size === filtered.length) setSelected(new Set());
                        else setSelected(new Set(filtered.map((s) => s.id)));
                      }}
                      onCheckIn={(s) => openRecord('check-in', [s])}
                      onCheckOut={(s) => openRecord('check-out', [s])}
                      onEdit={openEdit}
                    />
                    <ProfileTablePagination
                      page={Math.min(page, totalPages)}
                      pageSize={pageSize}
                      totalItems={filtered.length}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sa-filters sa-filters-monthly">
                    <MonthPicker
                      value={{
                        year: Number(monthYm.split('-')[0]),
                        month: Number(monthYm.split('-')[1]) - 1,
                      }}
                      onChange={({ year, month }) =>
                        setMonthYm(`${year}-${String(month + 1).padStart(2, '0')}`)
                      }
                    />
                    <div className="sa-search">
                      <Search size={15} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name"
                      />
                    </div>
                    <AppSelect
                      value={room}
                      onChange={setRoom}
                      options={roomFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                    <AppSelect
                      value={group}
                      onChange={setGroup}
                      options={groupFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                    <AppSelect
                      value={role}
                      onChange={setRole}
                      options={roleFilterOptions}
                      className="sa-filter-dd"
                      triggerClassName="sa-filter-trigger"
                    />
                    <button type="button" className="ui-btn ui-btn-outline" onClick={downloadMonthlyPdf}>
                      <Download size={15} /> Download PDF
                    </button>
                  </div>
                  <div className="sa-table-card">
                    <MonthlyTable staffMembers={pageRows} monthYm={monthYm} />
                    <ProfileTablePagination
                      page={Math.min(page, totalPages)}
                      pageSize={pageSize}
                      totalItems={filtered.length}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Record Attendance — per-person carousel when multi-select */}
      <Modal
        open={recordOpen}
        title={recordMode === 'check-in' ? 'Record Check-in' : 'Record Check-out'}
        subtitle={
          isMultiRecord
            ? `Staff ${recordIndex + 1} of ${recordTargets.length}`
            : activeRecordStaff
              ? activeRecordStaff.name
              : undefined
        }
        icon={
          recordMode === 'check-in' ? (
            <LogIn size={18} strokeWidth={2} />
          ) : (
            <LogOut size={18} strokeWidth={2} />
          )
        }
        className="sa-record-modal"
        onClose={() => setRecordOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setRecordOpen(false)}>
              Cancel
            </button>
            {isMultiRecord ? (
              <button
                type="button"
                className="ui-btn ui-btn-secondary"
                onClick={goRecordPrev}
                disabled={recordIndex === 0}
              >
                <ChevronLeft size={16} strokeWidth={2.25} />
                Back
              </button>
            ) : null}
            <button type="button" className="ui-btn ui-btn-primary" onClick={goRecordNextOrSubmit}>
              {recordStepLabel}
              {!isLastRecordStep ? <ChevronRight size={16} strokeWidth={2.25} /> : null}
            </button>
          </>
        }
      >
        <div className="sa-record-carousel">
          {isMultiRecord ? (
            <div className="sa-record-progress" aria-hidden>
              {recordTargets.map((s, i) => (
                <span
                  key={s.id}
                  className={[
                    'sa-record-dot',
                    i === recordIndex ? 'is-active' : '',
                    i < recordIndex ? 'is-done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {i < recordIndex ? <Check size={10} strokeWidth={3} /> : null}
                </span>
              ))}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {activeRecordStaff ? (
              <motion.div
                key={activeRecordStaff.id}
                className="sa-record-step"
                initial={{ opacity: 0, x: 28, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="sa-record-student">
                  <span className={`sa-avatar sa-record-avatar ${avatarTone(activeRecordStaff.name)}`}>
                    {studentInitials(activeRecordStaff.name)}
                  </span>
                  <div className="sa-record-student-meta">
                    <strong>{activeRecordStaff.name}</strong>
                    <span>
                      {staffPrimaryRoom(activeRecordStaff)}
                      {isMultiRecord ? ` · Step ${recordIndex + 1}/${recordTargets.length}` : ''}
                    </span>
                  </div>
                  {recordMode === 'check-in' ? (
                    <span className="sa-record-chip sa-record-chip-in">
                      <Thermometer size={13} strokeWidth={2.25} />
                      Individual temp
                    </span>
                  ) : (
                    <span className="sa-record-chip sa-record-chip-out">
                      <Sparkles size={13} strokeWidth={2.25} />
                      Check-out
                    </span>
                  )}
                </div>

                <div className="sa-time-row">
                  <div className="ui-field" style={{ flex: 1 }}>
                    <label className="ui-label">
                      {recordMode === 'check-in' ? 'Check-in time' : 'Check-out time'}
                    </label>
                    <Time12Fields
                      hour={hour}
                      minute={minute}
                      ampm={ampm}
                      onHour={setHour}
                      onMinute={setMinute}
                      onAmpm={setAmpm}
                    />
                  </div>
                  <label className="sa-check sa-late">
                    <input type="checkbox" checked={late} onChange={(e) => setLate(e.target.checked)} />
                    {recordMode === 'check-in' ? 'Mark late check-in' : 'Late Check-out'}
                  </label>
                </div>
                <div className="ui-field">
                  <label className="ui-label">Notes</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder="Enter notes for this staff member"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                {recordMode === 'check-in' ? (
                  <div className="ui-field sa-record-temp-field">
                    <label className="ui-label">Temperature (°C)</label>
                    <div className="sa-temp">
                      <input
                        className="ui-input"
                        placeholder="e.g. 36.5"
                        inputMode="decimal"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                      />
                      <span>°C</span>
                    </div>
                  </div>
                ) : null}
                <div className="ui-field">
                  <label className="ui-label">Notify staff</label>
                  <AppMultiSelect
                    searchable
                    searchPlaceholder="Search staff"
                    placeholder="Select staff"
                    values={notifyStaff}
                    onChange={setNotifyStaff}
                    options={notifyStaffOptions}
                  />
                </div>
                <label className="sa-check">
                  <input
                    type="checkbox"
                    checked={notifyTeam}
                    onChange={(e) => setNotifyTeam(e.target.checked)}
                  />
                  Notify other staff
                </label>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Mark Absent — per-person carousel when multi-select */}
      <Modal
        open={absentOpen}
        title="Mark Absent"
        subtitle={
          isMultiAbsent
            ? `Staff ${absentIndex + 1} of ${absentTargets.length}`
            : activeAbsentStaff
              ? activeAbsentStaff.name
              : undefined
        }
        icon={<XCircle size={18} strokeWidth={2} />}
        className="sa-record-modal sa-absent-modal"
        onClose={() => setAbsentOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAbsentOpen(false)}>
              Cancel
            </button>
            {isMultiAbsent ? (
              <button
                type="button"
                className="ui-btn ui-btn-secondary"
                onClick={goAbsentPrev}
                disabled={absentIndex === 0}
              >
                <ChevronLeft size={16} strokeWidth={2.25} />
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={goAbsentNextOrSubmit}
              disabled={!absentType}
            >
              {absentStepLabel}
              {!isLastAbsentStep ? <ChevronRight size={16} strokeWidth={2.25} /> : null}
            </button>
          </>
        }
      >
        <div className="sa-record-carousel">
          {isMultiAbsent ? (
            <div className="sa-record-progress" aria-hidden>
              {absentTargets.map((s, i) => (
                <span
                  key={s.id}
                  className={[
                    'sa-record-dot',
                    i === absentIndex ? 'is-active' : '',
                    i < absentIndex ? 'is-done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {i < absentIndex ? <Check size={10} strokeWidth={3} /> : null}
                </span>
              ))}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {activeAbsentStaff ? (
              <motion.div
                key={activeAbsentStaff.id}
                className="sa-record-step"
                initial={{ opacity: 0, x: 28, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="sa-record-student sa-record-student-abs">
                  <span className={`sa-avatar sa-record-avatar ${avatarTone(activeAbsentStaff.name)}`}>
                    {studentInitials(activeAbsentStaff.name)}
                  </span>
                  <div className="sa-record-student-meta">
                    <strong>{activeAbsentStaff.name}</strong>
                    <span>
                      {staffPrimaryRoom(activeAbsentStaff)}
                      {isMultiAbsent ? ` · Step ${absentIndex + 1}/${absentTargets.length}` : ''}
                    </span>
                  </div>
                  <span className="sa-record-chip sa-record-chip-abs">
                    <AlertTriangle size={13} strokeWidth={2.25} />
                    Individual reason
                  </span>
                </div>

                <div className="ui-field">
                  <label className="ui-label">Type</label>
                  <AppSelect
                    searchable
                    searchPlaceholder="Search type"
                    value={absentType}
                    onChange={setAbsentType}
                    options={absentOptions}
                    placeholder="Select type"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Note</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder="Describe the request for this staff member"
                    value={absentNote}
                    onChange={(e) => setAbsentNote(e.target.value)}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Edit Attendance */}
      <Modal
        open={editOpen}
        title="Edit Attendance"
        wide
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveEditModal}>
              Save
            </button>
          </>
        }
      >
        {editStaff ? (
          <div className="sa-edit">
            <div className="sa-edit-head">
              <span className={`sa-avatar ${avatarTone(editStaff.name)}`}>
                {studentInitials(editStaff.name)}
              </span>
              <strong>{editStaff.name}</strong>
              <em>
                <CalendarDays size={14} /> {formatAttDate(dateKey)}
              </em>
            </div>
            {editRecord ? (
              <div className="sa-edit-grid">
                <div>
                  <span>Check In</span>
                  <div className="sa-edit-val">
                    <Time12Fields
                      hour={editInHour}
                      minute={editInMinute}
                      ampm={editInAmpm}
                      onHour={setEditInHour}
                      onMinute={setEditInMinute}
                      onAmpm={setEditInAmpm}
                    />
                    <label className="sa-check">
                      <input
                        type="checkbox"
                        checked={editInLate}
                        onChange={(e) => setEditInLate(e.target.checked)}
                      />
                      Late
                    </label>
                  </div>
                </div>
                <div>
                  <span>Check Out</span>
                  <div className="sa-edit-val">
                    <Time12Fields
                      hour={editOutHour}
                      minute={editOutMinute}
                      ampm={editOutAmpm}
                      onHour={setEditOutHour}
                      onMinute={setEditOutMinute}
                      onAmpm={setEditOutAmpm}
                    />
                    <label className="sa-check">
                      <input
                        type="checkbox"
                        checked={editOutLate}
                        onChange={(e) => setEditOutLate(e.target.checked)}
                      />
                      Late
                    </label>
                  </div>
                </div>
                <button type="button" className="sa-edit-del" onClick={deleteEditEntry} aria-label="Delete entry">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <p className="sa-hint">No attendance recorded for this day.</p>
            )}
          </div>
        ) : null}
      </Modal>

      {/* QR Modal */}
      <Modal
        open={qrOpen}
        title="Scan or download QR"
        onClose={() => setQrOpen(false)}
        footer={
          <button type="button" className="ui-btn ui-btn-primary sa-qr-download" onClick={downloadQr}>
            DOWNLOAD
          </button>
        }
      >
        <div className="sa-qr-card" ref={qrCardRef}>
          <div className="sa-qr-brand">
            <span className="sa-qr-logo" />
            <strong>Panacea ChildCare · Daycare</strong>
          </div>
          <div className="sa-qr-frame">
            <span className="c tl" />
            <span className="c tr" />
            <span className="c bl" />
            <span className="c br" />
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Attendance QR code" />
            ) : (
              <div className="sa-qr-loading">Generating…</div>
            )}
          </div>
          <p className="sa-qr-cta">Scan the QR Code to Check-In</p>
          <ol className="sa-qr-steps">
            <li>Open the app on your phone.</li>
            <li>Scan the QR Code using your app scan option.</li>
            <li>Align the QR Code within the scanner frame.</li>
            <li>Wait for the scanner to capture the code.</li>
          </ol>
          <p className="sa-hint">Note: Ensure your phone has an active internet connection.</p>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Sub views ─────────────────────────────────────────── */

function TimeStampCell({
  iso,
  by,
  temperature,
  notes,
}: {
  iso?: string;
  by?: string;
  temperature?: string;
  notes?: string;
  tone?: 'in' | 'out';
}) {
  if (!iso) return <span className="sa-dash">—</span>;
  return (
    <div className="sa-cell-stack">
      <strong>{formatTimeDisplay(iso)}</strong>
      <span className="sa-by-row">
        {by ? <em>By {by}</em> : null}
        <span className="sa-mini-icons">
          {temperature ? (
            <span className="sa-tip" data-tip={`${temperature}°C`}>
              <Thermometer size={13} />
            </span>
          ) : null}
          {notes ? (
            <span className="sa-tip" data-tip={notes}>
              <FileText size={13} />
            </span>
          ) : null}
        </span>
      </span>
    </div>
  );
}

function DailyTable({
  staffMembers,
  dateKey,
  selected,
  allFilteredCount,
  onToggle,
  onToggleAll,
  onCheckIn,
  onCheckOut,
  onEdit,
}: {
  staffMembers: StaffAttendee[];
  dateKey: string;
  selected: Set<string>;
  allFilteredCount: number;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onCheckIn: (s: StaffAttendee) => void;
  onCheckOut: (s: StaffAttendee) => void;
  onEdit: (s: StaffAttendee) => void;
}) {
  return (
    <div className="cm-table-wrap sa-table-wrap">
      <table className="ui-table cm-tab-table sa-table">
        <thead>
          <tr>
            <th className="sa-check-col">
              <input
                type="checkbox"
                checked={allFilteredCount > 0 && selected.size === allFilteredCount}
                onChange={onToggleAll}
                aria-label="Select all"
              />
            </th>
            <th>Name</th>
            <th>Room</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Marked Absent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffMembers.length === 0 ? (
            <tr>
              <td colSpan={7} className="sa-empty">
                No staff found
              </td>
            </tr>
          ) : (
            staffMembers.map((s, i) => {
              const rec = getStaffDayRecord(s, dateKey);
              const room = staffPrimaryRoom(s, rec?.room);
              const hasCheckIn = Boolean(rec?.checkIn);
              const isAbsent = Boolean(rec?.markedAbsent);
              const showEditMenu = hasCheckIn && !isAbsent;
              return (
                <tr
                  key={s.id}
                  className={selected.has(s.id) ? 'is-selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => onToggle(s.id)}
                      aria-label={`Select ${s.name}`}
                    />
                  </td>
                  <td>
                    <div className="sa-name">
                      <span className={`sa-avatar ${avatarTone(s.name)}`}>{studentInitials(s.name)}</span>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td>{room}</td>
                  <td>
                    <TimeStampCell
                      iso={rec?.checkIn}
                      by={rec?.checkInBy}
                      temperature={rec?.temperature}
                      notes={rec?.notes}
                    />
                  </td>
                  <td>
                    <TimeStampCell
                      iso={rec?.checkOut}
                      by={rec?.checkOutBy}
                      temperature={rec?.checkOut ? rec?.temperature : undefined}
                      notes={rec?.checkOut ? rec?.notes : undefined}
                    />
                  </td>
                  <td>
                    {isAbsent ? (
                      <div className="sa-absent-cell">
                        {rec?.absentType ? <em>{rec.absentType}</em> : null}
                        <span className="sa-absent-pill">Absent</span>
                        {rec?.absentNote ? (
                          <span className="sa-tip" data-tip={rec.absentNote}>
                            <FileText size={13} />
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="sa-dash">—</span>
                    )}
                  </td>
                  <td>
                    <div className="sa-row-actions">
                      <button type="button" className="sa-action sa-action-in" onClick={() => onCheckIn(s)}>
                        <LogIn size={13} /> Check In
                      </button>
                      <button type="button" className="sa-action sa-action-out" onClick={() => onCheckOut(s)}>
                        <LogOut size={13} /> Check Out
                      </button>
                      {showEditMenu ? (
                        <AppMenu
                          align="end"
                          minWidth={160}
                          items={[
                            {
                              id: 'edit',
                              label: 'Edit',
                              icon: <Edit3 size={14} />,
                              onSelect: () => onEdit(s),
                            },
                          ]}
                          trigger={({ buttonProps }) => (
                            <button type="button" className="sa-icon-btn" aria-label="Edit attendance" {...buttonProps}>
                              <MoreVertical size={16} />
                            </button>
                          )}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyTable({ staffMembers, monthYm }: { staffMembers: StaffAttendee[]; monthYm: string }) {
  return (
    <div className="cm-table-wrap sa-table-wrap">
      <table className="ui-table cm-tab-table sa-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Leave</th>
            <th>Present Percentage</th>
          </tr>
        </thead>
        <tbody>
          {staffMembers.map((s, i) => {
            const m = monthlyStatsForStaff(s, monthYm);
            const room = staffPrimaryRoom(s);
            return (
              <tr
                key={s.id}
              >
                <td>
                  <div className="sa-name">
                    <span className={`sa-avatar ${avatarTone(s.name)}`}>{studentInitials(s.name)}</span>
                    <div>
                      <strong>{s.name}</strong>
                      <em className="sa-sub">{room}</em>
                    </div>
                  </div>
                </td>
                <td>{m.present}</td>
                <td>{m.absent}</td>
                <td>{m.leave}</td>
                <td>
                  <span className={`sa-pct ${m.percentage >= 80 ? 'is-good' : m.percentage > 0 ? 'is-mid' : ''}`}>
                    {m.percentage}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

