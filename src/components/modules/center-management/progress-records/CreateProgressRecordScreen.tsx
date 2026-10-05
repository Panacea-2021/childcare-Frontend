'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  kindLabel,
  loadProgressRecords,
  saveProgressRecords,
  upsertProgressRecord,
} from '@/lib/center-management/progressRecordsStore';
import { loadStudents } from '@/lib/center-management/studentsStore';
import type { ProgressRecord, ProgressRecordDraft, ProgressRecordKind } from '@/types/progressRecord';
import { CreateProgressRecordPage } from './CreateProgressRecordPage';
import { PageLoader } from '@/components/ui/loading';
import './progress-records.css';

function parseKind(raw: string | null): ProgressRecordKind {
  if (raw === 'reflection' || raw === 'concern' || raw === 'observation') return raw;
  return 'observation';
}

function tabForKind(kind: ProgressRecordKind) {
  if (kind === 'observation') return 'observations';
  if (kind === 'reflection') return 'reflections';
  return 'concerns';
}

function CreateProgressRecordScreenInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const studentId = params.id;

  const kind = parseKind(searchParams.get('kind'));
  const recordId = searchParams.get('recordId');

  const student = useMemo(
    () => loadStudents().find((s) => s.id === studentId) ?? null,
    [studentId],
  );

  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecords(loadProgressRecords());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProgressRecords(records);
  }, [records, ready]);

  const editing = useMemo(
    () => (recordId ? records.find((r) => r.id === recordId) ?? null : null),
    [records, recordId],
  );

  const backHref = () => {
    const qs = new URLSearchParams({
      tab: 'Progress',
      progress: tabForKind(kind),
    });
    return `/center-management/students/${encodeURIComponent(studentId)}?${qs.toString()}`;
  };

  const goBack = () => {
    router.push(backHref());
  };

  const onSave = (draft: ProgressRecordDraft, opts: { addAnother: boolean }) => {
    setRecords((prev) =>
      upsertProgressRecord(prev, draft, {
        id: editing?.id,
      }),
    );
    if (opts.addAnother) {
      const qs = new URLSearchParams({ kind: draft.kind });
      router.replace(
        `/center-management/students/${encodeURIComponent(studentId)}/progress/create?${qs.toString()}`,
      );
      return;
    }
    router.push(backHref());
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
    return <PageLoader context="students" title={`Loading ${kindLabel(kind).toLowerCase()}…`} />;
  }

  if (recordId && !editing) {
    return (
      <div className="pr-create-screen">
        <div className="pr-empty">
          <strong>Record not found</strong>
          <p>This {kindLabel(kind).toLowerCase()} may have been removed.</p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={goBack}>
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-create-screen">
      <CreateProgressRecordPage
        key={editing?.id ?? 'new'}
        kind={kind}
        presetStudentId={student.id}
        editing={editing}
        onBack={goBack}
        onSave={onSave}
        onKindChange={(next) => {
          const qs = new URLSearchParams({ kind: next });
          if (editing?.id) qs.set('recordId', editing.id);
          router.replace(
            `/center-management/students/${encodeURIComponent(studentId)}/progress/create?${qs.toString()}`,
          );
        }}
      />
    </div>
  );
}

export function CreateProgressRecordScreen() {
  return (
    <Suspense fallback={<PageLoader context="students" />}>
      <CreateProgressRecordScreenInner />
    </Suspense>
  );
}
