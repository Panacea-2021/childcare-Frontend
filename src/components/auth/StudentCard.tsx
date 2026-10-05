'use client';

import { ArrowRight, Check } from 'lucide-react';
import type { ParentStudentSummary } from '@/lib/parent-auth';

type StudentCardProps = {
  student: ParentStudentSummary;
  selected?: boolean;
  faded?: boolean;
  onSelect: (student: ParentStudentSummary) => void;
  disabled?: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function avatarTone(name: string) {
  const tones = ['sky', 'lavender', 'mint', 'peach', 'sun'] as const;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % tones.length;
  return tones[hash];
}

export function StudentCard({
  student,
  selected = false,
  faded = false,
  onSelect,
  disabled = false,
}: StudentCardProps) {
  const metaParts = [student.programName, student.roomName].filter(Boolean);
  const tone = avatarTone(student.name);

  return (
    <article
      className={[
        'student-card',
        selected ? 'is-selected' : '',
        faded ? 'is-faded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="student-card-btn"
        disabled={disabled}
        onClick={() => onSelect(student)}
        aria-pressed={selected}
        aria-label={`Continue as ${student.name}`}
      >
        {student.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="student-avatar student-avatar-img" src={student.photoUrl} alt="" />
        ) : (
          <span className={`student-avatar student-avatar-${tone}`} aria-hidden>
            {initials(student.name)}
          </span>
        )}

        <div className="student-card-copy">
          <h2 className="student-card-name">{student.name}</h2>
          <p className="student-card-meta">
            {metaParts.length > 0
              ? metaParts.join(' • ')
              : student.ageLabel
                ? `Age ${student.ageLabel}`
                : 'Student'}
          </p>
        </div>

        {selected ? (
          <span className="student-card-check" aria-hidden>
            <Check size={16} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="student-card-cta">
            Continue
            <ArrowRight className="student-card-arrow" size={16} aria-hidden />
          </span>
        )}
      </button>
    </article>
  );
}
