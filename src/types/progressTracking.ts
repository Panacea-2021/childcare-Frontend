export type ProgressStatus = 'planned' | 'introduced' | 'practiced' | 'mastered' | 'none';

export type ProgressStudent = {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  tone: 'mint' | 'lavender' | 'coral' | 'sky' | 'rose' | 'violet' | 'amber';
  room: string;
};

export type ProgressLesson = {
  id: string;
  title: string;
  ageBand?: string;
  statuses: Record<string, ProgressStatus>;
};

export type ProgressSubCategory = {
  id: string;
  name: string;
  lessons: ProgressLesson[];
};

export type ProgressCategory = {
  id: string;
  name: string;
  /** Display count in Illumine (can be larger than mock lessons). */
  displayCount: number;
  subcategories: ProgressSubCategory[];
};

export type LessonSetOption = {
  id: string;
  name: string;
};

export type ProgressRecordDraft = {
  date: string;
  hiddenFromParents: boolean;
  stage: Exclude<ProgressStatus, 'none' | 'planned'> | null;
  note: string;
  studentIds: string[];
  lessonIds: string[];
};
