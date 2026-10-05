'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  loadStudents,
  roomName,
  shareFormsWithStudents,
} from '@/lib/center-management/studentsStore';
import { shareForm } from '@/lib/students/profileStore';
import type { FormItem } from './types';
import './forms.css';

type Props = {
  open: boolean;
  form: FormItem | null;
  onClose: () => void;
  onShared: (count: number) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function ShareWithStudentsModal({ open, form, onClose, onShared }: Props) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const students = useMemo(() => {
    if (!open) return [];
    return loadStudents().filter((s) => s.status === 'Active');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setSelected([]);
    setBusy(false);
  }, [open, form?.id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.admissionNumber?.toLowerCase().includes(query) ||
        roomName(s.roomIds[0] ?? '')
          .toLowerCase()
          .includes(query),
    );
  }, [students, q]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.includes(s.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const drop = new Set(filtered.map((s) => s.id));
      setSelected((prev) => prev.filter((id) => !drop.has(id)));
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((s) => next.add(s.id));
      return [...next];
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleShare = () => {
    if (!form || !selected.length || busy) return;
    setBusy(true);
    const count = shareFormsWithStudents(
      {
        id: form.id,
        name: form.name,
        openUntil: form.openUntil,
        category: form.category,
      },
      selected,
    );
    // Keep lightweight student-profile Forms tab in sync when those ids exist
    selected.forEach((studentId) => {
      try {
        shareForm(studentId, form.name, 'You', form.id);
      } catch {
        /* profile id may not exist — center students are the source of truth */
      }
    });
    onShared(count);
    setBusy(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      wide
      title="Share With Students"
      subtitle={form ? `Select students to receive “${form.name}”` : undefined}
      icon={<Users size={18} />}
      iconClose
      onClose={() => {
        if (!busy) onClose();
      }}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected.length || busy || !form}
            onClick={handleShare}
          >
            Share to {selected.length || 0} student{selected.length === 1 ? '' : 's'}
          </button>
        </>
      }
    >
      <div className="forms-share-modal">
        <div className="forms-share-toolbar">
          <label className="forms-search" style={{ maxWidth: 'none', flex: 1 }}>
            <span aria-hidden>
              <Search size={16} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, admission no, or room…"
              aria-label="Search students"
            />
          </label>
          <button type="button" className="ui-btn ui-btn-outline" onClick={toggleAll}>
            {allFilteredSelected ? 'Clear visible' : 'Select visible'}
          </button>
        </div>

        <p className="forms-share-meta">
          {selected.length} selected · {filtered.length} shown
        </p>

        <div className="forms-share-list" role="listbox" aria-multiselectable="true">
          {filtered.map((s) => {
            const checked = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={checked}
                className={`forms-share-row${checked ? ' is-selected' : ''}`}
                onClick={() => toggleOne(s.id)}
              >
                <span className={`forms-share-check${checked ? ' is-on' : ''}`} aria-hidden>
                  {checked ? <Check size={14} strokeWidth={2.5} /> : null}
                </span>
                <span className="forms-share-avatar" aria-hidden>
                  {initials(s.name)}
                </span>
                <span className="forms-share-copy">
                  <strong>{s.name}</strong>
                  <span>
                    {s.admissionNumber || '—'} · {roomName(s.roomIds[0] ?? '') || 'Unassigned'}
                  </span>
                </span>
              </button>
            );
          })}
          {!filtered.length ? (
            <div className="forms-share-empty">No students match your search.</div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
