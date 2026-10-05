'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import '@/components/ui/module.css';
import './reset-password.css';

type Visibility = {
  old: boolean;
  next: boolean;
  confirm: boolean;
};

const MOCK_OLD_PASSWORD = 'Welcome@123';

function hasLower(v: string) {
  return /[a-z]/.test(v);
}
function hasUpper(v: string) {
  return /[A-Z]/.test(v);
}
function hasDigit(v: string) {
  return /\d/.test(v);
}
function hasSpecial(v: string) {
  return /[^A-Za-z0-9]/.test(v);
}

export function ResetPasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState<Visibility>({ old: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => [
      { id: 'len', label: 'At least 8 characters', ok: newPassword.length >= 8 },
      { id: 'lower', label: 'One lowercase letter', ok: hasLower(newPassword) },
      { id: 'upper', label: 'One uppercase letter', ok: hasUpper(newPassword) },
      { id: 'digit', label: 'One digit', ok: hasDigit(newPassword) },
      { id: 'special', label: 'One special character', ok: hasSpecial(newPassword) },
    ],
    [newPassword]
  );

  const allRulesOk = rules.every((r) => r.ok);

  const toggle = (key: keyof Visibility) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSave = () => {
    setError('');
    setSuccess('');

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all password fields.');
      return;
    }
    if (oldPassword !== MOCK_OLD_PASSWORD) {
      setError('Old password is incorrect. (Demo: Welcome@123)');
      return;
    }
    if (!allRulesOk) {
      setError('New password does not meet the requirements.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('New password must be different from the old password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSuccess('Password updated successfully. (UI mock — nothing was sent to a server.)');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 450);
  };

  return (
    <div className="mod-page rp-page">
      <nav className="rp-crumbs" aria-label="Breadcrumb">
        <span>Panacea</span>
        <span className="rp-crumbsSep" aria-hidden>
          {'>>'}
        </span>
        <strong>Reset password</strong>
      </nav>

      <div className="rp-titleRow">
        <button
          type="button"
          className="rp-backBtn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 className="rp-pageTitle">Reset Password</h1>
      </div>

      <motion.section
        className="rp-card"
        aria-label="Reset password form"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="rp-cardHead">
          <h2 className="rp-cardTitle">Reset Password</h2>
          <p className="rp-cardSub">Enter your old password, then choose and confirm a new one.</p>
        </div>

        <div className="rp-form">
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-old">
              Old password
            </label>
            <div className="rp-inputWrap">
              <input
                id="rp-old"
                className="ui-input"
                type={show.old ? 'text' : 'password'}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
              />
              <button
                type="button"
                className="rp-eyeBtn"
                aria-label={show.old ? 'Hide old password' : 'Show old password'}
                onClick={() => toggle('old')}
              >
                {show.old ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-new">
              New password
            </label>
            <div className="rp-inputWrap">
              <input
                id="rp-new"
                className="ui-input"
                type={show.next ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="rp-eyeBtn"
                aria-label={show.next ? 'Hide new password' : 'Show new password'}
                onClick={() => toggle('next')}
              >
                {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-confirm">
              Confirm password
            </label>
            <div className="rp-inputWrap">
              <input
                id="rp-confirm"
                className="ui-input"
                type={show.confirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="rp-eyeBtn"
                aria-label={show.confirm ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => toggle('confirm')}
              >
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <p className="rp-rules">
            Please ensure your password contains at least 8 characters, including at least one
            lowercase letter, one uppercase letter, one digit, and one special character.
          </p>

          <ul className="rp-checks" aria-label="Password requirements">
            {rules.map((rule) => (
              <li key={rule.id} className={`rp-check${rule.ok ? ' is-ok' : ''}`}>
                <span className="rp-checkDot" aria-hidden>
                  {rule.ok ? <Check size={10} strokeWidth={3} /> : null}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="err"
                className="rp-error"
                role="alert"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            ) : null}
            {success ? (
              <motion.p
                key="ok"
                className="rp-success"
                role="status"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {success}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="rp-actions">
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
