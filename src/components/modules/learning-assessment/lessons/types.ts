export type LessonStatus = 'Draft' | 'Published' | 'Archived';

export type LessonAttachment = {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document';
  url: string;
  size: string;
  thumbnail?: string;
};

export type LessonLabel = {
  id: string;
  name: string;
  color: string;
};

export type Lesson = {
  id: string;
  title: string;
  lessonSet: string;
  roomId: string;
  roomName: string;
  ageBand: string;
  developmentAreas: string[];
  labels: LessonLabel[];
  duration: string;
  customDuration: string;
  descriptionHtml: string;
  youtubeUrl: string;
  attachments: LessonAttachment[];
  status: LessonStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonFormState = {
  title: string;
  lessonSet: string;
  roomId: string;
  ageBand: string;
  developmentAreas: string[];
  labels: LessonLabel[];
  duration: string;
  customDuration: string;
  descriptionHtml: string;
  youtubeUrl: string;
  attachments: LessonAttachment[];
  status: LessonStatus;
};

export type LessonSort = 'newest' | 'oldest' | 'alpha' | 'updated';

export type AiGenerateInput = {
  keywords: string;
  developmentAreas: string[];
  lessonSet: string;
  ageBand: string;
  duration: string;
  teachingStyle: string;
  learningGoal: string;
  difficulty: string;
  teachingTone: string;
};

export const emptyLessonForm = (): LessonFormState => ({
  title: '',
  lessonSet: '',
  roomId: '',
  ageBand: '',
  developmentAreas: [],
  labels: [],
  duration: '30 mins',
  customDuration: '',
  descriptionHtml: '',
  youtubeUrl: '',
  attachments: [],
  status: 'Draft',
});
