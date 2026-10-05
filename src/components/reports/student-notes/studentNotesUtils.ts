import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type NotesColumnMode = 'all' | 'custom';

export type NotesColumnId =
  | 'studentName'
  | 'note'
  | 'createdBy'
  | 'updatedOn'
  | 'uploadedImage'
  | 'admissionNumber'
  | 'studentId';

export const NOTES_COLUMNS: { id: NotesColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'note', label: 'Note' },
  { id: 'createdBy', label: 'Created By' },
  { id: 'updatedOn', label: 'Updated On' },
  { id: 'uploadedImage', label: 'Uploaded Image' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'studentId', label: 'Student ID' },
];

export type StudentNotesFormValues = {
  rooms: string[];
  columnMode: NotesColumnMode;
  selectedColumns: NotesColumnId[];
};

type NoteSeed = {
  note: string;
  createdBy: string;
  updatedOn: string;
  hasImage: boolean;
};

const STAFF = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'Anita Kapoor', 'Front Desk'];

const NOTES_BY_STUDENT: Record<string, NoteSeed[]> = {
  s1: [
    {
      note: 'Settled well after morning circle. Prefers quiet reading corner.',
      createdBy: STAFF[0],
      updatedOn: '02/08/2026 10:15 AM',
      hasImage: true,
    },
    {
      note: 'Parent requested extra water bottle check during outdoor play.',
      createdBy: STAFF[1],
      updatedOn: '03/08/2026 02:40 PM',
      hasImage: false,
    },
  ],
  s2: [
    {
      note: 'Shared toys nicely during free play. Praise shared with parents.',
      createdBy: STAFF[2],
      updatedOn: '01/08/2026 11:05 AM',
      hasImage: true,
    },
  ],
  s3: [
    {
      note: 'Mild fussiness at nap time; soothed with soft music.',
      createdBy: STAFF[1],
      updatedOn: '04/08/2026 01:20 PM',
      hasImage: false,
    },
  ],
  s4: [
    {
      note: 'Needs reminder to hang bag on assigned hook.',
      createdBy: STAFF[3],
      updatedOn: '29/07/2026 09:30 AM',
      hasImage: true,
    },
  ],
  s5: [
    {
      note: 'Completed art activity independently. Photo attached for portfolio.',
      createdBy: STAFF[0],
      updatedOn: '31/07/2026 03:10 PM',
      hasImage: true,
    },
  ],
  s6: [
    {
      note: 'On Hold — temporary schedule note while transfer paperwork pending.',
      createdBy: STAFF[4],
      updatedOn: '28/07/2026 04:00 PM',
      hasImage: false,
    },
  ],
  s7: [
    {
      note: 'Practiced letter tracing; good grip improvement.',
      createdBy: STAFF[2],
      updatedOn: '02/08/2026 11:45 AM',
      hasImage: true,
    },
  ],
  s8: [
    {
      note: 'Transferred classroom note: buddy assigned for first week.',
      createdBy: STAFF[0],
      updatedOn: '25/07/2026 08:50 AM',
      hasImage: false,
    },
  ],
  s9: [
    {
      note: 'New enrollee orientation completed with guardian.',
      createdBy: STAFF[4],
      updatedOn: '30/07/2026 09:15 AM',
      hasImage: true,
    },
  ],
  s12: [
    {
      note: 'Helped a classmate tidy blocks. Positive social moment.',
      createdBy: STAFF[1],
      updatedOn: '04/08/2026 12:05 PM',
      hasImage: true,
    },
    {
      note: 'Forgot lunch box; center snack provided and logged.',
      createdBy: STAFF[3],
      updatedOn: '03/08/2026 01:00 PM',
      hasImage: false,
    },
  ],
};

function imageUrl(studentId: string, noteIndex: number) {
  const seed = `${studentId}-${noteIndex}`;
  return `https://placehold.co/96x96/E8F2FF/5D5FEF/png?text=${encodeURIComponent(seed.slice(0, 4).toUpperCase())}`;
}

export function defaultStudentNotesForm(): StudentNotesFormValues {
  return {
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: StudentNotesFormValues) {
  if (values.columnMode === 'all') return NOTES_COLUMNS;
  const set = new Set(values.selectedColumns);
  return NOTES_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStudentNotesRows(values: StudentNotesFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => NOTES_BY_STUDENT[s.id]);

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);
  const rows: Record<string, string>[] = [];

  students.forEach((student) => {
    const notes = NOTES_BY_STUDENT[student.id] ?? [];
    notes.forEach((entry, ni) => {
      const full: Record<NotesColumnId, string> = {
        studentName: student.name,
        note: entry.note,
        createdBy: entry.createdBy,
        updatedOn: entry.updatedOn,
        uploadedImage: entry.hasImage ? imageUrl(student.id, ni) : '—',
        admissionNumber: student.admissionNo,
        studentId: student.id.toUpperCase(),
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      rows.push(row);
    });
  });

  return rows;
}

export function createStudentNotesReport(
  values: StudentNotesFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStudentNotesRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    id: `notes-${now.getTime()}`,
    kind: 'student-notes',
    name: 'Student_Notes_Report.xlsx',
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: values.rooms.length ? values.rooms.join(', ') : 'All classrooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
