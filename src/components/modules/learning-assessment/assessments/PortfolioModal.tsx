'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MOCK_STUDENTS } from '@/lib/mock/mockStudents';
import type { PortfolioEntry } from '@/types/assessment';

type Props = {
  open: boolean;
  students: typeof MOCK_STUDENTS;
  areas: string[];
  onClose: () => void;
  onSave: (entry: PortfolioEntry) => void;
};

export function PortfolioModal({ open, students, areas, onClose, onSave }: Props) {
  const [studentId, setStudentId] = useState('');
  const [area, setArea] = useState(areas[0] ?? 'Language');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStudentId('');
    setArea(areas[0] ?? 'Language');
    setSummary('');
    setDate(new Date().toISOString().slice(0, 10));
    setError('');
  }, [open, areas]);

  const student = students.find((s) => s.id === studentId);

  const handleSave = () => {
    if (!studentId) {
      setError('Please select a student.');
      return;
    }
    if (!summary.trim()) {
      setError('Please add a summary of the highlight.');
      return;
    }
    onSave({
      id: `pf-${Date.now()}`,
      studentId,
      studentName: student?.name ?? '',
      roomName: student?.room ?? 'Unassigned',
      area,
      summary: summary.trim(),
      date,
    });
  };

  return (
    <Modal
      open={open}
      title="Add portfolio entry"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
            Add entry
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
          {areas.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="ui-field">
        <label className="ui-label">Date</label>
        <input type="date" className="ui-input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="ui-field">
        <label className="ui-label">Summary</label>
        <textarea
          className="ui-textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="Describe the learning highlight or milestone…"
        />
      </div>

      {error ? <p className="ui-field-error">{error}</p> : null}
    </Modal>
  );
}
