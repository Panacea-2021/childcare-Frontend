'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Phone, Smartphone } from 'lucide-react';
import { saveSession, type AuthSession } from '@/lib/auth';
import { PARENT_DEMO_PASSWORD, startParentEmailLogin, startParentPhoneLogin } from '@/lib/parent-auth';
import { findStaffByPhone, resolveStaffForSession } from '@/lib/access-control/mePermissions';
import { completeStaffIdentityLogin, startStaffPhoneLogin } from '@/lib/staff-auth/otp';
import { loadStaff } from '@/lib/center-management/staffStore';
import { ensureRolePermissionsSeeded } from '@/lib/access-control/rolePermissionStore';
import { EmailInput } from '@/components/login/EmailInput';
import { PasswordInput } from '@/components/login/PasswordInput';
import { LoadingButton } from '@/components/login/LoadingButton';
import '@/components/auth/auth-flow.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = 'panacea_login_remember';

type Mode = 'email' | 'phone';
type LoadingMethod = AuthSession['method'] | 'parent' | null;

type FieldErrors = {
  email?: string;
  password?: string;
  phone?: string;
};

type LoginFormProps = {
  onBusyChange?: (busy: boolean) => void;
  onRegisterApplyDemo?: (apply: (email: string) => void) => void;
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-2.9-11.3-7.1l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l.1.1 6.3 5.3C39 40.4 44 36 44 24c0-1.3-.1-2.7-.4-3.9z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

export function LoginForm({ onBusyChange, onRegisterApplyDemo }: LoginFormProps = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState('');
  const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
  const [shake, setShake] = useState(false);

  const loading = loadingMethod !== null;
  const emailTrimmed = email.trim();
  const emailValid = EMAIL_RE.test(emailTrimmed);

  useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function applyDemoAccount(demoEmail: string) {
    setMode('email');
    setEmail(demoEmail);
    setPassword(PARENT_DEMO_PASSWORD);
    setErrors({});
    setAuthError('');
  }

  useEffect(() => {
    onRegisterApplyDemo?.(applyDemoAccount);
  }, [onRegisterApplyDemo]);

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }

  function validateEmail(): FieldErrors {
    const next: FieldErrors = {};
    if (!emailTrimmed) {
      next.email = 'Email address is required.';
    } else if (!emailValid) {
      next.email = 'Please enter a valid email address.';
    }
    if (!password) {
      next.password = 'Password is required.';
    }
    return next;
  }

  function validatePhone(): FieldErrors {
    const next: FieldErrors = {};
    if (!phone.trim()) {
      next.phone = 'Phone number is required.';
    } else if (phone.trim().length < 10) {
      next.phone = 'Enter a valid 10-digit phone number.';
    }
    return next;
  }

  /** Staff / social login — binds to staff record; role comes from staff → RolePermission */
  async function completeStaffLogin(method: AuthSession['method'], identifier: string) {
    setLoadingMethod(method);
    setAuthError('');
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      ensureRolePermissionsSeeded();

      let staff =
        identifier.includes('@')
          ? loadStaff().find(
              (s) => s.status === 'Active' && s.email.toLowerCase() === identifier.toLowerCase(),
            ) ?? null
          : null;

      if (!staff) {
        // Social demo: bind to staff resolved from a temporary session shape
        saveSession({ method, identifier, loggedInAt: new Date().toISOString() });
        staff = resolveStaffForSession({
          method,
          identifier,
          loggedInAt: new Date().toISOString(),
        });
      }

      if (!staff) {
        setAuthError('No staff profile is linked to this login. Contact your administrator.');
        triggerShake();
        setLoadingMethod(null);
        return;
      }

      completeStaffIdentityLogin(staff, method);
      router.push('/dashboard');
    } catch {
      setAuthError('Unable to sign in. Please try again.');
      triggerShake();
      setLoadingMethod(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setAuthError('');

    if (mode === 'phone') {
      const nextErrors = validatePhone();
      setErrors(nextErrors);
      if (nextErrors.phone) {
        triggerShake();
        return;
      }

      setLoadingMethod('parent');
      try {
        // Staff mobile → existing OTP challenge → staff session (role from staff record)
        const staffMatch = findStaffByPhone(phone.trim());
        if (staffMatch) {
          const result = await startStaffPhoneLogin(phone.trim());
          if (!result.ok) {
            setAuthError(result.error);
            triggerShake();
            setLoadingMethod(null);
            return;
          }
          router.push('/verify-otp');
          return;
        }

        const result = await startParentPhoneLogin(phone.trim());
        if (!result.ok) {
          setAuthError(result.error);
          triggerShake();
          setLoadingMethod(null);
          return;
        }
        router.push('/verify-otp');
      } catch {
        setAuthError('Unable to send verification code. Please try again.');
        triggerShake();
        setLoadingMethod(null);
      }
      return;
    }

    const nextErrors = validateEmail();
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      triggerShake();
      return;
    }

    setLoadingMethod('parent');
    try {
      if (remember) {
        try {
          localStorage.setItem(REMEMBER_KEY, emailTrimmed);
        } catch {
          /* ignore */
        }
      } else {
        try {
          localStorage.removeItem(REMEMBER_KEY);
        } catch {
          /* ignore */
        }
      }

      const result = await startParentEmailLogin(emailTrimmed, password);
      if (!result.ok) {
        setAuthError(result.error);
        triggerShake();
        setLoadingMethod(null);
        return;
      }
      router.push('/verify-otp');
    } catch {
      setAuthError('Unable to sign in. Please try again.');
      triggerShake();
      setLoadingMethod(null);
    }
  }

  function switchMode(next: Mode) {
    if (loading || next === mode) return;
    setMode(next);
    setErrors({});
    setAuthError('');
  }

  return (
    <form
      className={`login-form ${shake ? 'is-shaking' : ''}`}
      onSubmit={onSubmit}
      noValidate
    >
      <div className="login-form-header login-anim login-anim-d1">
        <h1 className="login-form-title">Welcome Back!</h1>
        <p className="login-form-subtitle">Continue to your Parent Portal</p>
      </div>

      <div className="login-mode-tabs login-anim login-anim-d1" role="tablist" aria-label="Login method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'email'}
          className={`login-mode-tab ${mode === 'email' ? 'is-active' : ''}`}
          disabled={loading}
          onClick={() => switchMode('email')}
        >
          <Mail size={16} aria-hidden />
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'phone'}
          className={`login-mode-tab ${mode === 'phone' ? 'is-active' : ''}`}
          disabled={loading}
          onClick={() => switchMode('phone')}
        >
          <Smartphone size={16} aria-hidden />
          Phone
        </button>
      </div>

      {authError ? (
        <div className="login-auth-error" role="alert">
          {authError}
        </div>
      ) : null}

      {mode === 'email' ? (
        <>
          <EmailInput
            className="login-anim login-anim-d2"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (authError) setAuthError('');
            }}
            error={errors.email}
            valid={emailTrimmed.length > 0 && emailValid && !errors.email}
            disabled={loading}
          />

          <PasswordInput
            className="login-anim login-anim-d3"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (authError) setAuthError('');
            }}
            error={errors.password}
            disabled={loading}
          />

          <div className="login-form-meta login-anim login-anim-d4">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                disabled={loading}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="login-forgot"
              disabled={loading}
              onClick={() =>
                setAuthError('Please contact your center administrator to reset your password.')
              }
            >
              Forgot Password?
            </button>
          </div>

          <div className="login-anim login-anim-d5">
            <LoadingButton
              loading={loadingMethod === 'parent' && mode === 'email'}
              disabled={loading}
              loadingLabel="Sending code..."
            >
              Login
            </LoadingButton>
          </div>
        </>
      ) : (
        <>
          <div
            className={`login-field login-anim login-anim-d2 ${errors.phone ? 'is-error' : ''}`}
          >
            <label className="login-field-label" htmlFor="login-phone">
              Phone Number
            </label>
            <div className="login-phone-wrap">
              <div className="login-country" aria-label="Country code India +91">
                <span>IN</span>
                <span>+91</span>
                <span className="login-caret" aria-hidden>
                  ▾
                </span>
              </div>
              <div className="login-phone-input-wrap">
                <Phone className="login-input-icon" size={18} aria-hidden />
                <input
                  id="login-phone"
                  className="login-input login-phone-input"
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Enter phone number"
                  value={phone}
                  disabled={loading}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'login-phone-error' : undefined}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    if (authError) setAuthError('');
                  }}
                />
              </div>
            </div>
            {errors.phone ? (
              <p id="login-phone-error" className="login-field-error" role="alert">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div className="login-anim login-anim-d3">
            <LoadingButton
              loading={loadingMethod === 'parent' && mode === 'phone'}
              disabled={loading}
              loadingLabel="Sending code..."
            >
              Verify Phone Number
            </LoadingButton>
          </div>
        </>
      )}

      <div className="login-divider login-anim login-anim-d5" aria-hidden={false}>
        <span>Or continue with</span>
      </div>

      <div className="login-socials login-anim login-anim-d5">
        <button
          type="button"
          className="login-social-btn"
          disabled={loading}
          onClick={() => completeStaffLogin('google', 'google-user')}
        >
          {loadingMethod === 'google' ? (
            <Loader2 className="login-submit-spinner" size={18} aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          <span>Google</span>
        </button>
        <button
          type="button"
          className="login-social-btn"
          disabled={loading}
          onClick={() => completeStaffLogin('microsoft', 'microsoft-user')}
        >
          {loadingMethod === 'microsoft' ? (
            <Loader2 className="login-submit-spinner" size={18} aria-hidden />
          ) : (
            <MicrosoftIcon />
          )}
          <span>Microsoft</span>
        </button>
      </div>
    </form>
  );
}
