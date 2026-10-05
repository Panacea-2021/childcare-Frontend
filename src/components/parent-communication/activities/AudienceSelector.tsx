'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, School, X, Check, Lock } from 'lucide-react';
import { MOCK_ROOMS } from '@/lib/mock/mockRooms';
import { MOCK_STUDENTS } from '@/lib/mock/mockStudents';
import './activities.css';

export type LockedAudienceStudent = {
  id: string;
  name: string;
  room?: string;
};

interface AudienceSelectorProps {
  selectedRooms: string[];
  selectedStudents: string[];
  onRoomsChange: (rooms: string[]) => void;
  onStudentsChange: (students: string[]) => void;
  /** When set (e.g. from Student Profile Actions), audience is fixed to this child. */
  lockedStudent?: LockedAudienceStudent | null;
  /** Display names for selected student ids not present in MOCK_STUDENTS. */
  studentLabels?: Record<string, string>;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  selectedRooms,
  selectedStudents,
  onRoomsChange,
  onStudentsChange,
  lockedStudent = null,
  studentLabels = {},
}) => {
  const [tab, setTab] = useState<'students' | 'classrooms'>('students');
  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(
    () =>
      MOCK_ROOMS.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const filteredStudents = useMemo(
    () =>
      MOCK_STUDENTS.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.room.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const toggleRoom = (roomName: string) => {
    if (selectedRooms.includes(roomName)) {
      onRoomsChange(selectedRooms.filter((r) => r !== roomName));
    } else {
      onRoomsChange([...selectedRooms, roomName]);
    }
  };

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      onStudentsChange(selectedStudents.filter((s) => s !== studentId));
    } else {
      onStudentsChange([...selectedStudents, studentId]);
    }
  };

  const roomStudentCount = selectedRooms.reduce((acc, roomName) => {
    const room = MOCK_ROOMS.find((r) => r.name === roomName);
    return acc + (room ? room.studentCount : 0);
  }, 0);

  const totalStudents = roomStudentCount + selectedStudents.length;

  const resolveStudentName = (sid: string) =>
    MOCK_STUDENTS.find((s) => s.id === sid)?.name ?? studentLabels[sid] ?? sid;

  if (lockedStudent) {
    const initials = lockedStudent.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');

    return (
      <motion.div
        className="act-audience act-audience-locked"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="act-audience-header">
          <div className="act-selector-head-copy">
            <span className="act-step-kicker">Step 3</span>
            <h4 className="act-step-title">Audience</h4>
          </div>
          <span className="act-audience-count">
            <Lock size={14} />
            Locked to profile
          </span>
        </div>
        <div className="act-locked-student">
          <span className="act-locked-avatar" aria-hidden>
            {initials || 'ST'}
          </span>
          <div className="act-locked-copy">
            <strong>{lockedStudent.name}</strong>
            <span>{lockedStudent.room || 'Student profile'}</span>
          </div>
          <span className="act-locked-badge">Selected</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="act-audience">
      <div className="act-audience-header">
        <div className="act-selector-head-copy">
          <span className="act-step-kicker">Step 3</span>
          <h4 className="act-step-title">Audience</h4>
        </div>
        <span className="act-audience-count">
          <Users size={14} />
          {totalStudents} Students Selected
        </span>
      </div>

      <div className="act-audience-tabs">
        <button
          type="button"
          onClick={() => setTab('students')}
          className={`act-audience-tab${tab === 'students' ? ' act-audience-tab-active' : ''}`}
        >
          <Users size={14} />
          Students ({selectedStudents.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('classrooms')}
          className={`act-audience-tab${tab === 'classrooms' ? ' act-audience-tab-active' : ''}`}
        >
          <School size={14} />
          Classrooms ({selectedRooms.length})
        </button>
      </div>

      <div className="act-audience-search">
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary, #6b7280)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === 'classrooms'
              ? 'Search classrooms...'
              : 'Search students by name or room...'
          }
        />
      </div>

      {(selectedRooms.length > 0 || selectedStudents.length > 0) && (
        <div className="act-audience-chips">
          {selectedRooms.map((r) => (
            <span key={r} className="act-audience-chip">
              {r}
              <button
                type="button"
                onClick={() => toggleRoom(r)}
                aria-label={`Remove ${r}`}
                style={{
                  display: 'inline-flex',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {selectedStudents.map((sid) => (
            <span key={sid} className="act-audience-chip">
              {resolveStudentName(sid)}
              <button
                type="button"
                onClick={() => toggleStudent(sid)}
                aria-label="Remove student"
                className="act-audience-chip-x"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="act-audience-list">
        {tab === 'classrooms'
          ? filteredRooms.map((room) => {
              const isSelected = selectedRooms.includes(room.name);
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room.name)}
                  className={`act-audience-list-item${isSelected ? ' act-audience-list-item-selected' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <School size={16} color="var(--color-accent, #5d5fef)" />
                    {room.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary, #6b7280)',
                      }}
                    >
                      {room.studentCount} Students
                    </span>
                    {isSelected && (
                      <Check size={16} strokeWidth={3} color="var(--color-accent, #5d5fef)" />
                    )}
                  </span>
                </button>
              );
            })
          : filteredStudents.map((st) => {
              const isSelected = selectedStudents.includes(st.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleStudent(st.id)}
                  className={`act-audience-list-item${isSelected ? ' act-audience-list-item-selected' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: st.avatarColor,
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                      }}
                    >
                      {st.name.substring(0, 2).toUpperCase()}
                    </span>
                    {st.name}
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary, #6b7280)',
                      }}
                    >
                      ({st.room})
                    </span>
                  </span>
                  {isSelected && (
                    <Check size={16} strokeWidth={3} color="var(--color-accent, #5d5fef)" />
                  )}
                </button>
              );
            })}
      </div>
    </div>
  );
};
