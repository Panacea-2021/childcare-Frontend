import type { ProgressStatus } from './progressTracking';

export type BoardStage = Exclude<ProgressStatus, 'none'>;

export type BoardCard = {
  id: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  ageBand: string;
  category: string;
  group: string;
  stage: BoardStage;
  note: string;
  author: string;
  updatedLabel: string;
  hiddenFromParents?: boolean;
  date?: string;
};

export type LessonDetail = {
  id: string;
  title: string;
  updatedLabel: string;
  category: string;
  lessonSet: string;
  ages: string;
  group: string;
  whatIsIt: string;
  why: string[];
  atHome: string[];
  roomId?: string;
  durationMin?: string;
  youtubeUrl?: string;
  label?: string;
  description?: string;
  developmentAreas?: string[];
  groups?: string[];
  lessonSets?: string[];
  ageBands?: string[];
};

export type EditableLesson = {
  id: string;
  title: string;
  updatedLabel: string;
  lessonSets: string[];
  roomId: string;
  ageBands: string[];
  description: string;
  durationMin: string;
  youtubeUrl: string;
  developmentAreas: string[];
  groups: string[];
  label: string;
};
