import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport, ReportExportFormat } from '@/components/reports/shared/generatedReport';

export type AllergyColumnMode = 'all' | 'custom';

export type AllergyColumnId =
  | 'studentName'
  | 'classroom'
  | 'allergyName'
  | 'preferredName'
  | 'branch'
  | 'admissionNumber'
  | 'allergyCategory'
  | 'severity'
  | 'symptoms'
  | 'notes'
  | 'emergencyActionPlan';

/** UI order — page 1 (10) then page 2 (1). */
export const ALLERGY_COLUMNS: { id: AllergyColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'allergyName', label: 'Allergy Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'branch', label: 'Branch' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'allergyCategory', label: 'Allergy Category' },
  { id: 'severity', label: 'Severity' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'notes', label: 'Notes' },
  { id: 'emergencyActionPlan', label: 'Emergency Action Plan' },
];

export type StudentsAllergyFormValues = {
  rooms: string[];
  columnMode: AllergyColumnMode;
  selectedColumns: AllergyColumnId[];
  format: ReportExportFormat;
};

type AllergySeed = {
  allergyName: string;
  category: string;
  severity: string;
  symptoms: string;
  notes: string;
  plan: string;
  preferredName: string;
};

const ALLERGY_BY_STUDENT: Record<string, AllergySeed> = {
  s1: {
    preferredName: 'Emma',
    allergyName: 'Peanuts',
    category: 'Food',
    severity: 'High',
    symptoms: 'Hives, swelling, wheezing',
    notes: 'Avoid shared snacks with nuts',
    plan: 'Administer epinephrine; call emergency services',
  },
  s2: {
    preferredName: 'Aarav',
    allergyName: 'Dairy',
    category: 'Food',
    severity: 'Moderate',
    symptoms: 'Stomach pain, rash',
    notes: 'Lactose-free alternatives preferred',
    plan: 'Give antihistamine per parent authorization; notify parents',
  },
  s3: {
    preferredName: 'Mia',
    allergyName: 'Dust mites',
    category: 'Environmental',
    severity: 'Mild',
    symptoms: 'Sneezing, watery eyes',
    notes: 'Keep rest mats dusted daily',
    plan: 'Move to cleaner room; administer prescribed drops if needed',
  },
  s4: {
    preferredName: 'Liam',
    allergyName: 'Eggs',
    category: 'Food',
    severity: 'High',
    symptoms: 'Vomiting, facial swelling',
    notes: 'No egg-based art materials',
    plan: 'EpiPen in classroom cabinet; call parents immediately',
  },
  s5: {
    preferredName: 'Sofia',
    allergyName: 'Bee sting',
    category: 'Insect',
    severity: 'High',
    symptoms: 'Local swelling, difficulty breathing',
    notes: 'Supervise outdoor play closely',
    plan: 'Apply ice; give epinephrine if systemic symptoms appear',
  },
  s6: {
    preferredName: 'Noah',
    allergyName: 'Soy',
    category: 'Food',
    severity: 'Mild',
    symptoms: 'Itchy mouth',
    notes: 'Check ingredient labels on snacks',
    plan: 'Rinse mouth; observe 30 minutes; notify parents',
  },
  s7: {
    preferredName: 'Ava',
    allergyName: 'Latex',
    category: 'Contact',
    severity: 'Moderate',
    symptoms: 'Skin redness, itching',
    notes: 'Use non-latex gloves and balloons',
    plan: 'Wash area; apply hydrocortisone cream if available',
  },
  s8: {
    preferredName: 'Ethan',
    allergyName: 'Tree nuts',
    category: 'Food',
    severity: 'High',
    symptoms: 'Anaphylaxis risk',
    notes: 'Nut-free classroom required',
    plan: 'Immediate epinephrine and emergency call',
  },
  s9: {
    preferredName: 'Olivia',
    allergyName: 'Fragrance',
    category: 'Environmental',
    severity: 'Mild',
    symptoms: 'Headache, cough',
    notes: 'Fragrance-free products only',
    plan: 'Move to well-ventilated area; notify parents',
  },
  s12: {
    preferredName: 'Mason',
    allergyName: 'Shellfish',
    category: 'Food',
    severity: 'Moderate',
    symptoms: 'Hives, nausea',
    notes: 'Not currently served at center',
    plan: 'Antihistamine per care plan; monitor breathing',
  },
};

export function defaultStudentsAllergyForm(): StudentsAllergyFormValues {
  return {
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
    format: 'pdf',
  };
}

function activeColumns(values: StudentsAllergyFormValues) {
  if (values.columnMode === 'all') return ALLERGY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return ALLERGY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStudentsAllergyRows(
  values: StudentsAllergyFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => ALLERGY_BY_STUDENT[s.id]);

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);

  return students.map((student) => {
    const allergy = ALLERGY_BY_STUDENT[student.id];
    const full: Record<AllergyColumnId, string> = {
      studentName: student.name,
      classroom: student.room,
      allergyName: allergy.allergyName,
      preferredName: allergy.preferredName,
      branch: 'Main Campus',
      admissionNumber: student.admissionNo,
      allergyCategory: allergy.category,
      severity: allergy.severity,
      symptoms: allergy.symptoms,
      notes: allergy.notes,
      emergencyActionPlan: allergy.plan,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createStudentsAllergyReport(
  values: StudentsAllergyFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStudentsAllergyRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPdf = values.format === 'pdf';

  return {
    id: `alg-${now.getTime()}`,
    kind: 'students-allergy',
    name: isPdf ? 'Students_Allergy_Report.pdf' : 'Students_Allergy_Report.xlsx',
    format: values.format,
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
