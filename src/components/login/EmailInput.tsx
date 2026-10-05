'use client';

import { Mail, Check } from 'lucide-react';

type EmailInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  valid?: boolean;
  disabled?: boolean;
  className?: string;
};

export function EmailInput({
  id = 'login-email',
  value,
  onChange,
  error,
  valid,
  disabled,
  className = '',
}: EmailInputProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={`login-field ${error ? 'is-error' : ''} ${valid ? 'is-valid' : ''} ${className}`.trim()}>
      <label className="login-field-label" htmlFor={id}>
        Email Address
      </label>
      <div className="login-input-wrap">
        <Mail className="login-input-icon" size={18} aria-hidden />
        <input
          id={id}
          className="login-input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Enter your email address"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
        {valid ? <Check className="login-input-success" size={18} aria-hidden /> : null}
      </div>
      {error ? (
        <p id={describedBy} className="login-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
