'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { AlertCircle, CheckCircle2, IdCard, UserRound } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import { groupNames, initials, loadStudents, roomName, saveStudents } from '@/lib/center-management/studentsStore';
import { PageLoader } from '@/components/ui/loading';
import { useParentStudent } from '../ParentStudentContext';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentPageHeader } from '../shared';
import { ParentProfileActions } from '../profile/ParentProfileActions';
import '@/components/modules/center-management/students.css';
import '@/components/modules/center-management/billing.css';
import '@/components/modules/center-management/immunization.css';
import '@/components/modules/view-profile/personal-files.css';
import '../parent-pages.css';
import '../shared/parent-shared.css';
import '../profile/parent-profile-actions.css';
import '../profile/parent-profile-hero.css';

const tabLoading = () => <PageLoader context="students" inset />;

const ProgramsTab = dynamic(
  () =>
    import('@/components/modules/center-management/StudentProfileTabs').then((m) => m.ProgramsTab),
  { ssr: false, loading: tabLoading },
);
const ImmunizationTab = dynamic(
  () =>
    import('@/components/modules/center-management/ImmunizationTab').then(
      (m) => m.ImmunizationTab,
    ),
  { ssr: false, loading: tabLoading },
);
const ParentProfileTab = dynamic(
  () => import('../profile/ParentProfileTab').then((m) => m.ParentProfileTab),
  { ssr: false, loading: tabLoading },
);
const ParentBillingTab = dynamic(
  () => import('../profile/ParentBillingTab').then((m) => m.ParentBillingTab),
  { ssr: false, loading: tabLoading },
);
const ParentDocumentsTab = dynamic(
  () => import('../profile/ParentDocumentsTab').then((m) => m.ParentDocumentsTab),
  { ssr: false, loading: tabLoading },
);
const ParentGalleryTab = dynamic(
  () => import('../profile/ParentGalleryTab').then((m) => m.ParentGalleryTab),
  { ssr: false, loading: tabLoading },
);
const ParentAttendanceTab = dynamic(
  () => import('../profile/ParentAttendanceTab').then((m) => m.ParentAttendanceTab),
  { ssr: false, loading: tabLoading },
);
const TABS = [
  'Profile',
  'Programs',
  'Attendance',
  'Billing',
  'Documents',
  'Gallery',
  'Immunization',
] as const;
type Tab = (typeof TABS)[number];

function ParentProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready: sessionReady, selectedStudent, refresh, displayName } = useParentStudent();
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Profile');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  useEffect(() => {
    setStudents(loadStudents());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStudents(students);
  }, [students, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const raw = searchParams.get('tab');
    if (!raw) return;
    const match = TABS.find((t) => t.toLowerCase() === raw.toLowerCase());
    if (match) setTab(match);
  }, [searchParams]);

  const studentId = selectedStudent?.id;
  const student = useMemo(
    () => (studentId ? students.find((s) => s.id === studentId) ?? null : null),
    [students, studentId],
  );

  const siblings = useMemo(
    () => (student ? students.filter((s) => student.siblingIds.includes(s.id)) : []),
    [students, student],
  );

  const selectTab = (next: Tab) => {
    setTab(next);
    const qs = new URLSearchParams();
    qs.set('tab', next);
    if (next === 'Billing') {
      const billing = searchParams.get('billing');
      if (billing) qs.set('billing', billing);
    }
    router.replace(`/parent/profile?${qs.toString()}`, { scroll: false });
  };

  const updateStudent = (next: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    refresh();
  };

  if (!sessionReady || !ready) {
    return <PageLoader context="students" title="Loading student profile…" />;
  }

  if (!selectedStudent || !student) {
    return (
      <div className="pp-page">
        <div className="cm-coming">
          <h1>No student selected</h1>
          <p>Select a student from the parent header to view their profile.</p>
        </div>
      </div>
    );
  }

  const room =
    (student.roomIds[0] ? roomName(student.roomIds[0]) : null) ||
    selectedStudent.roomName ||
    '—';
  const group = groupNames(student.groupIds);
  const groupLabel = group === '—' ? selectedStudent.programName || '' : group;
  const avatar = student.photoUrl || selectedStudent.photoUrl;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="cm-page cm-profile pp-profile-page psh-page">
          <ParentPageHeader
            title="Student Profile"
            description="View personal details, attendance, documents and gallery for your child."
            icon={<ParentModuleIcon id="profile" />}
          />

          <m.section
            className="pp-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="pp-hero-shapes" aria-hidden>
              <span />
              <span />
            </div>
            <div className="pp-hero-avatar-wrap">
              <div className="pp-hero-avatar">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" />
                ) : (
                  <span>{initials(student.name)}</span>
                )}
              </div>
            </div>
            <div className="pp-hero-copy">
              <h1 className="pp-hero-name">{student.name}</h1>
              <p className="pp-hero-meta">
                {room}
                {groupLabel ? ` · ${groupLabel}` : ''}
                {student.admissionNumber ? ` · #${student.admissionNumber}` : ''}
              </p>
              <div className="pp-hero-chips">
                {student.ageLabel ? (
                  <span className="pp-hero-chip">
                    <IdCard size={13} aria-hidden />
                    {student.ageLabel}
                  </span>
                ) : null}
                <span className="pp-hero-chip">
                  <UserRound size={13} aria-hidden />
                  Status · {student.status}
                </span>
              </div>
            </div>
          </m.section>

          <div className="pp-profile-tabs-row">
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
            <ParentProfileActions
              parentName={displayName}
              onToast={(type, message) => setToast({ type, message })}
            />
          </div>

          {tab === 'Programs' ? (
            <ProgramsTab student={student} />
          ) : tab === 'Attendance' ? (
            <ParentAttendanceTab student={student} />
          ) : tab === 'Billing' ? (
            <ParentBillingTab student={student} />
          ) : tab === 'Documents' ? (
            <ParentDocumentsTab student={student} />
          ) : tab === 'Gallery' ? (
            <ParentGalleryTab student={student} />
          ) : tab === 'Immunization' ? (
            <ImmunizationTab student={student} onUpdate={updateStudent} />
          ) : (
            <ParentProfileTab
              student={student}
              siblings={siblings}
              onUpdate={updateStudent}
              onToast={(type, message) => setToast({ type, message })}
            />
          )}

          <AnimatePresence>
            {toast ? (
              <m.div
                className={`cm-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {toast.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{toast.message}</span>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

export function ParentProfilePage() {
  return (
    <Suspense fallback={<PageLoader context="students" title="Loading student profile…" />}>
      <ParentProfileInner />
    </Suspense>
  );
}
