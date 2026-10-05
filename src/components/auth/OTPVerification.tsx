'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import {
  getParentPending,
  getParentSession,
  resendParentOtp,
  updateParentSelectedStudent,
  verifyParentOtp,
  type ParentAuthPending,
} from '@/lib/parent-auth';
import { getStaffPending, startStaffPhoneLogin, verifyStaffOtp } from '@/lib/staff-auth/otp';
import { PARENT_PORTAL_HOME } from '@/lib/parent-modules';
import { AuthShell } from './AuthShell';
import { OTPInput } from './OTPInput';
import { ResendOTP } from './ResendOTP';

type OtpUiError = 'invalid' | 'expired' | null;

export function OTPVerification() {
  const router = useRouter();
  const [pending, setPending] = useState<ParentAuthPending | null>(null);
  const [isStaffOtp, setIsStaffOtp] = useState(false);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<OtpUiError>(null);
  const [shake, setShake] = useState(false);
  const [resending, setResending] = useState(false);
  const submittingRef = useRef(false);
  const isStaffRef = useRef(false);

  useEffect(() => {
    const staffPending = getStaffPending();
    if (staffPending?.kind === 'staff') {
      setPending(staffPending);
      setIsStaffOtp(true);
      isStaffRef.current = true;
      setReady(true);
      return;
    }
    const current = getParentPending();
    if (!current) {
      router.replace('/login');
      return;
    }
    setPending(current);
    setIsStaffOtp(false);
    isStaffRef.current = false;
    setReady(true);
  }, [router]);

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }

  async function routeAfterSuccess() {
    if (isStaffRef.current) {
      router.push('/dashboard');
      return;
    }

    const session = getParentSession();
    const students = session?.students ?? [];

    if (students.length === 0) {
      router.push('/select-student');
      return;
    }

    if (students.length === 1) {
      updateParentSelectedStudent(students[0].id);
      router.push(PARENT_PORTAL_HOME);
      return;
    }

    router.push('/select-student');
  }

  async function handleVerify(nextCode: string) {
    if (submittingRef.current || verifying || success) return;
    if (nextCode.length !== 6) return;

    submittingRef.current = true;
    setVerifying(true);
    setError(null);

    try {
      if (isStaffRef.current) {
        const result = await verifyStaffOtp(nextCode);
        if (!result.ok) {
          setError(result.reason === 'expired' ? 'expired' : 'invalid');
          triggerShake();
          setCode('');
          setVerifying(false);
          submittingRef.current = false;
          return;
        }
      } else {
        const result = await verifyParentOtp(nextCode);
        if (!result.ok) {
          setError(result.reason === 'expired' ? 'expired' : 'invalid');
          triggerShake();
          setCode('');
          setVerifying(false);
          submittingRef.current = false;
          return;
        }
      }

      setSuccess(true);
      window.setTimeout(() => {
        void routeAfterSuccess();
      }, 420);
    } catch {
      setError('invalid');
      triggerShake();
      setCode('');
      setVerifying(false);
      submittingRef.current = false;
    }
  }

  async function handleResend() {
    if (resending) return;
    setResending(true);
    setError(null);
    setCode('');
    try {
      if (isStaffRef.current && pending) {
        const digits = pending.email.replace(/\D/g, '').slice(-10);
        const result = await startStaffPhoneLogin(digits);
        if (!result.ok) {
          setError('expired');
          return;
        }
        setPending(result.pending);
        return;
      }
      const result = await resendParentOtp();
      if (!result.ok) {
        setError('expired');
        return;
      }
      setPending(result.pending);
    } finally {
      setResending(false);
    }
  }

  if (!ready || !pending) {
    return (
      <AuthShell brandMessage="Preparing verification…">
        <div className="auth-loading" aria-busy="true">
          Loading…
        </div>
      </AuthShell>
    );
  }

  const displayEmail = pending.email;

  return (
    <AuthShell brandMessage="One quick step to keep your account safe.">
      <div className={`otp-panel ${shake ? 'is-shaking' : ''}`.trim()}>
        {success ? (
          <div className="otp-success" role="status" aria-live="polite">
            <span className="otp-success-icon" aria-hidden>
              <Check size={28} strokeWidth={2.5} />
            </span>
            <h1 className="login-form-title">
              {pending.method === 'phone' ? 'Phone verified' : 'Email verified'}
            </h1>
            <p className="login-form-subtitle">Continuing…</p>
          </div>
        ) : (
          <>
            <div className="login-form-header login-anim login-anim-d1">
              <h1 className="login-form-title">
                {pending.method === 'phone' ? 'Verify Your Phone' : 'Verify Your Email'}
              </h1>
              <p className="login-form-subtitle">
                We&apos;ve sent a verification code to
              </p>
              {pending.method === 'phone' ? (
                <span className="otp-email-pill">{displayEmail}</span>
              ) : (
                <a className="otp-email-pill" href={`mailto:${displayEmail}`}>
                  {displayEmail}
                </a>
              )}
            </div>

            {pending.demoCode ? (
              <div className="otp-demo-banner login-anim login-anim-d2" role="note">
                <strong>Demo code:</strong> {pending.demoCode}
                <span> (no email gateway in this build)</span>
              </div>
            ) : null}

            {error === 'invalid' ? (
              <div className="login-auth-error" role="alert">
                <strong>Incorrect verification code</strong>
                <p>Please check the code and try again.</p>
              </div>
            ) : null}

            {error === 'expired' ? (
              <div className="login-auth-error" role="alert">
                <strong>This code has expired</strong>
                <p>Request a new verification code to continue.</p>
              </div>
            ) : null}

            <div className="otp-input-wrap login-anim login-anim-d3">
              <OTPInput
                value={code}
                disabled={verifying}
                error={Boolean(error)}
                onChange={(next) => {
                  setCode(next);
                  if (error) setError(null);
                }}
                onComplete={(next) => void handleVerify(next)}
              />
            </div>

            <ResendOTP
              resendAvailableAt={pending.resendAvailableAt}
              onResend={handleResend}
              loading={resending}
              disabled={verifying}
            />

            <button
              type="button"
              className="otp-change-email login-anim login-anim-d5"
              disabled={verifying || resending}
              onClick={() => router.push('/login')}
            >
              {isStaffOtp || pending.method === 'phone' ? 'Use a different number' : 'Use a different email'}
            </button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
