export type ConcernPriority = 'High' | 'Medium' | 'Low';

export type ConcernStatus = 'Open' | 'In Progress' | 'Resolved';

/** Timeline mirrors real case statuses only. */
export type TimelineStep = ConcernStatus;

export interface ConcernTimelineEvent {
  step: TimelineStep;
  label: string;
  at?: string;
  completed: boolean;
}

export interface ParentConcern {
  id: string;
  title: string;
  description: string;
  studentName: string;
  studentInitials: string;
  studentPhotoColor: string;
  room: string;
  raisedBy: string;
  relationship: string;
  date: string;
  time: string;
  timestamp: number;
  priority: ConcernPriority;
  status: ConcernStatus;
  timeline: ConcernTimelineEvent[];
  adminNotes?: string;
}

export interface ConcernFilterState {
  search: string;
  status: 'all' | ConcernStatus;
  priority: 'all' | ConcernPriority;
  date: string;
}
