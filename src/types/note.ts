export type NoteCategory =
  | 'Medication'
  | 'General Note'
  | 'Food'
  | 'Sleep'
  | 'Behavior'
  | 'Travel'
  | 'Health';

export type NoteReadStatus = 'unread' | 'read';

export type NoteSortOrder = 'newest' | 'oldest';

export interface ParentNote {
  id: string;
  studentName: string;
  studentInitials: string;
  studentPhotoColor: string;
  room: string;
  parentName: string;
  relationship: string;
  date: string;
  time: string;
  timestamp: number;
  category: NoteCategory;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  adminRemarks?: string;
}

export interface NoteFilterState {
  search: string;
  sort: NoteSortOrder;
  readStatus: 'all' | NoteReadStatus;
  category: 'all' | NoteCategory;
  date: string;
}
