'use client';

import type { AdmissionProcess, AdmissionStudentProgress } from './types';

const KEY = 'panacea.admission.processes.v3';

function cloneStudents(list: AdmissionStudentProgress[]): AdmissionStudentProgress[] {
  return list.map((s) => ({ ...s }));
}

function cloneProcess(p: AdmissionProcess): AdmissionProcess {
  return {
    ...p,
    steps: p.steps.map((s) => ({ ...s, forms: s.forms.map((f) => ({ ...f })) })),
    students: cloneStudents(p.students),
  };
}

export const ADMISSION_SEED: AdmissionProcess[] = [
  {
    id: 'ap-spring-2026',
    name: 'Spring 2026 Admissions',
    status: 'Live',
    dueDate: '15/09/2026',
    totalStudents: 6,
    steps: [
      {
        id: 'step-enquiry',
        name: 'Enquiry & Interest',
        category: 'Intake',
        forms: [
          { id: 'asf-1', formId: 'frm-5', formName: 'Waitlist Form' },
          { id: 'asf-2', formId: 'frm-2', formName: 'Event RSVP Form' },
        ],
      },
      {
        id: 'step-application',
        name: 'Application Packet',
        category: 'Admissions',
        forms: [{ id: 'asf-3', formId: 'frm-3', formName: 'Enrollment Intake' }],
      },
      {
        id: 'step-docs',
        name: 'Document Collection',
        category: 'Compliance',
        forms: [{ id: 'asf-4', formId: 'frm-1', formName: '180 Q omr' }],
      },
    ],
    students: [
      {
        id: 'aps-s1',
        name: 'Aarav Mehta',
        status: 'Done',
        progress: 100,
        room: 'Toddler Room',
        group: 'Morning',
        program: 'Full Day',
      },
      {
        id: 'aps-s2',
        name: 'Mia Chen',
        status: 'In Progress',
        progress: 62,
        room: 'Preschool Room',
        group: 'Special',
        program: 'ABC',
      },
      {
        id: 'aps-s3',
        name: 'Noah Patel',
        status: 'Pending',
        progress: 15,
        room: 'Demo Room',
        group: 'Afternoon',
        program: 'Half Day',
      },
      {
        id: 'aps-s4',
        name: 'Sofia Reyes',
        status: 'In Progress',
        progress: 48,
        room: 'Toddler Room',
        group: 'Morning',
        program: 'Full Day',
      },
      {
        id: 'aps-s5',
        name: 'Liam Brooks',
        status: 'Done',
        progress: 100,
        room: 'Preschool Room',
        group: 'Special',
        program: 'ABC',
      },
      {
        id: 'aps-s6',
        name: 'Emma Kapoor',
        status: 'Pending',
        progress: 8,
        room: 'Demo Room',
        group: 'Afternoon',
        program: 'Half Day',
      },
    ],
  },
  {
    id: 'ap-infant-intake',
    name: 'Infant Room Intake',
    status: 'Live',
    dueDate: '30/08/2026',
    totalStudents: 8,
    steps: [
      {
        id: 'step-tour',
        name: 'Center Tour Booking',
        category: 'Engagement',
        forms: [
          { id: 'asf-5', formId: 'frm-akkisetty', formName: 'Tour Interest Form' },
          { id: 'asf-5b', formId: 'frm-2', formName: 'Event RSVP Form' },
        ],
      },
      {
        id: 'step-application',
        name: 'Infant Application',
        category: 'Admissions',
        forms: [{ id: 'asf-5c', formId: 'frm-3', formName: 'Enrollment Intake' }],
      },
      {
        id: 'step-health',
        name: 'Health & Emergency Info',
        category: 'Operations',
        forms: [
          { id: 'asf-5d', formId: 'frm-1', formName: 'Health History Form' },
          { id: 'asf-5e', formId: 'frm-5', formName: 'Emergency Contacts' },
        ],
      },
      {
        id: 'step-placement',
        name: 'Room Placement',
        category: 'Operations',
        forms: [{ id: 'asf-5f', formId: 'frm-2', formName: 'Room Preference Form' }],
      },
    ],
    students: [
      {
        id: 'api-1',
        name: 'Olivia Sharma',
        status: 'In Progress',
        progress: 72,
        room: 'Infant Room A',
        group: 'Infants',
        program: 'Infant Care',
      },
      {
        id: 'api-2',
        name: 'Ethan Walker',
        status: 'Done',
        progress: 100,
        room: 'Infant Room A',
        group: 'Infants',
        program: 'Infant Care',
      },
      {
        id: 'api-3',
        name: 'Ava Thompson',
        status: 'Pending',
        progress: 20,
        room: 'Infant Room B',
        group: 'Special',
        program: 'ABC',
      },
      {
        id: 'api-4',
        name: 'Lucas Nguyen',
        status: 'In Progress',
        progress: 55,
        room: 'Demo Room',
        group: 'Infants',
        program: 'Infant Care',
      },
      {
        id: 'api-5',
        name: 'Isabella Garcia',
        status: 'Done',
        progress: 100,
        room: 'Infant Room B',
        group: 'Special',
        program: 'ABC',
      },
      {
        id: 'api-6',
        name: 'Mason Lee',
        status: 'Pending',
        progress: 10,
        room: 'Demo Room',
        group: 'Infants',
        program: 'Half Day',
      },
      {
        id: 'api-7',
        name: 'Harper Singh',
        status: 'In Progress',
        progress: 40,
        room: 'Infant Room A',
        group: 'Special',
        program: 'Infant Care',
      },
      {
        id: 'api-8',
        name: 'Benjamin Cruz',
        status: 'Pending',
        progress: 5,
        room: 'Infant Room B',
        group: 'Infants',
        program: 'Half Day',
      },
    ],
  },
  {
    id: 'ap-staff-child',
    name: 'Staff Child Priority Track',
    status: 'Draft',
    dueDate: '01/10/2026',
    totalStudents: 3,
    steps: [
      {
        id: 'step-priority',
        name: 'Priority Application',
        category: 'Admissions',
        forms: [{ id: 'asf-6', formId: 'frm-3', formName: 'Enrollment Intake' }],
      },
      {
        id: 'step-verify',
        name: 'Staff Verification',
        category: 'HR',
        forms: [{ id: 'asf-6b', formId: 'frm-1', formName: 'Staff Child Affidavit' }],
      },
    ],
    students: [
      {
        id: 'apc-1',
        name: 'Nora Adams',
        status: 'In Progress',
        progress: 65,
        room: 'Preschool Room',
        group: 'Staff Family',
        program: 'Full Day',
      },
      {
        id: 'apc-2',
        name: 'Kai Johnson',
        status: 'Pending',
        progress: 25,
        room: 'Toddler Room',
        group: 'Staff Family',
        program: 'Half Day',
      },
      {
        id: 'apc-3',
        name: 'Zoe Martinez',
        status: 'Done',
        progress: 100,
        room: 'Demo Room',
        group: 'Staff Family',
        program: 'ABC',
      },
    ],
  },
  {
    id: 'ap-midyear',
    name: 'Mid-Year Transfer Process',
    status: 'Draft',
    dueDate: '20/11/2026',
    totalStudents: 4,
    steps: [
      {
        id: 'step-transfer',
        name: 'Transfer Request',
        category: 'Operations',
        forms: [{ id: 'asf-m1', formId: 'frm-3', formName: 'Transfer Request Form' }],
      },
      {
        id: 'step-records',
        name: 'Records Handoff',
        category: 'Compliance',
        forms: [{ id: 'asf-m2', formId: 'frm-1', formName: 'Records Release' }],
      },
    ],
    students: [
      {
        id: 'apm-1',
        name: 'Chloe Park',
        status: 'In Progress',
        progress: 50,
        room: 'Preschool Room',
        group: 'Morning',
        program: 'Full Day',
      },
      {
        id: 'apm-2',
        name: 'Jack Wilson',
        status: 'Pending',
        progress: 12,
        room: 'Toddler Room',
        group: 'Afternoon',
        program: 'Half Day',
      },
      {
        id: 'apm-3',
        name: 'Amelia Brown',
        status: 'Done',
        progress: 100,
        room: 'Demo Room',
        group: 'Special',
        program: 'ABC',
      },
      {
        id: 'apm-4',
        name: 'Henry Davis',
        status: 'In Progress',
        progress: 35,
        room: 'Preschool Room',
        group: 'Morning',
        program: 'Full Day',
      },
    ],
  },
  {
    id: 'ap-summer-camp',
    name: 'Summer Camp Registration',
    status: 'Live',
    dueDate: '01/05/2027',
    totalStudents: 5,
    steps: [
      {
        id: 'step-reg',
        name: 'Camp Registration',
        category: 'Programs',
        forms: [{ id: 'asf-7', formId: 'frm-2', formName: 'Event RSVP Form' }],
      },
      {
        id: 'step-waiver',
        name: 'Waivers & Permissions',
        category: 'Compliance',
        forms: [{ id: 'asf-7b', formId: 'frm-1', formName: 'Camp Waiver' }],
      },
      {
        id: 'step-payment',
        name: 'Deposit Confirmation',
        category: 'Billing',
        forms: [{ id: 'asf-7c', formId: 'frm-5', formName: 'Deposit Receipt' }],
      },
    ],
    students: [
      {
        id: 'apsu-1',
        name: 'Ellie Foster',
        status: 'Done',
        progress: 100,
        room: 'Camp Room 1',
        group: 'Week A',
        program: 'Summer Camp',
      },
      {
        id: 'apsu-2',
        name: 'Owen Rivera',
        status: 'In Progress',
        progress: 58,
        room: 'Camp Room 2',
        group: 'Week B',
        program: 'Summer Camp',
      },
      {
        id: 'apsu-3',
        name: 'Grace Kim',
        status: 'Pending',
        progress: 18,
        room: 'Camp Room 1',
        group: 'Week A',
        program: 'ABC',
      },
      {
        id: 'apsu-4',
        name: 'Leo Anderson',
        status: 'In Progress',
        progress: 70,
        room: 'Demo Room',
        group: 'Week B',
        program: 'Summer Camp',
      },
      {
        id: 'apsu-5',
        name: 'Scarlett White',
        status: 'Pending',
        progress: 5,
        room: 'Camp Room 2',
        group: 'Special',
        program: 'ABC',
      },
    ],
  },
];

function normalizeProcess(raw: AdmissionProcess): AdmissionProcess {
  return {
    ...raw,
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    students: Array.isArray(raw.students) ? raw.students : [],
    totalStudents: Array.isArray(raw.students) ? raw.students.length : raw.totalStudents ?? 0,
  };
}

export function loadProcesses(): AdmissionProcess[] {
  if (typeof window === 'undefined') return ADMISSION_SEED.map(cloneProcess);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seed = ADMISSION_SEED.map(cloneProcess);
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AdmissionProcess[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = ADMISSION_SEED.map(cloneProcess);
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed.map(normalizeProcess);
  } catch {
    return ADMISSION_SEED.map(cloneProcess);
  }
}

export function saveProcesses(list: AdmissionProcess[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertProcess(item: AdmissionProcess) {
  const list = loadProcesses();
  const idx = list.findIndex((p) => p.id === item.id);
  const next = idx >= 0 ? list.map((p, i) => (i === idx ? item : p)) : [item, ...list];
  saveProcesses(next);
  return next;
}

export function deleteProcess(id: string) {
  const next = loadProcesses().filter((p) => p.id !== id);
  saveProcesses(next);
  return next;
}

export function getProcessById(id: string) {
  return loadProcesses().find((p) => p.id === id) ?? null;
}
