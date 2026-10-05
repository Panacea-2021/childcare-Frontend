import { clearSession } from '@/lib/auth';
import { PARENT_DEMO_PASSWORD } from './credentials';
import {
  clearParentPending,
  getOtpChallenge,
  getParentPending,
  saveOtpChallenge,
  saveParentPending,
  saveParentSession,
} from './session';
import { getStudentsForParentIdentifier } from './students';
import type { OtpVerifyResult, ParentAuthPending, ParentLoginResult } from './types';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

type ApiOtpSendResponse = {
  challengeId?: string;
  expiresAt?: string;
  message?: string;
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

async function tryApiSendOtp(email: string): Promise<ApiOtpSendResponse | null> {
  // Avoid hanging on default localhost when no backend is configured.
  if (!process.env.NEXT_PUBLIC_API_URL) return null;
  try {
    const { apiGet } = await import('@/lib/api');
    return await apiGet<ApiOtpSendResponse>(
      `/auth/parent/otp/send?email=${encodeURIComponent(email)}`,
    );
  } catch {
    return null;
  }
}

function buildPending(
  email: string,
  method: 'email' | 'phone',
  challengeId: string,
  demoCode?: string,
): ParentAuthPending {
  const now = Date.now();
  return {
    email,
    method,
    challengeId,
    sentAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
    resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),
    demoCode,
  };
}

async function issueLocalChallenge(email: string, method: 'email' | 'phone') {
  const challengeId = createChallengeId();
  const code = generateOtpCode();
  const pending = buildPending(email, method, challengeId, code);

  saveOtpChallenge({
    challengeId,
    code,
    email,
    expiresAt: pending.expiresAt,
  });
  saveParentPending(pending);
  return pending;
}

/**
 * Start parent login: validate credentials, send OTP challenge, persist pending state.
 * Students are resolved after OTP from center student records (not hardcoded in UI).
 */
export async function startParentEmailLogin(
  email: string,
  password: string,
): Promise<ParentLoginResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: 'Email address is required.' };
  if (!password.trim()) return { ok: false, error: 'Password is required.' };
  if (password !== PARENT_DEMO_PASSWORD) {
    return {
      ok: false,
      error: `Incorrect password. Demo password is ${PARENT_DEMO_PASSWORD}.`,
    };
  }

  await delay(450);
  clearSession();

  const api = await tryApiSendOtp(trimmed);
  if (api?.challengeId) {
    const now = Date.now();
    const pending = buildPending(trimmed, 'email', api.challengeId);
    if (api.expiresAt) pending.expiresAt = api.expiresAt;
    pending.resendAvailableAt = new Date(now + RESEND_COOLDOWN_MS).toISOString();
    saveParentPending(pending);
    return { ok: true, pending };
  }

  const pending = await issueLocalChallenge(trimmed, 'email');
  return { ok: true, pending };
}

export async function startParentPhoneLogin(phone: string): Promise<ParentLoginResult> {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return { ok: false, error: 'Enter a valid 10-digit phone number.' };
  }

  await delay(450);
  clearSession();
  const identifier = `+91${digits}`;
  const pending = await issueLocalChallenge(identifier, 'phone');
  return { ok: true, pending };
}

export async function resendParentOtp(): Promise<ParentLoginResult> {
  const existing = getParentPending();
  if (!existing) {
    return { ok: false, error: 'Session expired. Please sign in again.' };
  }

  const now = Date.now();
  if (new Date(existing.resendAvailableAt).getTime() > now) {
    return { ok: false, error: 'Please wait before requesting a new code.' };
  }

  await delay(350);

  const api = await tryApiSendOtp(existing.email);
  if (api?.challengeId) {
    const pending = buildPending(existing.email, existing.method, api.challengeId);
    if (api.expiresAt) pending.expiresAt = api.expiresAt;
    saveParentPending(pending);
    return { ok: true, pending };
  }

  const pending = await issueLocalChallenge(existing.email, existing.method);
  return { ok: true, pending };
}

export async function verifyParentOtp(code: string): Promise<OtpVerifyResult> {
  const pending = getParentPending();
  if (!pending) return { ok: false, reason: 'missing' };

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

  const students = getStudentsForParentIdentifier(pending.email, pending.method);
  saveParentSession({
    email: pending.email,
    verifiedAt: new Date().toISOString(),
    students,
  });
  clearParentPending();
  return { ok: true };
}

export { RESEND_COOLDOWN_MS, OTP_TTL_MS };
