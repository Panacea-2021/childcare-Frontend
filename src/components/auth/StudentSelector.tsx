'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getParentSession,
  updateParentSelectedStudent,
  type ParentStudentSummary,
} from '@/lib/parent-auth';
import { PARENT_PORTAL_HOME } from '@/lib/parent-modules';
import { AuthShell } from './AuthShell';
import { StudentCard } from './StudentCard';
import { NoStudentsFound } from './NoStudentsFound';

export function StudentSelector() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [students, setStudents] = useState<ParentStudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const session = getParentSession();
    if (!session?.verifiedAt) {
      router.replace('/login');
      return;
    }

    const list = session.students ?? [];

    if (list.length === 1) {
      updateParentSelectedStudent(list[0].id);
      router.replace(PARENT_PORTAL_HOME);
      return;
    }

    if (session.selectedStudentId && list.length > 1) {
      // Already selected — allow re-pick or continue
    }

    setStudents(list);
    setReady(true);
  }, [router]);

  function handleSelect(student: ParentStudentSummary) {
    if (navigating) return;
    setSelectedId(student.id);
    setNavigating(true);
    updateParentSelectedStudent(student.id);
    window.setTimeout(() => {
      router.push(PARENT_PORTAL_HOME);
    }, 480);
  }

  if (!ready) {
    return (
      <AuthShell brandMessage="Finding your students…" wide>
        <div className="auth-loading" aria-busy="true">
          Loading…
        </div>
      </AuthShell>
    );
  }

  if (students.length === 0) {
    return <NoStudentsFound />;
  }

  return (
    <AuthShell
      brandMessage="Choose a student to continue to the Parent Portal."
      wide
      className="auth-select-page"
    >
      <div className="select-student-panel">
        <div className="login-form-header login-anim login-anim-d1">
          <h1 className="login-form-title">Select Student</h1>
          <p className="login-form-subtitle">
            Choose a student to continue to the Parent Portal.
          </p>
        </div>

        <div className="student-grid" role="list">
          {students.map((student, index) => (
            <div
              key={student.id}
              className={`login-anim login-anim-d${Math.min(index + 2, 5)}`}
              role="listitem"
            >
              <StudentCard
                student={student}
                selected={selectedId === student.id}
                faded={Boolean(selectedId) && selectedId !== student.id}
                disabled={navigating}
                onSelect={handleSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
