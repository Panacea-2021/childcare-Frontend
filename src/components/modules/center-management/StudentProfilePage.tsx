'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  Copy,
  Heart,
  IdCard,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Shield,
  Trash2,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PersonalFilesPanel } from '@/components/modules/view-profile/PersonalFilesPanel';
import type {
  AllergyRecord,
  AuthorizedPickup,
  EmergencyContact,
  ParentRole,
  Student,
  StudentParent,
  StudentStatus,
} from '@/lib/center-management/types';
import {
  GENDER_OPTIONS,
  GROUP_OPTIONS,
  ROOM_OPTIONS,
  STUDENT_STATUSES,
  createSibling,
  initials,
  loadStudents,
  openStudentInNewPage,
  pin,
  programNames,
  roomName,
  saveStudents,
  severityTone,
  statusBadgeTone,
  subscribeStudentEnrollments,
} from '@/lib/center-management/studentsStore';
import { AddAllergyModal } from './AddAllergyModal';
import { AddEmergencyModal } from './AddEmergencyModal';
import { AddParentModal } from './AddParentModal';
import { AddPickupModal } from './AddPickupModal';
import { AddSiblingModal } from './AddSiblingModal';
import { InviteParentsModal } from './InviteParentsModal';
import { MessageParentsFlow } from './message-parents/MessageParentsFlow';
import { readImageAsDataUrl } from './photoUpload';
import { StudentQrModal } from './StudentQrModal';
import {
  AttendanceTab,
  FormsTab,
  GalleryTab,
  NotesTab,
  PlaceholderTab,
  ProgramsTab,
} from './StudentProfileTabs';
import { StudentActionsMenu } from './StudentActionsMenu';
import { AppMenu, AppPopover, AppSelect, AppTooltip, StatusBadge } from './ui';
import { PageLoader } from '@/components/ui/loading';
import './students.css';

const tabLoading = () => <PageLoader context="students" inset />;

const BillingTab = dynamic(
  () => import('./BillingTab').then((m) => m.BillingTab),
  { ssr: false, loading: tabLoading },
);
const ImmunizationTab = dynamic(
  () => import('./ImmunizationTab').then((m) => m.ImmunizationTab),
  { ssr: false, loading: tabLoading },
);
const ProgressTab = dynamic(
  () => import('./ProgressTab').then((m) => m.ProgressTab),
  { ssr: false, loading: tabLoading },
);
const TimelineTab = dynamic(
  () => import('./TimelineTab').then((m) => m.TimelineTab),
  { ssr: false, loading: tabLoading },
);

function ageFromDob(dob?: string): string {
  if (!dob) return '';
  const parts = dob.split(/[/-]/).map((p) => Number(p));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const [d, m, y] = parts[0] > 31 ? [parts[2], parts[1], parts[0]] : [parts[0], parts[1], parts[2]];
  const birth = new Date(y, m - 1, d);
  if (Number.isNaN(birth.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return '';
  return `${years} year ${months} month`;
}

const TABS = [
  'Profile',
  'Programs',
  'Attendance',
  'Billing',
  'Timeline',
  'Documents',
  'Notes',
  'Forms',
  'Gallery',
  'Immunization',
  'Progress',
] as const;

type Tab = (typeof TABS)[number];
type Props = { studentId: string };

function SectionChrome({
  icon,
  title,
  count,
  open,
  onToggle,
  onEdit,
  onDelete,
  addLabel,
  onAdd,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  addLabel?: string;
  onAdd?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="cm-section">
      <div className="cm-section-head">
        <button type="button" className="cm-section-title-btn" onClick={onToggle}>
          <span className="cm-section-ico">{icon}</span>
          <strong>
            {title}
            {typeof count === 'number' ? <em> {count}</em> : null}
          </strong>
          <ChevronDown
            size={16}
            style={{
              marginLeft: 6,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
        <div className="cm-section-actions">
          {onAdd ? (
            <button type="button" className="ui-btn ui-btn-outline cm-add-btn" onClick={onAdd}>
              <Plus size={14} /> {addLabel}
            </button>
          ) : null}
          {onEdit ? (
            <button type="button" className="cm-icon-btn" title="Edit" onClick={onEdit}>
              <Pencil size={15} />
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" className="cm-icon-btn" title="Delete" onClick={onDelete}>
              <Trash2 size={15} />
            </button>
          ) : null}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="cm-section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function StudentProfilePage({ studentId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Profile');
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthDraft, setHealthDraft] = useState({ bloodGroup: '', medication: '' });
  const [draft, setDraft] = useState<Student | null>(null);
  const [openInfo, setOpenInfo] = useState(true);
  const [openHealth, setOpenHealth] = useState(true);
  const [openEmergency, setOpenEmergency] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyEdit, setEmergencyEdit] = useState<EmergencyContact | null>(null);
  const [openAllergy, setOpenAllergy] = useState(true);
  const [openParents, setOpenParents] = useState(true);
  const [openPickup, setOpenPickup] = useState(true);
  const [openSiblings, setOpenSiblings] = useState(true);
  const [siblingOpen, setSiblingOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [messageParentsOpen, setMessageParentsOpen] = useState(false);
  const [inviteConfirm, setInviteConfirm] = useState<{ open: boolean; parent?: StudentParent }>({
    open: false,
  });
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyEdit, setAllergyEdit] = useState<AllergyRecord | null>(null);
  const [parentModal, setParentModal] = useState<{
    open: boolean;
    role: ParentRole;
    initial?: StudentParent | null;
  }>({ open: false, role: 'Mother' });
  const [pickupOpen, setPickupOpen] = useState(false);
  const [pickupEdit, setPickupEdit] = useState<AuthorizedPickup | null>(null);
  const [siblingPopOpen, setSiblingPopOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    kind: 'student' | 'parent' | 'allergy' | 'emergency' | 'sibling-link' | 'pickup';
    id?: string;
    title: string;
  }>({ open: false, kind: 'student', title: '' });
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  useEffect(() => {
    setStudents(loadStudents());
    setReady(true);
    return subscribeStudentEnrollments(() => setStudents(loadStudents()));
  }, []);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('panacea.postActivity.toast');
      if (msg) {
        sessionStorage.removeItem('panacea.postActivity.toast');
        setToast({ type: 'ok', message: msg });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const raw = searchParams.get('tab');
    if (!raw) return;
    const match = TABS.find((t) => t.toLowerCase() === raw.toLowerCase());
    if (match) setTab(match);
  }, [searchParams]);

  const selectTab = (next: Tab) => {
    setTab(next);
    const qs = new URLSearchParams();
    qs.set('tab', next);
    if (next === 'Billing') {
      const billing = searchParams.get('billing');
      if (billing) qs.set('billing', billing);
    }
    if (next === 'Progress') {
      const progress = searchParams.get('progress');
      if (progress) qs.set('progress', progress);
    }
    router.replace(`/center-management/students/${studentId}?${qs.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!ready) return;
    saveStudents(students);
  }, [students, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const student = useMemo(
    () => students.find((s) => s.id === studentId) ?? null,
    [students, studentId],
  );

  const siblings = useMemo(
    () => (student ? students.filter((s) => student.siblingIds.includes(s.id)) : []),
    [students, student],
  );

  useEffect(() => {
    if (student && !editingInfo) {
      setDraft({
        ...student,
        roomIds: [...student.roomIds],
        parents: student.parents.map((p) => ({ ...p })),
        allergies: student.allergies.map((a) => ({ ...a })),
        siblingIds: [...student.siblingIds],
      });
    }
  }, [student, editingInfo]);

  if (!ready) return <PageLoader context="students" title="Loading student profile…" />;

  if (!student || !draft) {
    return (
      <div className="cm-coming">
        <h1>Student not found</h1>
        <p>This student may have been removed.</p>
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => router.push('/center-management/students')}
        >
          Back to Students
        </button>
      </div>
    );
  }

  const updateStudent = (next: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  };

  const saveInfo = () => {
    if (!draft.name.trim() || !draft.gender || !draft.roomIds.length) return;
    updateStudent({ ...draft });
    setEditingInfo(false);
    setToast({ type: 'ok', message: 'Student details saved' });
  };

  const cancelInfo = () => {
    setDraft({ ...student });
    setEditingInfo(false);
  };

  const guardEdit = () => {
    if (!editingInfo) return false;
    setToast({
      type: 'err',
      message:
        'Student details are currently in edit mode. Please save or cancel your changes before editing other information.',
    });
    return true;
  };

  const onSaveSibling = (payload: Parameters<typeof createSibling>[1]) => {
    const { sibling, updatedParentsShared } = createSibling(student, payload, students);
    setStudents([...updatedParentsShared, sibling]);
    setSiblingOpen(false);
    setToast({ type: 'ok', message: 'Sibling added' });
  };

  const onSaveAllergy = (data: Omit<AllergyRecord, 'id'> & { id?: string }) => {
    const nextAllergy: AllergyRecord = {
      id: data.id ?? `al-${Date.now()}`,
      name: data.name,
      category: data.category,
      severity: data.severity,
      symptoms: data.symptoms,
      parentNotes: data.parentNotes,
      emergencyPlan: data.emergencyPlan,
    };
    const allergies = data.id
      ? student.allergies.map((a) => (a.id === data.id ? nextAllergy : a))
      : [...student.allergies, nextAllergy];
    updateStudent({ ...student, allergies });
    setAllergyOpen(false);
    setAllergyEdit(null);
    setToast({ type: 'ok', message: data.id ? 'Allergy updated' : 'Allergy added' });
  };

  const runDelete = () => {
    const { kind, id } = confirmDelete;
    if (kind === 'student') {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setConfirmDelete({ open: false, kind: 'student', title: '' });
      router.push('/center-management/students');
      return;
    }
    if (kind === 'parent' && id) {
      updateStudent({ ...student, parents: student.parents.filter((p) => p.id !== id) });
      setToast({ type: 'ok', message: 'Parent removed' });
    } else if (kind === 'allergy' && id) {
      updateStudent({ ...student, allergies: student.allergies.filter((a) => a.id !== id) });
      setToast({ type: 'ok', message: 'Allergy removed' });
    } else if (kind === 'emergency' && id) {
      updateStudent({
        ...student,
        emergencyContacts: student.emergencyContacts.filter((e) => e.id !== id),
      });
      setToast({ type: 'ok', message: 'Emergency contact removed' });
    } else if (kind === 'pickup' && id) {
      updateStudent({
        ...student,
        authorizedPickups: (student.authorizedPickups ?? []).filter((p) => p.id !== id),
      });
      setToast({ type: 'ok', message: 'Authorized pickup removed' });
    } else if (kind === 'sibling-link' && id) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === student.id) {
            return { ...s, siblingIds: s.siblingIds.filter((x) => x !== id) };
          }
          if (s.id === id) {
            return { ...s, siblingIds: s.siblingIds.filter((x) => x !== student.id) };
          }
          return s;
        }),
      );
      setToast({ type: 'ok', message: 'Sibling link removed' });
    }
    setConfirmDelete({ open: false, kind: 'student', title: '' });
  };

  const mother = student.parents.find((p) => p.role === 'Mother');
  const father = student.parents.find((p) => p.role === 'Father');
  const ageLabel = ageFromDob(student.dob);

  const onSaveParent = (
    data: Omit<StudentParent, 'id'> & { id?: string; applySiblingIds?: string[] },
  ) => {
    const next: StudentParent = {
      id: data.id ?? `p-${Date.now()}`,
      name: data.name,
      role: data.role,
      phone: data.phone,
      email: data.email,
      company: data.company,
      allowPickup: data.allowPickup,
      kioskPin: data.kioskPin ?? pin(),
      photoUrl: data.photoUrl,
    };

    const applyIds = new Set([student.id, ...(data.applySiblingIds || [])]);

    setStudents((prev) =>
      prev.map((s) => {
        if (!applyIds.has(s.id)) return s;
        const others = (s.parents || []).filter((p) => p.role !== data.role);
        return { ...s, parents: [...others, next] };
      }),
    );

    setParentModal({ open: false, role: 'Mother' });
    setToast({
      type: 'ok',
      message: `${data.role} saved${applyIds.size > 1 ? ' (applied to siblings)' : ''}`,
    });
  };

  const onSavePickup = (data: Omit<AuthorizedPickup, 'id'> & { id?: string }) => {
    const current = student.authorizedPickups ?? [];
    const next: AuthorizedPickup = {
      id: data.id ?? `pk-${Date.now()}`,
      name: data.name,
      relation: data.relation,
      phone: data.phone,
      email: data.email,
      address: data.address,
      photoUrl: data.photoUrl,
    };
    const list = data.id
      ? current.map((p) => (p.id === data.id ? next : p))
      : [...current, next];
    updateStudent({ ...student, authorizedPickups: list });
    setPickupOpen(false);
    setPickupEdit(null);
    setToast({ type: 'ok', message: data.id ? 'Pickup updated' : 'Pickup added' });
  };

  const onSaveEmergency = (data: Omit<EmergencyContact, 'id'> & { id?: string }) => {
    const next: EmergencyContact = {
      id: data.id ?? `ec-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      relation: data.relation,
    };
    const list = data.id
      ? student.emergencyContacts.map((c) => (c.id === data.id ? next : c))
      : [...student.emergencyContacts, next];
    updateStudent({ ...student, emergencyContacts: list });
    setEmergencyOpen(false);
    setEmergencyEdit(null);
    setToast({ type: 'ok', message: data.id ? 'Emergency contact updated' : 'Emergency contact added' });
  };

  const saveHealth = () => {
    updateStudent({
      ...student,
      bloodGroup: healthDraft.bloodGroup.trim(),
      medication: healthDraft.medication.trim(),
    });
    setEditingHealth(false);
    setToast({ type: 'ok', message: 'Health information saved' });
  };

  const refreshPin = (parentId: string) => {
    updateStudent({
      ...student,
      parents: student.parents.map((p) => (p.id === parentId ? { ...p, kioskPin: pin() } : p)),
    });
    setToast({ type: 'ok', message: 'Kiosk PIN refreshed' });
  };

  const copyEmail = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setToast({ type: 'ok', message: 'Email copied' });
    } catch {
      setToast({ type: 'err', message: 'Could not copy email' });
    }
  };

  return (
    <div className="cm-page cm-profile">
      <div className="cm-profile-head">
        <div>
          <div className="cm-crumbs">
            <button type="button" onClick={() => router.push('/center-management/students')}>
              All Students
            </button>
            <span>›</span>
            <strong>Student Profile</strong>
          </div>
          <h1>{student.name}</h1>
        </div>
        <StudentActionsMenu
          student={student}
          onDeleteStudent={() =>
            setConfirmDelete({
              open: true,
              kind: 'student',
              title: `Delete ${student.name}? This cannot be undone.`,
            })
          }
          onToast={(message) => setToast({ type: 'ok', message })}
        />
      </div>

      <div className="cm-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            className={tab === t ? 'is-active' : ''}
            onClick={() => selectTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Programs' ? (
        <ProgramsTab student={student} />
      ) : tab === 'Attendance' ? (
        <AttendanceTab student={student} />
      ) : tab === 'Notes' ? (
        <NotesTab student={student} onUpdate={updateStudent} />
      ) : tab === 'Forms' ? (
        <FormsTab student={student} />
      ) : tab === 'Gallery' ? (
        <GalleryTab student={student} />
      ) : tab === 'Documents' ? (
        <PersonalFilesPanel
          ownerName={student.name}
          storageKey={`student-${student.id}`}
        />
      ) : tab === 'Billing' ? (
        <BillingTab student={student} />
      ) : tab === 'Timeline' ? (
        <TimelineTab student={student} />
      ) : tab === 'Immunization' ? (
        <ImmunizationTab student={student} onUpdate={updateStudent} />
      ) : tab === 'Progress' ? (
        <ProgressTab student={student} ageLabel={ageLabel} />
      ) : tab !== 'Profile' ? (
        <PlaceholderTab title={tab} />
      ) : (
        <>
          <motion.div
            className="cm-hero cm-hero-v2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cm-hero-identity">
              <div className="cm-hero-avatar-wrap">
                <div className="cm-hero-avatar">
                  {student.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.photoUrl} alt="" />
                  ) : (
                    initials(student.name)
                  )}
                </div>
                <button
                  type="button"
                  className="cm-hero-cam"
                  title="Add profile photo"
                  aria-label="Add profile photo"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const photoUrl = await readImageAsDataUrl(file);
                    updateStudent({ ...student, photoUrl });
                    setToast({ type: 'ok', message: 'Profile photo updated' });
                    e.target.value = '';
                  }}
                />
              </div>
              <h2>
                {student.name}
                {student.preferredName ? (
                  <span className="cm-nick"> ({student.preferredName})</span>
                ) : null}
              </h2>
              <StatusBadge status={student.status} showChevron={false} />
            </div>

            <div className="cm-hero-mid">
              <ul className="cm-hero-facts-v2">
                <li>
                  <UserRound size={16} />
                  <span>
                    Gender: <strong>{student.gender || '—'}</strong>
                  </span>
                </li>
                <li>
                  <Calendar size={16} />
                  <span>
                    Date of Birth:{' '}
                    <strong>
                      {student.dob || 'Birth date not found'}
                      {ageLabel ? ` (${ageLabel})` : ''}
                    </strong>
                  </span>
                </li>
                <li>
                  <IdCard size={16} />
                  <span>
                    Admission Number: <strong>{student.admissionNumber || '—'}</strong>
                  </span>
                </li>
                <li>
                  <Building2 size={16} />
                  <span>
                    Room: <strong>{student.roomIds.map(roomName).join(', ') || '—'}</strong>
                  </span>
                </li>
              </ul>
              {siblings.length ? (
                <AppPopover
                  open={siblingPopOpen}
                  onOpenChange={setSiblingPopOpen}
                  align="start"
                  minWidth={260}
                  className="cm-sibling-pop-anchor"
                  trigger={
                    <button
                      type="button"
                      className={`cm-sibling-bar${siblingPopOpen ? ' is-open' : ''}`}
                      onClick={() => setSiblingPopOpen((v) => !v)}
                      aria-expanded={siblingPopOpen}
                    >
                      <Users size={14} />
                      <span>{siblings.length}</span>
                    </button>
                  }
                >
                  <div className="cm-sib-pop-list">
                    <strong className="cm-sib-pop-title">Sibling Information</strong>
                    {siblings.map((sib) => (
                      <button
                        key={sib.id}
                        type="button"
                        className="cm-sib-pop-item"
                        onClick={() => {
                          setSiblingPopOpen(false);
                          openStudentInNewPage(sib.id);
                        }}
                      >
                        <span className="cm-avatar">
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

            <div className="cm-hero-actions">
              <AppTooltip content="Message Parents">
                <button
                  type="button"
                  className="cm-round-btn"
                  aria-label="Message Parents"
                  onClick={() => setMessageParentsOpen(true)}
                >
                  <MessageSquare size={16} />
                </button>
              </AppTooltip>
              <AppTooltip content="QR Code">
                <button
                  type="button"
                  className="cm-round-btn"
                  aria-label="QR code"
                  onClick={() => setQrOpen(true)}
                >
                  <QrCode size={16} />
                </button>
              </AppTooltip>
              <AppTooltip content="Add Sibling">
                <button
                  type="button"
                  className="cm-round-btn"
                  aria-label="Add Sibling"
                  onClick={() => setSiblingOpen(true)}
                >
                  <UserPlus size={16} />
                </button>
              </AppTooltip>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => setInviteOpen(true)}
              >
                <Send size={15} /> Invite Parents
              </button>
            </div>
          </motion.div>

          <section className={`cm-section${editingInfo ? ' is-editing' : ''}`}>
            <div className="cm-section-head">
              <button
                type="button"
                className="cm-section-title-btn"
                onClick={() => setOpenInfo((v) => !v)}
              >
                <span className="cm-section-ico">
                  <UserRound size={15} />
                </span>
                <strong>Student Information</strong>
                <ChevronDown
                  size={16}
                  style={{
                    marginLeft: 6,
                    transform: openInfo ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              <div className="cm-section-actions">
                {editingInfo ? (
                  <>
                    <button type="button" className="ui-btn ui-btn-outline" onClick={cancelInfo}>
                      Cancel
                    </button>
                    <button type="button" className="ui-btn ui-btn-primary" onClick={saveInfo}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="cm-icon-btn"
                      title="Edit"
                      onClick={() => setEditingInfo(true)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="cm-icon-btn"
                      title="Delete"
                      onClick={() =>
                        setConfirmDelete({
                          open: true,
                          kind: 'student',
                          title: `Delete student ${student.name}?`,
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {openInfo ? (
              <div className="cm-section-body">
                <div className="ui-grid-2">
                  <div className="ui-field">
                    <label className="ui-label">
                      Name <span className="req">*</span>
                    </label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Preferred Name</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.preferredName}
                      onChange={(e) => setDraft({ ...draft, preferredName: e.target.value })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">DOB</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.dob}
                      onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">
                      Gender <span className="req">*</span>
                    </label>
                    <AppSelect
                      disabled={!editingInfo}
                      value={draft.gender}
                      onChange={(v) => setDraft({ ...draft, gender: v as Student['gender'] })}
                      options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Status</label>
                    <AppSelect
                      disabled={!editingInfo}
                      value={draft.status}
                      onChange={(v) => setDraft({ ...draft, status: v as StudentStatus })}
                      options={STUDENT_STATUSES.map((st) => ({
                        value: st,
                        label: st,
                        icon: <span className={`cm-status-dot ${statusBadgeTone(st)}`} />,
                      }))}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Registration Date</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.registrationDate}
                      onChange={(e) => setDraft({ ...draft, registrationDate: e.target.value })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Admission Number</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.admissionNumber}
                      onChange={(e) => setDraft({ ...draft, admissionNumber: e.target.value })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Admission Date</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.admissionDate}
                      onChange={(e) => setDraft({ ...draft, admissionDate: e.target.value })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Groups</label>
                    <AppSelect
                      disabled={!editingInfo}
                      value={draft.groupIds[0] ?? ''}
                      onChange={(v) => setDraft({ ...draft, groupIds: v ? [v] : [] })}
                      placeholder="—"
                      options={[
                        { value: '', label: '—' },
                        ...GROUP_OPTIONS.map((g) => ({ value: g.id, label: g.name })),
                      ]}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">
                      Room <span className="req">*</span>
                    </label>
                    {editingInfo ? (
                      <AppSelect
                        value={draft.roomIds[0] ?? ''}
                        onChange={(v) => setDraft({ ...draft, roomIds: v ? [v] : [] })}
                        options={ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name }))}
                      />
                    ) : (
                      <div className="cm-chip-row">
                        {draft.roomIds.length ? (
                          draft.roomIds.map((id) => (
                            <span key={id} className="cm-chip">
                              {roomName(id)}
                            </span>
                          ))
                        ) : (
                          <span className="cm-muted">—</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Programs</label>
                    <input
                      className="ui-input"
                      disabled
                      value={
                        draft.programIds.length
                          ? programNames(draft.programIds)
                          : '—'
                      }
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Address</label>
                    <input
                      className="ui-input"
                      disabled={!editingInfo}
                      value={draft.address}
                      onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className={`cm-section${editingHealth ? ' is-editing' : ''}`}>
            <div className="cm-section-head">
              <button
                type="button"
                className="cm-section-title-btn"
                onClick={() => {
                  if (guardEdit()) return;
                  setOpenHealth((v) => !v);
                }}
              >
                <span className="cm-section-ico">
                  <Heart size={15} />
                </span>
                <strong>Health Information</strong>
                <ChevronDown
                  size={16}
                  style={{
                    marginLeft: 6,
                    transform: openHealth ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              <div className="cm-section-actions">
                {editingHealth ? (
                  <>
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => setEditingHealth(false)}
                    >
                      Cancel
                    </button>
                    <button type="button" className="ui-btn ui-btn-primary" onClick={saveHealth}>
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="cm-icon-btn"
                    title="Edit"
                    onClick={() => {
                      if (guardEdit()) return;
                      setHealthDraft({
                        bloodGroup: student.bloodGroup || '',
                        medication: student.medication || '',
                      });
                      setEditingHealth(true);
                      setOpenHealth(true);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </div>
            {openHealth ? (
              <div className="cm-section-body">
                <div className="ui-grid-2">
                  <div className="ui-field">
                    <label className="ui-label">Blood Group</label>
                    <input
                      className="ui-input"
                      disabled={!editingHealth}
                      value={
                        editingHealth
                          ? healthDraft.bloodGroup
                          : student.bloodGroup || '—'
                      }
                      onChange={(e) =>
                        setHealthDraft((d) => ({ ...d, bloodGroup: e.target.value }))
                      }
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Medication</label>
                    <input
                      className="ui-input"
                      disabled={!editingHealth}
                      value={
                        editingHealth
                          ? healthDraft.medication
                          : student.medication || 'No medication on record'
                      }
                      onChange={(e) =>
                        setHealthDraft((d) => ({ ...d, medication: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <SectionChrome
            icon={<Shield size={15} />}
            title="Emergency Information"
            open={openEmergency}
            onToggle={() => {
              if (guardEdit()) return;
              setOpenEmergency((v) => !v);
            }}
            addLabel="Add Emergency Contact"
            onAdd={() => {
              if (guardEdit()) return;
              setEmergencyEdit(null);
              setEmergencyOpen(true);
            }}
          >
            {student.emergencyContacts.length ? (
              <div className="cm-card-grid">
                {student.emergencyContacts.map((c) => (
                  <div key={c.id} className="cm-info-card">
                    <div className="cm-info-card-top">
                      <strong>{c.name}</strong>
                      <AppMenu
                        align="end"
                        minWidth={160}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Pencil size={15} />,
                            onSelect: () => {
                              setEmergencyEdit(c);
                              setEmergencyOpen(true);
                            },
                          },
                          {
                            id: 'del',
                            label: 'Delete',
                            icon: <Trash2 size={15} />,
                            danger: true,
                            onSelect: () =>
                              setConfirmDelete({
                                open: true,
                                kind: 'emergency',
                                id: c.id,
                                title: `Delete ${c.name}?`,
                              }),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button type="button" className="cm-row-action" {...buttonProps}>
                            ⋮
                          </button>
                        )}
                      />
                    </div>
                    <div className="cm-kv">
                      <span>Phone</span>
                      <strong>{c.phone}</strong>
                      <span>Relation</span>
                      <strong>{c.relation}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cm-empty-msg">
                No emergency contacts added. Emergency contacts are required for student safety.
              </p>
            )}
          </SectionChrome>

          <SectionChrome
            icon={<TriangleAlert size={15} />}
            title="Allergy Information"
            open={openAllergy}
            onToggle={() => {
              if (guardEdit()) return;
              setOpenAllergy((v) => !v);
            }}
            addLabel="Add Allergy"
            onAdd={() => {
              if (guardEdit()) return;
              setAllergyEdit(null);
              setAllergyOpen(true);
            }}
          >
            {student.allergies.length ? (
              <div className="cm-card-grid">
                {student.allergies.map((a, idx) => (
                  <div key={a.id} className="cm-allergy-card">
                    <div className="cm-allergy-top">
                      <div>
                        <div className="cm-allergy-title">
                          <i className="cm-dot" />
                          <strong>{a.name}</strong>
                          <span>{a.category}</span>
                        </div>
                        <span className={`cm-sev cm-sev-${severityTone(a.severity)}`}>
                          {a.severity}
                        </span>
                      </div>
                      <AppMenu
                        align="end"
                        minWidth={160}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Pencil size={15} />,
                            onSelect: () => {
                              setAllergyEdit(a);
                              setAllergyOpen(true);
                            },
                          },
                          {
                            id: 'del',
                            label: 'Delete',
                            icon: <Trash2 size={15} />,
                            danger: true,
                            onSelect: () =>
                              setConfirmDelete({
                                open: true,
                                kind: 'allergy',
                                id: a.id,
                                title: `Delete allergy ${a.name}?`,
                              }),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button type="button" className="cm-row-action" {...buttonProps}>
                            ⋮
                          </button>
                        )}
                      />
                    </div>
                    <div className="cm-allergy-body">
                      <span>Symptoms</span>
                      <strong>{a.symptoms || '—'}</strong>
                    </div>
                    <div className="cm-allergy-label">Allergy Information {idx + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cm-empty-msg">No allergies added.</p>
            )}
          </SectionChrome>

          <SectionChrome
            icon={<Users size={15} />}
            title="Parents"
            count={student.parents.length}
            open={openParents}
            onToggle={() => {
              if (guardEdit()) return;
              setOpenParents((v) => !v);
            }}
          >
            <div className="cm-parents-grid">
              {([
                { role: 'Mother' as const, parent: mother },
                { role: 'Father' as const, parent: father },
              ]).map(({ role, parent: p }) =>
                p ? (
                  <div key={p.id} className="cm-parent-card">
                    <div className="cm-parent-head">
                      <div className="cm-parent-id">
                        <div className="cm-parent-avatar">
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photoUrl} alt="" />
                          ) : (
                            initials(p.name)
                          )}
                          <button
                            type="button"
                            className="cm-parent-cam"
                            title="Profile photo"
                            onClick={() => setParentModal({ open: true, role, initial: p })}
                          >
                            <Camera size={11} />
                          </button>
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <button
                            type="button"
                            className="cm-pin-btn"
                            onClick={() => refreshPin(p.id)}
                          >
                            Kiosk PIN : {p.kioskPin || '—'} <RefreshCw size={12} />
                          </button>
                        </div>
                      </div>
                      <AppMenu
                        align="end"
                        minWidth={180}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Pencil size={15} />,
                            onSelect: () => setParentModal({ open: true, role, initial: p }),
                          },
                          {
                            id: 'del',
                            label: 'Delete',
                            icon: <Trash2 size={15} />,
                            danger: true,
                            onSelect: () =>
                              setConfirmDelete({
                                open: true,
                                kind: 'parent',
                                id: p.id,
                                title: `Delete parent ${p.name}?`,
                              }),
                          },
                          {
                            id: 'invite',
                            label: 'Send Invite',
                            icon: <Send size={15} />,
                            onSelect: () => setInviteConfirm({ open: true, parent: p }),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button type="button" className="cm-row-action" {...buttonProps}>
                            ⋮
                          </button>
                        )}
                      />
                    </div>
                    <div className="cm-kv">
                      <span>Name</span>
                      <strong>{p.name}</strong>
                      <span>Phone</span>
                      <strong>{p.phone || '—'}</strong>
                      <span>Email</span>
                      <strong className="cm-email-val">
                        {p.email || '—'}
                        {p.email ? (
                          <>
                            <button
                              type="button"
                              className="cm-mini-ico"
                              title="Mail"
                              onClick={() => setInviteConfirm({ open: true, parent: p })}
                            >
                              <Mail size={13} />
                            </button>
                            <button
                              type="button"
                              className="cm-mini-ico"
                              title="Copy"
                              onClick={() => copyEmail(p.email)}
                            >
                              <Copy size={13} />
                            </button>
                          </>
                        ) : null}
                      </strong>
                      <span>Company Name</span>
                      <strong>{p.company || '—'}</strong>
                      <span>Allow child pickup</span>
                      <strong>{p.allowPickup === false ? 'no' : 'yes'}</strong>
                      <span>Children</span>
                      <strong>
                        {[student.name, ...siblings.map((s) => s.name)].join(', ') || '—'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div key={role} className="cm-parent-empty">
                    <strong>{role} Details</strong>
                    <button
                      type="button"
                      className="cm-parent-add"
                      onClick={() => {
                        if (guardEdit()) return;
                        setParentModal({ open: true, role, initial: null });
                      }}
                    >
                      + Click to add {role.toLowerCase()}
                    </button>
                  </div>
                ),
              )}
            </div>
          </SectionChrome>

          <SectionChrome
            icon={<Car size={15} />}
            title="Additional Authorized Pickup"
            open={openPickup}
            onToggle={() => {
              if (guardEdit()) return;
              setOpenPickup((v) => !v);
            }}
            addLabel="Add Pickup"
            onAdd={() => {
              if (guardEdit()) return;
              setPickupEdit(null);
              setPickupOpen(true);
            }}
          >
            {student.authorizedPickups?.length ? (
              <div className="cm-card-grid">
                {student.authorizedPickups.map((pk) => (
                  <div key={pk.id} className="cm-info-card">
                    <div className="cm-info-card-top">
                      <div className="cm-parent-id">
                        <span className="cm-parent-avatar cm-pickup-avatar">
                          {pk.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={pk.photoUrl} alt="" />
                          ) : (
                            initials(pk.name)
                          )}
                        </span>
                        <div>
                          <strong>{pk.name}</strong>
                          <span>{pk.relation}</span>
                        </div>
                      </div>
                      <AppMenu
                        align="end"
                        minWidth={160}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Pencil size={15} />,
                            onSelect: () => {
                              setPickupEdit(pk);
                              setPickupOpen(true);
                            },
                          },
                          {
                            id: 'del',
                            label: 'Delete',
                            icon: <Trash2 size={15} />,
                            danger: true,
                            onSelect: () =>
                              setConfirmDelete({
                                open: true,
                                kind: 'pickup',
                                id: pk.id,
                                title: `Delete pickup ${pk.name}?`,
                              }),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button type="button" className="cm-row-action" {...buttonProps}>
                            ⋮
                          </button>
                        )}
                      />
                    </div>
                    <div className="cm-kv">
                      <span>Phone</span>
                      <strong>{pk.phone || '—'}</strong>
                      <span>Email</span>
                      <strong>{pk.email || '—'}</strong>
                      <span>Address</span>
                      <strong>{pk.address || '—'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cm-empty-msg">No authorised pickup added</p>
            )}
          </SectionChrome>

          <SectionChrome
            icon={<UserPlus size={15} />}
            title="Siblings"
            count={siblings.length}
            open={openSiblings}
            onToggle={() => {
              if (guardEdit()) return;
              setOpenSiblings((v) => !v);
            }}
            addLabel="Add Sibling"
            onAdd={() => {
              if (guardEdit()) return;
              setSiblingOpen(true);
            }}
          >
            {siblings.length ? (
              <div className="cm-card-grid">
                {siblings.map((sib) => (
                  <div key={sib.id} className="cm-sibling-card">
                    <button
                      type="button"
                      className="cm-sibling-open"
                      onClick={() => openStudentInNewPage(sib.id)}
                    >
                      <span className="cm-parent-avatar">{initials(sib.name)}</span>
                      <span>
                        <strong>{sib.name}</strong>
                        <em>
                          <span className="cm-mini-badge">Student</span>{' '}
                          <StatusBadge status={sib.status} showChevron={false} />
                        </em>
                      </span>
                    </button>
                    <AppMenu
                      align="end"
                      minWidth={180}
                      items={[
                        {
                          id: 'open',
                          label: 'Open in new page',
                          icon: <UserRound size={15} />,
                          onSelect: () => openStudentInNewPage(sib.id),
                        },
                        {
                          id: 'del',
                          label: 'Remove link',
                          icon: <Trash2 size={15} />,
                          danger: true,
                          onSelect: () =>
                            setConfirmDelete({
                              open: true,
                              kind: 'sibling-link',
                              id: sib.id,
                              title: `Unlink ${sib.name}?`,
                            }),
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button type="button" className="cm-row-action" {...buttonProps}>
                          ⋮
                        </button>
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="cm-empty-msg">No siblings linked. Use Add Sibling to create one.</p>
            )}
          </SectionChrome>
        </>
      )}

      <AddSiblingModal
        open={siblingOpen}
        source={student}
        onClose={() => setSiblingOpen(false)}
        onSave={onSaveSibling}
      />
      <AddAllergyModal
        open={allergyOpen}
        initial={allergyEdit}
        onClose={() => {
          setAllergyOpen(false);
          setAllergyEdit(null);
        }}
        onSave={onSaveAllergy}
      />
      <InviteParentsModal
        open={inviteOpen}
        parents={student.parents}
        onClose={() => setInviteOpen(false)}
        onSend={() => {
          setInviteOpen(false);
          setToast({ type: 'ok', message: 'Parent invite(s) sent' });
        }}
      />
      <MessageParentsFlow
        open={messageParentsOpen}
        student={student}
        onClose={() => setMessageParentsOpen(false)}
        onToast={(type, message) => setToast({ type, message })}
      />
      <AddParentModal
        open={parentModal.open}
        role={parentModal.role}
        initial={parentModal.initial}
        siblings={siblings.map((s) => ({ id: s.id, name: s.name }))}
        onClose={() => setParentModal({ open: false, role: 'Mother' })}
        onSave={onSaveParent}
      />
      <AddPickupModal
        open={pickupOpen}
        initial={pickupEdit}
        onClose={() => {
          setPickupOpen(false);
          setPickupEdit(null);
        }}
        onSave={onSavePickup}
      />
      <AddEmergencyModal
        open={emergencyOpen}
        initial={emergencyEdit}
        onClose={() => {
          setEmergencyOpen(false);
          setEmergencyEdit(null);
        }}
        onSave={onSaveEmergency}
      />
      <StudentQrModal open={qrOpen} student={student} onClose={() => setQrOpen(false)} />

      <Modal
        open={inviteConfirm.open}
        title="Send invite"
        onClose={() => setInviteConfirm({ open: false })}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setInviteConfirm({ open: false })}
            >
              No
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                setInviteConfirm({ open: false });
                setToast({
                  type: 'ok',
                  message: `Invite sent to ${inviteConfirm.parent?.name ?? 'parent'}`,
                });
              }}
            >
              Yes
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Confirm to send invite</p>
      </Modal>

      <Modal
        open={confirmDelete.open}
        title="Are you sure ?"
        onClose={() => setConfirmDelete({ open: false, kind: 'student', title: '' })}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setConfirmDelete({ open: false, kind: 'student', title: '' })}
            >
              No
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={runDelete}>
              Yes
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{confirmDelete.title}</p>
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`cm-toast ${toast.type}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
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
