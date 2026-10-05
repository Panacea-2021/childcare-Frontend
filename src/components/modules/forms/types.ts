export type FormStatus = 'Live' | 'Draft';

export type FormType = 'Student' | 'Staff' | 'Enquiry';

export type FormCategory =
  | 'Admissions'
  | 'Operations'
  | 'Parent Communication'
  | 'Staff Management';

export type FormAnalytics = {
  submitted: number;
  rejected: number;
  changesRequested: number;
  pendingReview: number;
  pendingSubmission: number;
};

export type FormItem = {
  id: string;
  name: string;
  status: FormStatus;
  date: string;
  durationMin?: number;
  type: FormType;
  category: FormCategory;
  analytics: FormAnalytics;
  sharedWith?: number;
  openUntil?: string;
};

export type FormSubmission = {
  id: string;
  studentName: string;
  sharedOn: string;
  status: 'Approved' | 'Rejected' | 'Changes Requested' | 'Pending Review' | 'Pending Submission';
  expiryDate: string;
  expirySchedule: string;
};

export type StatusFilter = 'All' | 'Live' | 'Draft';

export type Audience = 'Student' | 'Staff' | 'Enquiry';

export type StartingPoint = 'scratch' | 'pdf' | 'ai' | null;

export type FormTemplate = {
  id: string;
  audience: Audience;
  title: string;
  description: string;
  icon:
    | 'rsvp'
    | 'feedback'
    | 'volunteer'
    | 'attendance'
    | 'incident'
    | 'document'
    | 'onboarding'
    | 'staff-feedback'
    | 'training'
    | 'checklist'
    | 'registration'
    | 'waitlist';
};
