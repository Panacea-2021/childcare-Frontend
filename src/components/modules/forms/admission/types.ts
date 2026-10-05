export type ProcessStatus = 'Live' | 'Draft';

export type StudentProcessStatus = 'Done' | 'In Progress' | 'Pending';

export type AdmissionStepForm = {
  id: string;
  formId: string;
  formName: string;
};

export type AdmissionStep = {
  id: string;
  name: string;
  category?: string;
  forms: AdmissionStepForm[];
};

export type AdmissionStudentProgress = {
  id: string;
  name: string;
  status: StudentProcessStatus;
  /** 0–100 */
  progress: number;
  room: string;
  group: string;
  program: string;
};

export type AdmissionProcess = {
  id: string;
  name: string;
  status: ProcessStatus;
  dueDate?: string;
  totalStudents: number;
  steps: AdmissionStep[];
  students: AdmissionStudentProgress[];
};

export type AdmissionShareAudience = 'prospect' | 'parent' | 'public';

export type AdmissionShareRecord = {
  id: string;
  processId: string;
  processName: string;
  audience: AdmissionShareAudience;
  recipientId: string;
  recipientName: string;
  parentContact?: string;
  sharedAt: string;
  fillUrl: string;
};
