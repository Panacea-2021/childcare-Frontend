export type InstallationStatus = 'installed' | 'pending';
export type InvitationStatus = 'sent' | 'not_sent';

export type ParentInfo = {
  id: string;
  name: string;
  email: string;
};

export type InstallationRecord = {
  id: string;
  studentName: string;
  admissionNumber: string;
  campus: string;
  program: string;
  studentStatus: string;
  avatarInitials: string;
  mother: ParentInfo;
  father: ParentInfo;
  /** Successful Parent App install + signup/login only */
  installationStatus: InstallationStatus;
  invitationStatus: InvitationStatus;
  installedOn?: string;
  installedTime?: string;
  lastInviteSent?: string;
  lastInviteTime?: string;
  inviteLink?: string;
};

export type FilterValues = {
  studentQuery: string;
  campus: string;
  studentStatus: string;
  parentInstallationStatus: string;
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
  includeParentEmails: boolean;
  includeInstalledDate: boolean;
  includeInvitationStatus: boolean;
};

export type SortKey =
  | 'studentName'
  | 'admissionNumber'
  | 'campus'
  | 'program'
  | 'invitationStatus'
  | 'installationStatus'
  | 'installedOn'
  | 'lastInviteSent';

export type SortDir = 'asc' | 'desc';
