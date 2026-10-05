'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MOCK_STUDENTS } from '@/lib/mock/mockStudents';
import { loadScales, loadSettings } from '@/components/modules/learning-assessment/manage/store';
import type { StudentAssessment, AssessmentScore } from '@/types/assessment';

type Props = {
  open: boolean;
  editing: StudentAssessment | null;
  students: typeof MOCK_STUDENTS;
  defaultArea: string;
  onClose: () => void;
  onSave: (item: StudentAssessment, isEdit: boolean) => void;
};

const AREAS = [
  'Language',
  'Mathematics',
  'Motor Skills',
  'Social-Emotional',
  'Cognitive',
  'Practical Life',
  'Sensorial',
  'Cultural Studies',
];

export function AssessmentModal({ open, editing, students, defaultArea, onClose, onSave }: Props) {
  const [studentId, setStudentId] = useState('');
  const [area, setArea] = useState(defaultArea);
  const [score, setScore] = useState<AssessmentScore>('Developing');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const student = useMemo(() => students.find((s) => s.id === studentId), [students, studentId]);

  // Score levels come from the default scoring scale configured in Manage,
  // falling back to the standard 4-level set.
  const scoreOptions = useMemo(() => {
    const scales = loadScales();
    const settings = loadSettings();
    const scale = scales.find((s) => s.id === settings.defaultScaleId) ?? scales[1];
    const levels = scale?.levels?.filter(Boolean) ?? [];
    return levels.length >= 2
      ? levels
      : ['Emerging', 'Developing', 'Proficient', 'Mastered'];
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setStudentId(editing.studentId);
      setArea(editing.area);
      setScore(editing.score);
      setDate(editing.date);
      setNotes(editing.notes ?? '');
    } else {
      setStudentId('');
      setArea(defaultArea);
      setScore((scoreOptions[1] ?? 'Developing') as AssessmentScore);
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, defaultArea]);

  const handleSave = () => {
    if (!studentId) {
      setError('Please select a student.');
      return;
    }
    if (!area) {
      setError('Please select a learning area.');
      return;
    }
    onSave(
      {
        id: editing?.id ?? `as-${Date.now()}`,
        studentId,
        studentName: student?.name ?? '',
        roomId: editing?.roomId ?? `room-${(students.findIndex((s) => s.id === studentId) % 4) + 1}`,
        roomName: student?.room ?? 'Unassigned',
        area,
        score,
        date,
        notes: notes.trim() || undefined,
        updatedBy: 'Center Administrator',
      },
      Boolean(editing),
    );
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit assessment' : 'Add assessment'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
            {editing ? 'Save changes' : 'Add assessment'}
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label">Student</label>
        <select className="ui-input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Select student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.room}
            </option>
          ))}
        </select>
      </div>

      <div className="ui-field">
        <label className="ui-label">Learning area</label>
        <select className="ui-input" value={area} onChange={(e) => setArea(e.target.value)}>
          {AREAS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="ui-field">
        <label className="ui-label">Score</label>
        <select className="ui-input" value={score} onChange={(e) => setScore(e.target.value as AssessmentScore)}>
          {scoreOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="ui-field">
        <label className="ui-label">Date</label>
        <input type="date" className="ui-input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="ui-field">
        <label className="ui-label">Notes (optional)</label>
        <textarea
          className="ui-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Observation notes…"
        />
      </div>

      {error ? <p className="ui-field-error">{error}</p> : null}
    </Modal>
  );
}
