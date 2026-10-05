export type JourneyStatus = 'draft' | 'shared';

export type LearningJourney = {
  id: string;
  name: string;
  studentId: string;
  studentName: string;
  createdBy: string;
  updatedOn: string;
  status: JourneyStatus;
  dateFrom: string;
  dateTo: string;
  includeStaffOnly: boolean;
  pdfShowNextSteps: boolean;
  pdfShowMilestones: boolean;
  pdfUseObservationRange: boolean;
};

export type PdfSettings = {
  showNextSteps: boolean;
  showMilestones: boolean;
  useObservationRange: boolean;
};

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  showNextSteps: true,
  showMilestones: true,
  useObservationRange: false,
};

const STORAGE_KEY = 'panacea.learningJourneys.v1';

const SEED: LearningJourney[] = [
  {
    id: 'lj-seed-1',
    name: 'Alex Demo Student Learning Journey',
    studentId: 'st-alex',
    studentName: 'Alex Demo Student',
    createdBy: 'Malika Thimisetty',
    updatedOn: '2026-08-01T10:00:00.000Z',
    status: 'draft',
    dateFrom: '2025-08-03',
    dateTo: '2026-08-03',
    includeStaffOnly: true,
    pdfShowNextSteps: true,
    pdfShowMilestones: true,
    pdfUseObservationRange: false,
  },
  {
    id: 'lj-seed-2',
    name: 'Mia Chen Learning Journey',
    studentId: 'st-mia',
    studentName: 'Mia Chen',
    createdBy: 'Malika Thimisetty',
    updatedOn: '2026-08-03T08:30:00.000Z',
    status: 'shared',
    dateFrom: '2025-08-03',
    dateTo: '2026-08-03',
    includeStaffOnly: false,
    pdfShowNextSteps: true,
    pdfShowMilestones: true,
    pdfUseObservationRange: true,
  },
];

export function loadLearningJourneys(): LearningJourney[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED.map((r) => ({ ...r }));
    }
    const parsed = JSON.parse(raw) as LearningJourney[];
    return Array.isArray(parsed) ? parsed : SEED.map((r) => ({ ...r }));
  } catch {
    return SEED.map((r) => ({ ...r }));
  }
}

export function saveLearningJourneys(rows: LearningJourney[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function formatJourneyDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
