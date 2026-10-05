'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function PasswordInput({
  id = 'login-password',
  value,
  onChange,
  error,
  disabled,
  className = '',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={`login-field ${error ? 'is-error' : ''} ${className}`.trim()}>
      <label className="login-field-label" htmlFor={id}>
        Password
      </label>
      <div className="login-input-wrap">
        <Lock className="login-input-icon" size={18} aria-hidden />
        <input
          id={id}
          className="login-input login-input-password"
          type={visible ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={`login-eye-btn ${visible ? 'is-open' : ''}`}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <span className="login-eye-icon">
            {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </span>
        </button>
      </div>
      {error ? (
        <p id={describedBy} className="login-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
