export type InstallationStatus = 'installed' | 'pending';
export type InvitationStatus = 'sent' | 'not_sent';

export type StaffInstallationRecord = {
  id: string;
  staffName: string;
  employeeId: string;
  campus: string;
  department: string;
  designation: string;
  staffStatus: string;
  email: string;
  phone?: string;
  avatarInitials: string;
  /** Successful Staff App install + signup/login only */
  installationStatus: InstallationStatus;
  invitationStatus: InvitationStatus;
  installedOn?: string;
  installedTime?: string;
  lastInviteSent?: string;
  lastInviteTime?: string;
  inviteLink?: string;
};

export type FilterValues = {
  staffQuery: string;
  campus: string;
  staffStatus: string;
  staffInstallationStatus: string;
  invitationStatus: string;
};

export type EmailTemplate = {
  subject: string;
  body: string;
};

export type ToastKind = 'ok' | 'err';
export type ToastState = { type: ToastKind; message: string } | null;

export type ExportScope = 'current_page' | 'filtered' | 'entire';
export type ExportFormat = 'excel' | 'csv' | 'pdf';

export type ExportOptions = {
  scope: ExportScope;
  format: ExportFormat;
  includeStaffEmail: boolean;
  includeInstalledDate: boolean;
  includeInvitationStatus: boolean;
};

export type SortKey =
  | 'staffName'
  | 'employeeId'
  | 'campus'
  | 'department'
  | 'designation'
  | 'email'
  | 'invitationStatus'
  | 'installationStatus'
  | 'installedOn'
  | 'lastInviteSent';

export type SortDir = 'asc' | 'desc';
