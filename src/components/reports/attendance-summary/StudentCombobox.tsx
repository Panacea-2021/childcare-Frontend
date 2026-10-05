'use client';

import { AsrDropdown } from './AsrDropdown';
import { MOCK_STUDENTS } from './types';

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string;
};

export function StudentCombobox({ value, onChange, error }: Props) {
  return (
    <AsrDropdown
      label={
        <>
          Select Student <span className="asr-req">*</span>
        </>
      }
      ariaLabel="Select Student"
      placeholder="Search and select a student…"
      searchPlaceholder="Search by name, admission no, or room…"
      value={value}
      error={error}
      onChange={onChange}
      options={MOCK_STUDENTS.map((student) => ({
        value: student.id,
        label: student.name,
        meta: `${student.admissionNo} · ${student.room}`,
        leading: <span className={`asr-avatar ${student.tone}`}>{student.initials}</span>,
      }))}
    />
  );
}
