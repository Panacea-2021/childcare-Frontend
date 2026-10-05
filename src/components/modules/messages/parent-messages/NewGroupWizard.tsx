'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { classOptions, groupColors, sectionOptions } from './mockData';
import type { ParentContact, StudentOption } from './types';
import { avatarTone } from './utils';

type Props = {
  open: boolean;
  students: StudentOption[];
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    description: string;
    color: string;
    students: StudentOption[];
    parents: ParentContact[];
  }) => void;
};

export function NewGroupWizard({ open, students, onClose, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(groupColors[0]);
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== 'all' && s.className !== classFilter) return false;
      if (sectionFilter !== 'all' && s.section !== sectionFilter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [s.name, s.admissionNo, s.className, s.section].join(' ').toLowerCase().includes(q);
    });
  }, [students, query, classFilter, sectionFilter]);

  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
  const availableParents = selectedStudents.flatMap((s) => s.parents);
  const selectedParents = availableParents.filter((p) => selectedParentIds.includes(p.id));

  const reset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setColor(groupColors[0]);
    setQuery('');
    setClassFilter('all');
    setSectionFilter('all');
    setSelectedStudentIds([]);
    setSelectedParentIds([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const goNext = () => {
    if (step === 2) {
      const parentIds = selectedStudents.flatMap((s) => s.parents.map((p) => p.id));
      setSelectedParentIds(Array.from(new Set(parentIds)));
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const canNext =
    (step === 1 && name.trim().length > 1) ||
    (step === 2 && selectedStudentIds.length > 0) ||
    (step === 3 && selectedParentIds.length > 0) ||
    step === 4;

  return (
    <Modal
      open={open}
      title="New Group"
      onClose={handleClose}
      wide
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={handleClose}>
            Cancel
          </button>
          {step > 1 ? (
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button type="button" className="ui-btn ui-btn-primary" disabled={!canNext} onClick={goNext}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                onCreate({
                  name: name.trim(),
                  description: description.trim(),
                  color,
                  students: selectedStudents,
                  parents: selectedParents,
                });
                reset();
              }}
            >
              Create Group
            </button>
          )}
        </>
      }
    >
      <div className="pm-wizard-steps" aria-hidden>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`pm-wizard-step ${s < step ? 'is-done' : ''} ${s === step ? 'is-active' : ''}`} />
        ))}
      </div>

      {step === 1 ? (
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label" htmlFor="pm-group-name">
              Group name
            </label>
            <input
              id="pm-group-name"
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nursery A Parents"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Group color</label>
            <div className="pm-color-swatches">
              {groupColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pm-swatch ${color === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="pm-group-desc">
              Description
            </label>
            <textarea
              id="pm-group-desc"
              className="ui-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group for?"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Group icon preview</label>
            <div
              className="pm-avatar lg"
              style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }}
            >
              {(name || 'GR').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <>
          <div className="ui-grid-2" style={{ marginBottom: 12 }}>
            <div className="ui-field">
              <label className="ui-label">Search students</label>
              <input className="ui-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
            </div>
            <div className="ui-field">
              <label className="ui-label">Class</label>
              <select className="ui-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="all">All classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-field">
              <label className="ui-label">Section</label>
              <select className="ui-select" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option value="all">All sections</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`pm-select-card ${selectedStudentIds.includes(s.id) ? 'is-selected' : ''}`}
                onClick={() => toggleStudent(s.id)}
              >
                <div className={`pm-avatar sm ${avatarTone(s.avatar)}`}>{s.avatar}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block' }}>{s.name}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {s.className}-{s.section} · {s.admissionNo}
                  </small>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            {selectedStudents.map((s) => (
              <span key={s.id} className="pm-chip-selected">
                {s.name}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Parents linked to selected students are ready to invite.
          </p>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {availableParents.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pm-select-card ${selectedParentIds.includes(p.id) ? 'is-selected' : ''}`}
                onClick={() =>
                  setSelectedParentIds((prev) =>
                    prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                  )
                }
              >
                <div className={`pm-avatar sm ${avatarTone(p.avatar)}`}>{p.avatar}</div>
                <div>
                  <strong style={{ display: 'block' }}>{p.name}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {p.relationship} · {p.phone}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <div className="pm-detail-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <div className="pm-avatar lg" style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{name}</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {description || 'No description'}
              </p>
            </div>
          </div>
          <div className="pm-detail-row">
            <span>Students</span>
            <strong>{selectedStudents.length}</strong>
          </div>
          <div className="pm-detail-row">
            <span>Parents</span>
            <strong>{selectedParents.length}</strong>
          </div>
          <div className="pm-avatar-stack" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
            {selectedParents.slice(0, 6).map((p) => (
              <div key={p.id} className={`pm-avatar sm ${avatarTone(p.avatar)}`}>
                {p.avatar}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
