'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  loadProfileAssessments,
  saveProfileAssessments,
  upsertProfileAssessment,
} from '@/lib/center-management/profileAssessmentsStore';
import { applyAssessmentToProgress } from '@/lib/center-management/progressStore';
import { loadStudents } from '@/lib/center-management/studentsStore';
import type {
  AssessmentTemplate,
  ProfileAssessment,
  ProfileAssessmentDraft,
} from '@/types/profileAssessment';
import { CreateAssessmentPage } from './CreateAssessmentPage';
import { PageLoader } from '@/components/ui/loading';
import '../progress-records/progress-records.css';
import './create-assessment.css';

function CreateAssessmentScreenInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const studentId = params.id;
  const assessmentId = searchParams.get('assessmentId');

  const student = useMemo(
    () => loadStudents().find((s) => s.id === studentId) ?? null,
    [studentId],
  );

  const [rows, setRows] = useState<ProfileAssessment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRows(loadProfileAssessments());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProfileAssessments(rows);
  }, [rows, ready]);

  const editing = useMemo(
    () => (assessmentId ? rows.find((r) => r.id === assessmentId) ?? null : null),
    [rows, assessmentId],
  );

  const backHref = `/center-management/students/${encodeURIComponent(studentId)}?tab=Progress`;

  const goBack = () => {
    router.push(backHref);
  };

  const onSave = (
    draft: ProfileAssessmentDraft,
    meta: { template: AssessmentTemplate; addAnother: boolean },
  ) => {
    setRows((prev) => {
      const next = upsertProfileAssessment(prev, draft, {
        studentId,
        templateName: meta.template.name,
        scaleId: meta.template.scaleId,
        id: editing?.id,
      });
      const saved = next.find(
        (row) =>
          row.studentId === studentId &&
          row.templateId === draft.templateId &&
          row.updatedAt,
      );
      const latest =
        next
          .filter((row) => row.studentId === studentId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? saved;

      if (latest && draft.status === 'published') {
        applyAssessmentToProgress(studentId, draft.areaLevels, latest.updatedAt);
      }

      return next;
    });

    if (meta.addAnother) {
      router.replace(
        `/center-management/students/${encodeURIComponent(studentId)}/progress/create-assessment`,
      );
      return;
    }
    router.push(backHref);
  };

  if (!student) {
    return (
      <div className="pr-create-screen">
        <div className="pr-empty">
          <strong>Student not found</strong>
          <p>This student may have been removed.</p>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => router.push('/center-management/students')}
          >
            All Students
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <PageLoader context="students" title="Loading assessment…" />;
  }

  if (assessmentId && !editing) {
    return (
      <div className="pr-create-screen">
        <div className="pr-empty">
          <strong>Assessment not found</strong>
          <p>This assessment may have been removed.</p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={goBack}>
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-create-screen ca-screen">
      <CreateAssessmentPage
        key={editing?.id ?? 'new'}
        student={student}
        editing={editing}
        onBack={goBack}
        onSave={onSave}
      />
    </div>
  );
}

export function CreateAssessmentScreen() {
  return (
    <Suspense fallback={<PageLoader context="students" title="Loading assessment…" />}>
      <CreateAssessmentScreenInner />
    </Suspense>
  );
}
