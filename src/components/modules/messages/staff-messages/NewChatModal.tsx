'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { StaffMember } from './types';
import { avatarTone } from './utils';
import { departmentOptions } from './mockData';

type Props = {
  open: boolean;
  staff: StaffMember[];
  onClose: () => void;
  onStart: (staff: StaffMember) => void;
};

export function NewChatModal({ open, staff, onClose, onStart }: Props) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [selected, setSelected] = useState<StaffMember | null>(null);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (department !== 'all' && s.department !== department) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [s.name, s.employeeId, s.department, s.designation, s.email, s.phone, s.role]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [staff, query, department]);

  const reset = () => {
    setQuery('');
    setDepartment('all');
    setSelected(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="New Staff Chat"
      onClose={handleClose}
      wide
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onStart(selected);
                reset();
              }
            }}
          >
            Start conversation
          </button>
        </>
      }
    >
      <div className="ui-grid-2" style={{ marginBottom: 14 }}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="sm-new-chat-search">
            Search staff
          </label>
          <div className="sm-search">
            <Search size={16} aria-hidden />
            <input
              id="sm-new-chat-search"
              className="ui-input"
              style={{ border: 0, background: 'transparent', padding: 0, height: 'auto' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, employee ID, email, phone…"
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor="sm-new-chat-dept">
            Department
          </label>
          <select
            id="sm-new-chat-dept"
            className="ui-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
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

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {filtered.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            className={`sm-select-card ${selected?.id === s.id ? 'is-selected' : ''}`}
            onClick={() => setSelected(s)}
            whileTap={{ scale: 0.99 }}
          >
            <div className={`sm-avatar ${avatarTone(s.avatar)}`}>
              {s.avatar}
              {s.online ? <span className="sm-online" aria-label="Online" /> : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block' }}>{s.name}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>
                {s.employeeId} · {s.designation} · {s.department}
              </small>
              <small style={{ display: 'block', color: 'var(--text-secondary)' }}>{s.email}</small>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            No staff members match your search.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
