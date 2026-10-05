/**
 * Staff phone OTP — reuses the same OTP challenge / pending storage as parent auth.
 * Does not change OTP generation, TTL, or verification mechanics.
 */

import { saveSession, type AuthSession } from '@/lib/auth';
import { clearSession } from '@/lib/auth';
import {
  clearParentPending,
  getOtpChallenge,
  getParentPending,
  saveOtpChallenge,
  saveParentPending,
} from '@/lib/parent-auth/session';
import type { ParentAuthPending, ParentLoginResult } from '@/lib/parent-auth/types';
import { findStaffByPhone, findStaffById, buildMePermissions } from '@/lib/access-control/mePermissions';
import { ensureRolePermissionsSeeded } from '@/lib/access-control/rolePermissionStore';
import type { StaffMember } from '@/lib/center-management/staffStore';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const STAFF_PENDING_KEY = 'panacea_staff_otp_pending';

export type StaffOtpPending = ParentAuthPending & {
  kind: 'staff';
  staffId: string;
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createChallengeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `otp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateOtpCode() {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, '0');
}

function saveStaffPending(pending: StaffOtpPending) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STAFF_PENDING_KEY, JSON.stringify(pending));
  saveParentPending(pending);
}

export function getStaffPending(): StaffOtpPending | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STAFF_PENDING_KEY);
    if (!raw) {
      const parent = getParentPending() as StaffOtpPending | null;
      if (parent && (parent as StaffOtpPending).kind === 'staff') return parent;
      return null;
    }
    return JSON.parse(raw) as StaffOtpPending;
  } catch {
    return null;
  }
}

export function clearStaffPending() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STAFF_PENDING_KEY);
}

export function buildStaffAuthSession(
  staff: StaffMember,
  method: AuthSession['method'],
): AuthSession {
  ensureRolePermissionsSeeded();
  const me = buildMePermissions(staff);
  return {
    method,
    identifier: method === 'phone' ? staff.phone : staff.email,
    loggedInAt: new Date().toISOString(),
    staffId: staff.id,
    roleName: me.user.roleName,
    centerId: staff.centerId,
    name: staff.name,
  };
}

export async function startStaffPhoneLogin(phone: string): Promise<ParentLoginResult> {
  const staff = findStaffByPhone(phone);
  if (!staff) {
    return { ok: false, error: 'No active staff account found for this mobile number.' };
  }

  await delay(450);
  clearSession();
  clearStaffPending();

  const digits = phone.replace(/\D/g, '');
  const identifier = `+91${digits.slice(-10)}`;
  const challengeId = createChallengeId();
  const code = generateOtpCode();
  const now = Date.now();

  const pending: StaffOtpPending = {
    kind: 'staff',
    staffId: staff.id,
    email: identifier,
    method: 'phone',
    challengeId,
    sentAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
    resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),
    demoCode: code,
  };

  saveOtpChallenge({
    challengeId,
    code,
    email: identifier,
    expiresAt: pending.expiresAt,
  });
  saveStaffPending(pending);
  return { ok: true, pending };
}

export type StaffOtpVerifyResult =
  | { ok: true; session: AuthSession }
  | { ok: false; reason: 'invalid' | 'expired' | 'missing' | 'staff' };

export async function verifyStaffOtp(code: string): Promise<StaffOtpVerifyResult> {
  const pending = getStaffPending();
  if (!pending || pending.kind !== 'staff') {
    return { ok: false, reason: 'missing' };
  }

  await delay(280);

  const now = Date.now();
  if (new Date(pending.expiresAt).getTime() <= now) {
    return { ok: false, reason: 'expired' };
  }

  const challenge = getOtpChallenge();
  const expected = challenge?.code ?? pending.demoCode;
  if (!expected || expected !== code) {
    return { ok: false, reason: 'invalid' };
  }

  const member = findStaffById(pending.staffId);
  if (!member || member.status !== 'Active') {
    return { ok: false, reason: 'staff' };
  }

  const session = buildStaffAuthSession(member, 'phone');
  saveSession(session);
  clearStaffPending();
  clearParentPending();
  return { ok: true, session };
}

export function completeStaffIdentityLogin(
  staff: StaffMember,
  method: AuthSession['method'],
): AuthSession {
  const session = buildStaffAuthSession(staff, method);
  saveSession(session);
  return session;
}
