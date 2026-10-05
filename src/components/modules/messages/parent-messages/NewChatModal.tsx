'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentContact, StudentOption } from './types';
import { avatarTone } from './utils';

type Props = {
  open: boolean;
  students: StudentOption[];
  onClose: () => void;
  onStart: (student: StudentOption, parent: ParentContact) => void;
};

export function NewChatModal({ open, students, onClose, onStart }: Props) {
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentContact | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.admissionNo, s.className, s.section, ...s.parents.map((p) => p.name)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [students, query]);

  const reset = () => {
    setQuery('');
    setSelectedStudent(null);
    setSelectedParent(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="New Chat"
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
            disabled={!selectedStudent || !selectedParent}
            onClick={() => {
              if (selectedStudent && selectedParent) {
                onStart(selectedStudent, selectedParent);
                reset();
              }
            }}
          >
            Start conversation
          </button>
        </>
      }
    >
      <div className="ui-field" style={{ marginBottom: 14 }}>
        <label className="ui-label" htmlFor="pm-new-chat-search">
          Search student
        </label>
        <div className="pm-search">
          <Search size={16} aria-hidden />
          <input
            id="pm-new-chat-search"
            className="ui-input"
            style={{ border: 0, background: 'transparent', padding: 0, height: 'auto' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, admission no, class…"
          />
        </div>
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 14 }}>
        {filtered.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            className={`pm-select-card ${selectedStudent?.id === s.id ? 'is-selected' : ''}`}
            onClick={() => {
              setSelectedStudent(s);
              setSelectedParent(s.parents[0] ?? null);
            }}
            whileTap={{ scale: 0.99 }}
          >
            <div className={`pm-avatar ${avatarTone(s.avatar)}`}>{s.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block' }}>{s.name}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>
                {s.admissionNo} · {s.className}-{s.section}
              </small>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedStudent ? (
        <div>
          <div className="ui-label" style={{ marginBottom: 8 }}>
            Select parent
          </div>
          <div className="ui-grid-2">
            {selectedStudent.parents.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pm-select-card ${selectedParent?.id === p.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedParent(p)}
              >
                <div className={`pm-avatar sm ${avatarTone(p.avatar)}`}>{p.avatar}</div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.88rem' }}>{p.name}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {p.relationship} · {p.phone}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
