import type { ParentAuthPending, ParentAuthSession, ParentStudentSummary } from './types';

const PENDING_KEY = 'panacea_parent_otp_pending';
const CHALLENGE_KEY = 'panacea_parent_otp_challenge';
const PARENT_SESSION_KEY = 'panacea_parent_auth';

type ChallengeRecord = {
  challengeId: string;
  code: string;
  email: string;
  expiresAt: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function saveParentPending(pending: ParentAuthPending) {
  if (!canUseStorage()) return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function getParentPending(): ParentAuthPending | null {
  if (!canUseStorage()) return null;
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParentAuthPending;
  } catch {
    return null;
  }
}

export function clearParentPending() {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(PENDING_KEY);
  sessionStorage.removeItem(CHALLENGE_KEY);
}

export function saveOtpChallenge(record: ChallengeRecord) {
  if (!canUseStorage()) return;
  sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify(record));
}

export function getOtpChallenge(): ChallengeRecord | null {
  if (!canUseStorage()) return null;
  const raw = sessionStorage.getItem(CHALLENGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChallengeRecord;
  } catch {
    return null;
  }
}

export function saveParentSession(session: ParentAuthSession) {
  if (!canUseStorage()) return;
  localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session));
}

export function getParentSession(): ParentAuthSession | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(PARENT_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParentAuthSession;
  } catch {
    return null;
  }
}

export function clearParentSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(PARENT_SESSION_KEY);
}

export function updateParentSelectedStudent(studentId: string) {
  const session = getParentSession();
  if (!session) return;
  saveParentSession({ ...session, selectedStudentId: studentId });
}

export function setParentStudents(students: ParentStudentSummary[]) {
  const session = getParentSession();
  if (!session) return;
  saveParentSession({ ...session, students });
}

export function isParentVerified() {
  return Boolean(getParentSession()?.verifiedAt);
}

export function hasSelectedStudent() {
  return Boolean(getParentSession()?.selectedStudentId);
}

export function clearAllParentAuth() {
  clearParentPending();
  clearParentSession();
}
