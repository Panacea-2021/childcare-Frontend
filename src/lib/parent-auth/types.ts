export type ParentStudentSummary = {
  id: string;
  name: string;
  preferredName?: string;
  gender?: string;
  photoUrl?: string;
  roomName?: string;
  programName?: string;
  status?: string;
  ageLabel?: string;
};

export type ParentAuthPending = {
  email: string;
  method: 'email' | 'phone';
  challengeId: string;
  sentAt: string;
  expiresAt: string;
  resendAvailableAt: string;
  /** Demo-only: generated code shown in UI because no email gateway exists yet */
  demoCode?: string;
};

export type ParentAuthSession = {
  email: string;
  verifiedAt: string;
  students: ParentStudentSummary[];
  selectedStudentId?: string;
};

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'expired' | 'missing' };

export type ParentLoginResult =
  | { ok: true; pending: ParentAuthPending }
  | { ok: false; error: string };
