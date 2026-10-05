import type { Student, StudentParent } from './types';

export type ActivityActor = 'student' | 'parent1' | 'parent2';

export type ActivityEvent = {
  id: string;
  actor: ActivityActor;
  title: string;
  at: string;
  updatedBy: string;
  changes: { key: string; before?: string | number | boolean | null; after?: string | number | boolean | null }[];
  snapshot?: Record<string, string | number | boolean | null>;
};

const SEED: Record<string, ActivityEvent[]> = {};

function seedFor(student: Student): ActivityEvent[] {
  const parent1 = student.parents[0];
  const parent2 = student.parents[1];
  const events: ActivityEvent[] = [
    {
      id: 'ev-stu-1',
      actor: 'student',
      title: 'Student Updated',
      at: '2026-08-01T22:32:00.000Z',
      updatedBy: 'Mallika Thimisetty',
      changes: [
        { key: 'admissionNumber', before: '', after: student.admissionNumber || 'ADM-001' },
        { key: 'bloodGroup', before: '', after: student.bloodGroup || 'O+' },
        { key: 'consecutiveAbsentDays', before: 0, after: 1 },
        { key: 'deactivated', before: true, after: false },
        { key: 'address', before: student.address || '', after: student.address || 'Demo Address' },
      ],
    },
    {
      id: 'ev-stu-2',
      actor: 'student',
      title: 'Student Updated',
      at: '2026-07-28T14:10:00.000Z',
      updatedBy: 'Mallika Thimisetty',
      changes: [
        { key: 'status', before: 'Inquiry', after: student.status },
        { key: 'roomIds', before: '', after: student.roomIds.join(', ') || 'room-1' },
      ],
    },
  ];

  if (parent1) {
    events.push({
      id: 'ev-p1-1',
      actor: 'parent1',
      title: 'Parent Added',
      at: '2024-07-30T16:37:00.000Z',
      updatedBy: 'Mallika Thimisetty',
      snapshot: {
        name: parent1.name,
        email: parent1.email ?? null,
        phone: parent1.phone ?? null,
        relationship: parent1.role,
        companyName: 'illumine',
        countryCode: '+1',
        studentStatus: student.status,
      },
      changes: [
        { key: 'name', after: parent1.name },
        { key: 'email', after: parent1.email ?? null },
        { key: 'relationship', after: parent1.role },
      ],
    });
  }

  if (parent2) {
    events.push({
      id: 'ev-p2-1',
      actor: 'parent2',
      title: 'Parent Added',
      at: '2024-08-02T11:20:00.000Z',
      updatedBy: 'Mallika Thimisetty',
      snapshot: {
        name: parent2.name,
        email: parent2.email ?? null,
        phone: parent2.phone ?? null,
        relationship: parent2.role,
      },
      changes: [
        { key: 'name', after: parent2.name },
        { key: 'email', after: parent2.email ?? null },
      ],
    });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export function getActivityEvents(student: Student, actor: ActivityActor): ActivityEvent[] {
  if (!SEED[student.id]) SEED[student.id] = seedFor(student);
  return SEED[student.id].filter((e) => e.actor === actor);
}

export function parentLogLabel(parent: StudentParent | undefined, index: 1 | 2) {
  if (!parent) return `Parent ${index === 1 ? 'One' : 'Two'} Logs`;
  return `Parent ${index === 1 ? 'One' : 'Two'} Logs`;
}

export function formatActivityWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
