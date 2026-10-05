export type ProgressRecordKind = 'observation' | 'reflection' | 'concern';

export type ProgressRecordStatus = 'draft' | 'published';

export type ProgressRecord = {
  id: string;
  kind: ProgressRecordKind;
  status: ProgressRecordStatus;
  date: string;
  hiddenFromParents: boolean;
  studentIds: string[];
  staffIds: string[];
  ageBands: string[];
  developmentAreas: string[];
  lessonIds: string[];
  description: string;
  nextSteps: string;
  mediaNames: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  commentCount: number;
};

export type ProgressRecordDraft = {
  kind: ProgressRecordKind;
  status: ProgressRecordStatus;
  date: string;
  hiddenFromParents: boolean;
  studentIds: string[];
  staffIds: string[];
  ageBands: string[];
  developmentAreas: string[];
  lessonIds: string[];
  description: string;
  nextSteps: string;
  mediaNames: string[];
};
