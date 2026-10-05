import { loadStudents, ROOM_OPTIONS, PROGRAM_OPTIONS } from '@/lib/center-management/studentsStore';
import type { ParentStudentSummary } from './types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function phonesMatch(a?: string, b?: string) {
  if (!a || !b) return false;
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  return na === nb || na.endsWith(nb) || nb.endsWith(na);
}

function toSummary(student: ReturnType<typeof loadStudents>[number]): ParentStudentSummary {
  const roomName = student.roomIds
    .map((id) => ROOM_OPTIONS.find((r) => r.id === id)?.name)
    .filter(Boolean)
    .join(', ');
  const programName =
    student.programEnrollments.find((p) => p.stage === 'Active')?.programName ??
    student.programIds
      .map((id) => PROGRAM_OPTIONS.find((p) => p.id === id)?.name)
      .filter(Boolean)[0];

  return {
    id: student.id,
    name: student.name,
    preferredName: student.preferredName || undefined,
    gender: student.gender,
    photoUrl: student.photoUrl,
    roomName: roomName || undefined,
    programName: programName || undefined,
    status: student.status,
    ageLabel: student.ageLabel,
  };
}

/**
 * Resolve students linked to a parent email from center student records.
 * Backend remains source of truth when a real API is wired; this uses local store today.
 */
export function getStudentsForParentEmail(email: string): ParentStudentSummary[] {
  const target = normalizeEmail(email);
  if (!target) return [];

  return loadStudents()
    .filter((student) =>
      student.parents.some((parent) => normalizeEmail(parent.email ?? '') === target),
    )
    .map(toSummary);
}

export function getStudentsForParentPhone(phone: string): ParentStudentSummary[] {
  const target = normalizePhone(phone);
  if (!target) return [];

  return loadStudents()
    .filter((student) => student.parents.some((parent) => phonesMatch(parent.phone, target)))
    .map(toSummary);
}

export function getStudentsForParentIdentifier(
  identifier: string,
  method: 'email' | 'phone',
): ParentStudentSummary[] {
  return method === 'phone'
    ? getStudentsForParentPhone(identifier)
    : getStudentsForParentEmail(identifier);
}
