export type AssessmentScore = 'Emerging' | 'Developing' | 'Proficient' | 'Mastered';

export type StudentAssessment = {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomName: string;
  area: string;
  score: AssessmentScore;
  date: string; // YYYY-MM-DD
  notes?: string;
  updatedBy?: string;
};

export type PortfolioEntry = {
  id: string;
  studentId: string;
  studentName: string;
  roomName: string;
  area: string;
  summary: string;
  date: string; // YYYY-MM-DD
  attachmentUrl?: string;
};

export type AssessmentFilterState = {
  search: string;
  area: string;
  score: AssessmentScore | 'All';
  room: string;
};
