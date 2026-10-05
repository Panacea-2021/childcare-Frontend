export type ReportStatus =
  | 'draft'
  | 'completed'
  | 'partially_completed'
  | 'sent'
  | 'pending';

export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface ChecklistItemDef {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  isSystem: boolean;
  key: string;
}

export interface IncidentDetails {
  type: string;
  description: string;
  severity: IncidentSeverity;
  notifyParent: boolean;
  photoName?: string;
}

export interface ChecklistItemEntry {
  itemId: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  remarks?: string;
  incident?: IncidentDetails;
}

/** One daily report row = one room for a given date. */
export interface RoomDailyReport {
  id: string;
  room: string;
  date: string;
  studentCount: number;
  presentCount: number;
  items: ChecklistItemEntry[];
  /** Extra checklist columns that only apply to this room. */
  extraItems: ChecklistItemDef[];
  overallNotes?: string;
  status: ReportStatus;
  completionPercent: number;
  notifyParent: boolean;
  hasIncident: boolean;
}

export interface DailyReportFilterState {
  room: string;
  search: string;
}

export interface DailyReportToast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface GenerateReportFormValues {
  room: string;
  date: string;
  overallNotes: string;
  notifyParent: boolean;
  itemIds: string[];
  remarks: Record<string, string>;
}
