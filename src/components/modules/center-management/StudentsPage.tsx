'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  List,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  UserRound,
  UserX,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { PageLoader } from '@/components/ui/loading';
import type { ParentRole, Student, StudentParent, StudentStatus } from '@/lib/center-management/types';
import {
  listOverdueVaccineDoses,
  normalizeVaccines,
  vaccinationStatusDisplay,
} from '@/lib/center-management/vaccineUtils';
import {
  GROUP_OPTIONS,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  STUDENT_STATUSES,
  GENDER_OPTIONS,
  createSibling,
  createStudent,
  groupNames,
  initials,
  loadStudents,
  openStudentInNewPage,
  pin,
  programNames,
  roomName,
  saveStudents,
  statusBadgeTone,
  subscribeStudentEnrollments,
  todayLabel,
} from '@/lib/center-management/studentsStore';
import { AddSiblingModal } from './AddSiblingModal';
import { AddParentModal } from './AddParentModal';
import { StudentSelectPanel } from './StudentSelectPanel';
import { StudentKioskQrModal } from './StudentKioskQrModal';
import {
  AppMenu,
  AppPopover,
  AppSelect,
  AppTooltip,
  StatusBadge,
  StatusCard,
  TableActionMenu,
} from './ui';
import { useCenterScope } from '@/components/organization/CenterScopeContext';
import { getCenterName } from '@/lib/organization/centers';
import { filterByCenterScope } from '@/lib/organization/scopeFilter';
import { defaultCenterIdForNewRecord } from '@/lib/organization/migrateCenterIds';
import './students.css';
import './student-list-actions.css';

type ViewMode = 'program' | 'health';
type SortKey = 'name' | 'status' | 'programs' | 'upcoming' | 'groups' | 'rooms';
type Toast = { type: 'ok' | 'err'; message: string } | null;
type ActionFlow = null | 'qr';

const STATUS_META: { id: StudentStatus; icon: ReactNode; tone: string }[] = [
  { id: 'Active', icon: <UserRound />, tone: 'mint' },
  { id: 'Inactive', icon: <UserX />, tone: 'blush' },
  { id: 'On Hold', icon: <Clock3 />, tone: 'lavender' },
  { id: 'Withdrawn', icon: <RotateCcw />, tone: 'amber' },
  { id: 'Signed up', icon: <CheckCircle2 />, tone: 'coral' },
  { id: 'Transferred', icon: <ArrowLeftRight />, tone: 'sky' },
  { id: 'Graduated', icon: <GraduationCap />, tone: 'indigo' },
];

function avatarTone(name: string) {
  const n = name.charCodeAt(0) % 4;
  return n === 0 ? '' : `tone-${n + 1}`;
}

function SortHeader({
  label,
  active,
  onClick,
  tip,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tip: string;
}) {
  return (
    <th className="sortable" onClick={onClick}>
      <AppTooltip content={tip} side="bottom">
        <span className="cm-th-inner">
          {label}
          <span className="cm-th-sort" style={{ opacity: active ? 1 : undefined }}>
            <ArrowDownUp size={13} />
          </span>
        </span>
      </AppTooltip>
    </th>
  );
}

export function StudentsPage() {
  const router = useRouter();
  const { activeScope, isAllCenters } = useCenterScope();
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('Active');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('program');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'delete' | 'status'>('delete');
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: StudentStatus } | null>(
    null,
  );
  const [vaccinePop, setVaccinePop] = useState<string | null>(null);
  const [siblingPop, setSiblingPop] = useState<string | null>(null);
  const [siblingModalFor, setSiblingModalFor] = useState<Student | null>(null);
  const [parentModal, setParentModal] = useState<{
    open: boolean;
    studentId: string | null;
    role: ParentRole;
    initial: StudentParent | null;
  }>({
    open: false,
    studentId: null,
    role: 'Father',
    initial: null,
  });
  const [toast, setToast] = useState<Toast>(null);
  const [actionFlow, setActionFlow] = useState<ActionFlow>(null);
  const [qrStudents, setQrStudents] = useState<Student[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const onSaveParentModal = (
    parentData: Omit<StudentParent, 'id'> & { id?: string; applySiblingIds?: string[] },
  ) => {
    if (!parentModal.studentId) return;
    const targetStudentId = parentModal.studentId;
    const applyIds = new Set([targetStudentId, ...(parentData.applySiblingIds || [])]);

    const nextParent: StudentParent = {
      id: parentData.id ?? `p-${Date.now()}`,
      name: parentData.name,
      role: parentData.role,
      phone: parentData.phone,
      email: parentData.email,
      company: parentData.company,
      allowPickup: parentData.allowPickup,
      kioskPin: parentData.kioskPin ?? pin(),
      photoUrl: parentData.photoUrl,
    };

    const updatedStudents = students.map((s) => {
      if (!applyIds.has(s.id)) return s;
      const existingParents = s.parents || [];
      const filtered = existingParents.filter((p) => p.role !== parentData.role);
      return {
        ...s,
        parents: [...filtered, nextParent],
      };
    });

    setStudents(updatedStudents);
    saveStudents(updatedStudents);
    setParentModal({ open: false, studentId: null, role: 'Father', initial: null });
    setToast({
      type: 'ok',
      message: `${parentData.role} details saved${applyIds.size > 1 ? ' (applied to siblings)' : ''}`,
    });
  };
  const [form, setForm] = useState({
    name: '',
    preferredName: '',
    gender: '' as '' | (typeof GENDER_OPTIONS)[number],
    status: 'Active' as StudentStatus,
    admissionDate: todayLabel(),
    roomId: '',
    setAsToday: true,
  });

  useEffect(() => {
    setStudents(loadStudents());
    setReady(true);
    // Clear any stuck scroll-lock from prior overlays/modals
    document.body.style.overflow = '';
    document.documentElement.classList.remove('ui-overlay-open');
    document.body.classList.remove('ui-overlay-open');
    return subscribeStudentEnrollments(() => setStudents(loadStudents()));
  }, []);

  useEffect(() => {
    if (!ready || students.length === 0) return;
    saveStudents(students);
  }, [students, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const scopedStudents = useMemo(
    () => filterByCenterScope(students, activeScope),
    [students, activeScope],
  );

  const counts = useMemo(() => {
    const map = Object.fromEntries(STUDENT_STATUSES.map((s) => [s, 0])) as Record<
      StudentStatus,
      number
    >;
    scopedStudents.forEach((s) => {
      map[s.status] += 1;
    });
    return map;
  }, [scopedStudents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = scopedStudents.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (roomFilter !== 'all' && !s.roomIds.includes(roomFilter)) return false;
      if (groupFilter !== 'all' && !s.groupIds.includes(groupFilter)) return false;
      if (programFilter !== 'all' && !s.programIds.includes(programFilter)) return false;
      if (!q) return true;
      const parentHay = s.parents.map((p) => p.name).join(' ');
      const centerHay = getCenterName(s.centerId ?? '');
      return (
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        parentHay.toLowerCase().includes(q) ||
        centerHay.toLowerCase().includes(q)
      );
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const val = (s: Student) => {
        switch (sortKey) {
          case 'status':
            return s.status;
          case 'programs':
            return programNames(s.programIds);
          case 'upcoming':
            return programNames(s.upcomingProgramIds);
          case 'groups':
            return groupNames(s.groupIds);
          case 'rooms':
            return s.roomIds.map(roomName).join(', ');
          default:
            return s.name;
        }
      };
      return val(a).localeCompare(val(b)) * dir;
    });
    return rows;
  }, [
    scopedStudents,
    statusFilter,
    roomFilter,
    groupFilter,
    programFilter,
    search,
    sortKey,
    sortDir,
  ]);

  useEffect(() => {
    setPage(1);
  }, [activeScope]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, roomFilter, groupFilter, programFilter, search, pageSize]);

  useEffect(() => {
    if (!highlightId) return;
    const index = filtered.findIndex((s) => s.id === highlightId);
    if (index >= 0) {
      const nextPage = Math.floor(index / pageSize) + 1;
      if (nextPage !== page) setPage(nextPage);
    }
    const t = window.setTimeout(() => setHighlightId(null), 4000);
    return () => window.clearTimeout(t);
  }, [highlightId, filtered, pageSize, page]);

  useEffect(() => {
    if (!highlightId) return;
    const row = document.querySelector(`[data-student-id="${highlightId}"]`);
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlightId, page]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortTip = (key: SortKey) =>
    sortKey === key && sortDir === 'asc' ? 'Click to sort descending' : 'Click to sort ascending';

  const toggleSelectAll = () => {
    if (pageRows.every((r) => selected.includes(r.id))) {
      setSelected((prev) => prev.filter((id) => !pageRows.some((r) => r.id === id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageRows.map((r) => r.id)])]);
    }
  };

  const openAdd = () => {
    setForm({
      name: '',
      preferredName: '',
      gender: '',
      status: 'Active',
      admissionDate: todayLabel(),
      roomId: '',
      setAsToday: true,
    });
    setAddOpen(true);
  };

  const saveStudent = () => {
    if (!form.name.trim()) {
      setToast({ type: 'err', message: 'Enter student name' });
      return;
    }
    if (!form.gender) {
      setToast({ type: 'err', message: 'Select gender' });
      return;
    }
    if (!form.roomId) {
      setToast({ type: 'err', message: 'Select a room' });
      return;
    }
    const next = createStudent({
      name: form.name,
      preferredName: form.preferredName,
      gender: form.gender,
      status: form.status,
      admissionDate: form.setAsToday ? todayLabel() : form.admissionDate,
      roomId: form.roomId,
      centerId: defaultCenterIdForNewRecord(activeScope),
    });
    setStudents(loadStudents());
    setAddOpen(false);
    setRoomFilter('all');
    setGroupFilter('all');
    setProgramFilter('all');
    setSearch('');
    setStatusFilter(next.status);
    setHighlightId(next.id);
    setToast({ type: 'ok', message: 'Student added' });
  };

  const requestStatusChange = (id: string, status: StudentStatus) => {
    setPendingStatus({ id, status });
    setConfirmMode('status');
    setConfirmOpen(true);
  };

  const confirmAction = () => {
    if (confirmMode === 'delete') {
      setStudents((prev) => prev.filter((s) => !selected.includes(s.id)));
      setSelected([]);
      setToast({ type: 'ok', message: 'Students removed' });
    } else if (pendingStatus) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== pendingStatus.id) return s;
          return {
            ...s,
            status: pendingStatus.status,
            deactivatedOn:
              pendingStatus.status === 'Inactive' ? todayLabel() : s.deactivatedOn,
          };
        }),
      );
      setToast({ type: 'ok', message: 'Status updated' });
      setPendingStatus(null);
    }
    setConfirmOpen(false);
  };

  if (!ready) {
    return <PageLoader context="students" />;
  }

  const roomOptions = [
    { value: 'all', label: 'All Rooms' },
    ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
  ];
  const groupOptions = [
    { value: 'all', label: 'All Groups' },
    ...GROUP_OPTIONS.map((g) => ({ value: g.id, label: g.name })),
  ];
  const programOptions = [
    { value: 'all', label: 'All Programs' },
    ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="cm-page cm-page--students">
      <CenterManagementPageHeader
        title="Students"
        description="Manage and organize all student records."
        icon={<GraduationCap />}
        actions={
          <>
            <AppMenu
              align="end"
              minWidth={280}
              maxHeight={420}
              menuClassName="cm-actions-menu"
              title="Quick actions"
              items={[
                {
                  id: 'student-list',
                  label: 'Student List',
                  icon: <List size={16} />,
                  hint: 'Export selected roster',
                  tone: 'list',
                  onSelect: () =>
                    router.push('/reports?open=si-students'),
                },
                {
                  id: 'allergy',
                  label: 'Student Allergy Data',
                  icon: <ShieldAlert size={16} />,
                  hint: 'Health view + report',
                  tone: 'health',
                  onSelect: () =>
                    router.push('/reports?open=si-allergy'),
                },
                {
                  id: 'qr',
                  label: 'Student QR Code',
                  icon: <QrCode size={16} />,
                  hint: 'Kiosk check-in cards',
                  tone: 'qr',
                  onSelect: () => setActionFlow('qr'),
                },
                {
                  id: 'bulk',
                  label: 'Bulk Onboarding',
                  icon: <Users size={16} />,
                  hint: 'CSV import wizard',
                  tone: 'bulk',
                  onSelect: () => router.push('/center-management/students/bulk'),
                },
              ]}
              trigger={({ open, buttonProps }) => (
                <button
                  type="button"
                  className={`ui-btn ui-btn-outline cm-actions-trigger${open ? ' is-open' : ''}`}
                  {...buttonProps}
                >
                  Actions{' '}
                  <span
                    className={`cm-actions-chevron${open ? ' is-open' : ''}`}
                    aria-hidden
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>
              )}
            />
            <motion.button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={openAdd}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> Add Student
            </motion.button>
          </>
        }
      />

      <AnimatePresence mode="wait">
        {actionFlow ? (
          <motion.div
            key={actionFlow}
            className="sla-flow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22 }}
          >
            <div className="sla-flow-head">
              <button type="button" className="sla-back" onClick={() => setActionFlow(null)}>
                <ArrowLeft size={16} strokeWidth={2.25} aria-hidden />
                <span>Students</span>
              </button>
            </div>
            <StudentSelectPanel
              students={scopedStudents}
              title="Student Kiosk Generator"
              subtitle="Select students to generate printable QR cards for check-in."
              submitLabel="Continue to QR Codes"
              onCancel={() => setActionFlow(null)}
              onSubmit={(picked) => {
                setQrStudents(picked);
                setQrOpen(true);
                setActionFlow(null);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!actionFlow ? (
        <>
      <div className="cm-filters">
        <AppSelect
          value={roomFilter}
          onChange={setRoomFilter}
          options={roomOptions}
          searchable
          searchPlaceholder="Search rooms..."
        />
        <AppSelect
          value={groupFilter}
          onChange={setGroupFilter}
          options={groupOptions}
          searchable
          searchPlaceholder="Search groups..."
        />
        <AppSelect
          value={programFilter}
          onChange={setProgramFilter}
          options={programOptions}
          searchable
          searchPlaceholder="Search programs..."
        />
      </div>

      <div className="cm-status-row">
        {STATUS_META.map((meta, i) => (
          <StatusCard
            key={meta.id}
            index={i}
            label={meta.id}
            count={counts[meta.id]}
            icon={meta.icon}
            tone={meta.tone}
            active={statusFilter === meta.id}
            onClick={() => setStatusFilter(meta.id)}
          />
        ))}
      </div>

      <div className="cm-panel">
        <div className="cm-toolbar">
          <div className="cm-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone number"
            />
          </div>
          <div className="cm-toolbar-right">
            <div className="cm-view-toggle" role="tablist" aria-label="Table view">
              <button
                type="button"
                className={view === 'program' ? 'is-active' : ''}
                onClick={() => setView('program')}
              >
                Program
              </button>
              <button
                type="button"
                className={view === 'health' ? 'is-active' : ''}
                onClick={() => setView('health')}
              >
                Health
              </button>
            </div>
            <button
              type="button"
              className="cm-icon-btn"
              title="Delete selected"
              disabled={!selected.length}
              onClick={() => {
                if (!selected.length) return;
                setConfirmMode('delete');
                setConfirmOpen(true);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>
                  <input
                    className="cm-check"
                    type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id))}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                <SortHeader
                  label="Student Name"
                  active={sortKey === 'name'}
                  onClick={() => toggleSort('name')}
                  tip={sortTip('name')}
                />
                {isAllCenters ? <th>Center</th> : null}
                <SortHeader
                  label="Status"
                  active={sortKey === 'status'}
                  onClick={() => toggleSort('status')}
                  tip={sortTip('status')}
                />
                <th>Parents</th>
                {view === 'program' ? (
                  <>
                    <SortHeader
                      label="Programs"
                      active={sortKey === 'programs'}
                      onClick={() => toggleSort('programs')}
                      tip={sortTip('programs')}
                    />
                    <SortHeader
                      label="Upcoming Program"
                      active={sortKey === 'upcoming'}
                      onClick={() => toggleSort('upcoming')}
                      tip={sortTip('upcoming')}
                    />
                    <SortHeader
                      label="Groups"
                      active={sortKey === 'groups'}
                      onClick={() => toggleSort('groups')}
                      tip={sortTip('groups')}
                    />
                    <SortHeader
                      label="Rooms"
                      active={sortKey === 'rooms'}
                      onClick={() => toggleSort('rooms')}
                      tip={sortTip('rooms')}
                    />
                  </>
                ) : (
                  <>
                    <th>Allergy</th>
                    <th>Medication</th>
                    <th>Vaccination Status</th>
                    <th>Overdue Vaccine</th>
                  </>
                )}
                <th style={{ width: 52 }} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', height: 120 }}>
                    <span className="cm-muted">No students match your filters.</span>
                  </td>
                </tr>
              ) : (
                pageRows.map((s) => {
                  const fatherMissing = !s.parents.some((p) => p.role === 'Father');
                  const vaccines = s.dob ? normalizeVaccines(s.vaccines) : [];
                  const overdue = listOverdueVaccineDoses(vaccines);
                  const vaxStatus = s.dob ? vaccinationStatusDisplay(vaccines) : null;
                  return (
                    <tr
                      key={s.id}
                      data-student-id={s.id}
                      className={highlightId === s.id ? 'is-just-added' : undefined}
                    >
                      <td>
                        <input
                          className="cm-check"
                          type="checkbox"
                          checked={selected.includes(s.id)}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(s.id)
                                ? prev.filter((x) => x !== s.id)
                                : [...prev, s.id],
                            )
                          }
                          aria-label={`Select ${s.name}`}
                        />
                      </td>
                      <td>
                        <div className="cm-student-cell">
                          <span className={`cm-avatar ${avatarTone(s.name)}`}>
                            {initials(s.name)}
                          </span>
                          <div className="cm-student-meta">
                            <div className="cm-name-row">
                              <button
                                type="button"
                                onClick={() => router.push(`/center-management/students/${s.id}`)}
                              >
                                {s.name}
                              </button>
                              {s.siblingIds.length ? (
                                <AppPopover
                                  open={siblingPop === s.id}
                                  onOpenChange={(v) => setSiblingPop(v ? s.id : null)}
                                  align="start"
                                  minWidth={260}
                                  trigger={
                                    <button
                                      type="button"
                                      className="cm-sib-pop-btn"
                                      onClick={() =>
                                        setSiblingPop(siblingPop === s.id ? null : s.id)
                                      }
                                    >
                                      <Users size={12} /> {s.siblingIds.length}
                                    </button>
                                  }
                                >
                                  <div className="cm-sib-pop-list">
                                    <strong className="cm-sib-pop-title">
                                      Sibling Information
                                    </strong>
                                    {students
                                      .filter((x) => s.siblingIds.includes(x.id))
                                      .map((sib) => (
                                        <button
                                          key={sib.id}
                                          type="button"
                                          className="cm-sib-pop-item"
                                          onClick={() => {
                                            setSiblingPop(null);
                                            openStudentInNewPage(sib.id);
                                          }}
                                        >
                                          <span className={`cm-avatar ${avatarTone(sib.name)}`}>
                                            {initials(sib.name)}
                                          </span>
                                          <span className="cm-sib-pop-info">
                                            <span className="cm-sib-pop-name-row">
                                              <strong>{sib.name}</strong>
                                              <span className="cm-mini-badge">Student</span>
                                            </span>
                                            <span className="cm-sib-pop-status">{sib.status}</span>
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                </AppPopover>
                              ) : null}
                            </div>
                            <span>{s.ageLabel}</span>
                            {s.deactivatedOn && s.status === 'Inactive' ? (
                              <span className="cm-deactivated">
                                <AlertCircle size={12} /> Student deactivated on {s.deactivatedOn}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      {isAllCenters ? (
                        <td>
                          <span className="cm-muted">{getCenterName(s.centerId ?? '')}</span>
                        </td>
                      ) : null}
                      <td>
                        <AppMenu
                          align="start"
                          minWidth={200}
                          items={STUDENT_STATUSES.map((st) => ({
                            id: st,
                            label: st,
                            icon: <span className={`cm-status-dot ${statusBadgeTone(st)}`} />,
                            onSelect: () => requestStatusChange(s.id, st),
                          }))}
                          trigger={({ open, buttonProps }) => (
                            <StatusBadge status={s.status} open={open} {...buttonProps} />
                          )}
                        />
                      </td>
                      <td>
                        <div className="cm-parents">
                          {(() => {
                            const mother = s.parents?.find((p) => p.role === 'Mother');
                            const father = s.parents?.find((p) => p.role === 'Father');
                            const otherParents = s.parents?.filter((p) => p.role !== 'Mother' && p.role !== 'Father') || [];

                            return (
                              <>
                                {mother ? (
                                  <button
                                    type="button"
                                    className="cm-parent-link"
                                    title="Click to view/edit Mother details"
                                    onClick={() =>
                                      setParentModal({ open: true, studentId: s.id, role: 'Mother', initial: mother })
                                    }
                                  >
                                    {mother.name}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="cm-parent-link cm-add-parent-link"
                                    onClick={() =>
                                      setParentModal({ open: true, studentId: s.id, role: 'Mother', initial: null })
                                    }
                                  >
                                    Add Mother
                                  </button>
                                )}

                                {father ? (
                                  <button
                                    type="button"
                                    className="cm-parent-link"
                                    title="Click to view/edit Father details"
                                    onClick={() =>
                                      setParentModal({ open: true, studentId: s.id, role: 'Father', initial: father })
                                    }
                                  >
                                    {father.name}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="cm-parent-link cm-add-parent-link"
                                    onClick={() =>
                                      setParentModal({ open: true, studentId: s.id, role: 'Father', initial: null })
                                    }
                                  >
                                    Add Father
                                  </button>
                                )}

                                {otherParents.map((p) => (
                                  <button
                                    type="button"
                                    key={p.id}
                                    className="cm-parent-link"
                                    title={`Click to view/edit ${p.role} details`}
                                    onClick={() =>
                                      setParentModal({ open: true, studentId: s.id, role: p.role, initial: p })
                                    }
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      {view === 'program' ? (
                        <>
                          <td>{programNames(s.programIds)}</td>
                          <td>{programNames(s.upcomingProgramIds)}</td>
                          <td>{groupNames(s.groupIds)}</td>
                          <td>{s.roomIds.map(roomName).join(', ') || '—'}</td>
                        </>
                      ) : (
                        <>
                          <td>
                            {s.allergies.length
                              ? s.allergies.map((a) => a.name).join(', ')
                              : '—'}
                          </td>
                          <td>{s.medication || '—'}</td>
                          <td>
                            {!s.dob ? (
                              <span className="cm-vax-missing">Date of birth missing</span>
                            ) : vaxStatus ? (
                              <div className="cm-vax-status">
                                <strong>{vaxStatus.label}</strong>
                                <span>{vaxStatus.date}</span>
                              </div>
                            ) : (
                              <span className="cm-muted">—</span>
                            )}
                          </td>
                          <td className={overdue.length ? 'cm-overdue-cell' : undefined}>
                            {overdue.length ? (
                              <AppPopover
                                open={vaccinePop === s.id}
                                onOpenChange={(v) => setVaccinePop(v ? s.id : null)}
                                align="end"
                                minWidth={280}
                                maxHeight={320}
                                className="cm-vax-pop-anchor"
                                trigger={
                                  <div className="cm-overdue">
                                    <span className="cm-overdue-ico" aria-hidden>
                                      <AlertCircle size={14} strokeWidth={2.4} />
                                    </span>
                                    <div className="cm-overdue-stack">
                                      <span className="cm-overdue-name">{overdue[0].label}</span>
                                      {overdue.length > 1 ? (
                                        <button
                                          type="button"
                                          className="cm-overdue-more"
                                          aria-expanded={vaccinePop === s.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setVaccinePop(vaccinePop === s.id ? null : s.id);
                                          }}
                                        >
                                          +{overdue.length - 1} more
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                }
                              >
                                <div className="cm-vax-pop">
                                  <div className="cm-vax-pop-head">Overdue vaccines</div>
                                  <div className="cm-vax-pop-list">
                                    {overdue.map((v) => (
                                      <div key={v.key} className="cm-pop-item cm-vax-pop-item">
                                        <span className="cm-overdue-ico is-sm" aria-hidden>
                                          <AlertCircle size={13} strokeWidth={2.4} />
                                        </span>
                                        <div>
                                          <strong>{v.label}</strong>
                                          <span>{v.date}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AppPopover>
                            ) : (
                              <span className="cm-muted">—</span>
                            )}
                          </td>
                        </>
                      )}
                      <td>
                        <TableActionMenu
                          onEdit={() => router.push(`/center-management/students/${s.id}`)}
                          onAddSibling={() => setSiblingModalFor(s)}
                          onDelete={() => {
                            setSelected([s.id]);
                            setConfirmMode('delete');
                            setConfirmOpen(true);
                          }}
                          extra={[
                            {
                              id: 'profile',
                              label: 'Open profile',
                              icon: <UserRound size={15} />,
                              onSelect: () =>
                                router.push(`/center-management/students/${s.id}`),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="cm-footer">
          <div className="cm-footer-meta">
            Showing{' '}
            {filtered.length === 0
              ? '0-0'
              : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)}`}{' '}
            of {filtered.length} results
          </div>
          <div className="cm-pager">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </button>
            <button type="button" className="is-active">
              {page}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
          <div className="cm-page-size">
            <AppSelect
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              options={[
                { value: '10', label: '10 / page' },
                { value: '30', label: '30 / page' },
                { value: '50', label: '50 / page' },
              ]}
              align="end"
            />
          </div>
        </div>
      </div>
        </>
      ) : null}

      <StudentKioskQrModal
        open={qrOpen}
        students={qrStudents}
        onClose={() => {
          setQrOpen(false);
          setQrStudents([]);
        }}
      />

      <Modal
        open={addOpen}
        title="Add Student"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveStudent}>
              Save
            </button>
          </>
        }
      >
        <div className="cm-modal-form">
          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label">
                Student Name <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter student name"
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Preferred Name</label>
              <input
                className="ui-input"
                value={form.preferredName}
                onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
                placeholder="Preferred name"
              />
            </div>
          </div>
          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label">
                Gender <span className="req">*</span>
              </label>
              <AppSelect
                value={form.gender}
                onChange={(v) => setForm({ ...form, gender: v as typeof form.gender })}
                placeholder="Select gender"
                searchable
                searchPlaceholder="Search gender..."
                options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Status <span className="req">*</span>
              </label>
              <AppSelect
                value={form.status}
                onChange={(v) => setForm({ ...form, status: v as StudentStatus })}
                options={STUDENT_STATUSES.map((st) => ({
                  value: st,
                  label: st,
                  icon: <span className={`cm-status-dot ${statusBadgeTone(st)}`} />,
                }))}
              />
            </div>
          </div>
          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label">Admission Date</label>
              <input
                className="ui-input"
                value={form.admissionDate}
                onChange={(e) =>
                  setForm({ ...form, admissionDate: e.target.value, setAsToday: false })
                }
                placeholder="DD/MM/YYYY"
              />
              <label className="cm-today">
                <input
                  className="cm-check"
                  type="checkbox"
                  checked={form.setAsToday}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      setAsToday: e.target.checked,
                      admissionDate: e.target.checked ? todayLabel() : form.admissionDate,
                    })
                  }
                />
                Set as Today
              </label>
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Select Room <span className="req">*</span>
              </label>
              <AppSelect
                value={form.roomId}
                onChange={(v) => setForm({ ...form, roomId: v })}
                placeholder="Select Room"
                searchable
                searchPlaceholder="Search rooms..."
                options={ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        title="Are you sure ?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setConfirmOpen(false)}
            >
              No
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={confirmAction}>
              Yes
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Confirm to Submit
          {confirmMode === 'delete'
            ? ` — remove ${selected.length} student${selected.length === 1 ? '' : 's'}.`
            : pendingStatus
              ? ` — change status to ${pendingStatus.status}.`
              : '.'}
        </p>
      </Modal>

      <AddSiblingModal
        open={Boolean(siblingModalFor)}
        source={siblingModalFor}
        onClose={() => setSiblingModalFor(null)}
        onSave={(payload) => {
          if (!siblingModalFor) return;
          const { sibling, updatedParentsShared } = createSibling(
            siblingModalFor,
            payload,
            students,
          );
          setStudents([...updatedParentsShared, sibling]);
          setSiblingModalFor(null);
          setToast({ type: 'ok', message: 'Sibling added' });
        }}
      />

      <AddParentModal
        open={parentModal.open}
        role={parentModal.role}
        initial={parentModal.initial}
        siblings={
          parentModal.studentId
            ? students
                .filter((x) =>
                  students.find((s) => s.id === parentModal.studentId)?.siblingIds?.includes(x.id),
                )
                .map((s) => ({ id: s.id, name: s.name }))
            : []
        }
        onClose={() => setParentModal({ open: false, studentId: null, role: 'Father', initial: null })}
        onSave={onSaveParentModal}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`cm-toast ${toast.type}`}
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {toast.type === 'ok' ? (
              <CheckCircle2 size={18} color="#1f9d6a" />
            ) : (
              <AlertCircle size={18} color="#d64561" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
