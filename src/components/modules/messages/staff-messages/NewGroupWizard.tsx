'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { departmentOptions, groupColors } from './mockData';
import type { StaffMember } from './types';
import { avatarTone } from './utils';

type Props = {
  open: boolean;
  staff: StaffMember[];
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    description: string;
    color: string;
    members: StaffMember[];
  }) => void;
};

export function NewGroupWizard({ open, staff, onClose, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(groupColors[0]);
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (departmentFilter !== 'all' && s.department !== departmentFilter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [s.name, s.employeeId, s.department, s.designation, s.role].join(' ').toLowerCase().includes(q);
    });
  }, [staff, query, departmentFilter]);

  const selectedMembers = staff.filter((s) => selectedIds.includes(s.id));

  const reset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setColor(groupColors[0]);
    setQuery('');
    setDepartmentFilter('all');
    setSelectedIds([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canNext =
    (step === 1 && name.trim().length > 1) || (step === 2 && selectedIds.length > 0) || step === 3;

  return (
    <Modal
      open={open}
      title="Create Staff Group"
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
          {step < 3 ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!canNext}
              onClick={() => setStep((s) => Math.min(3, s + 1))}
            >
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
                  members: selectedMembers,
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
      <div className="sm-wizard-steps" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`sm-wizard-step ${s < step ? 'is-done' : ''} ${s === step ? 'is-active' : ''}`} />
        ))}
      </div>

      {step === 1 ? (
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label" htmlFor="sm-group-name">
              Group name
            </label>
            <input
              id="sm-group-name"
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Science Department"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Theme color</label>
            <div className="sm-color-swatches">
              {groupColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`sm-swatch ${color === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="sm-group-desc">
              Description
            </label>
            <textarea
              id="sm-group-desc"
              className="ui-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this staff group for?"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Group icon preview</label>
            <div
              className="sm-avatar lg"
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
              <label className="ui-label">Search staff</label>
              <input
                className="ui-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, employee ID…"
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Department</label>
              <select
                className="ui-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All departments</option>
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filteredStaff.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sm-select-card ${selectedIds.includes(s.id) ? 'is-selected' : ''}`}
                onClick={() => toggleMember(s.id)}
              >
                <div className={`sm-avatar sm ${avatarTone(s.avatar)}`}>{s.avatar}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block' }}>{s.name}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {s.employeeId} · {s.designation} · {s.department}
                  </small>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            {selectedMembers.map((s) => (
              <span key={s.id} className="sm-chip-selected">
                {s.name}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <div className="sm-detail-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <div className="sm-avatar lg" style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{name}</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {description || 'No description'}
              </p>
            </div>
          </div>
          <div className="sm-detail-row">
            <span>Members</span>
            <strong>{selectedMembers.length}</strong>
          </div>
          <div className="sm-avatar-stack" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
            {selectedMembers.slice(0, 8).map((s) => (
              <div key={s.id} className={`sm-avatar sm ${avatarTone(s.avatar)}`}>
                {s.avatar}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
