export type ProfileAssessmentStatus = 'draft' | 'published';

export type AssessmentTemplate = {
  id: string;
  name: string;
  scaleId: string;
  description: string;
};

export type ProfileAssessment = {
  id: string;
  studentId: string;
  templateId: string;
  templateName: string;
  scaleId: string;
  periodFrom: string;
  periodTo: string;
  staffComments: string;
  nextSteps: string;
  mediaNames: string[];
  sharedWithParents: boolean;
  status: ProfileAssessmentStatus;
  areaLevels: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  authorName: string;
};

export type ProfileAssessmentDraft = {
  templateId: string;
  periodFrom: string;
  periodTo: string;
  staffComments: string;
  nextSteps: string;
  mediaNames: string[];
  sharedWithParents: boolean;
  status: ProfileAssessmentStatus;
  areaLevels: Record<string, string>;
};
