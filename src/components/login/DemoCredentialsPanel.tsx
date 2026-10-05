'use client';

import { PARENT_DEMO_ACCOUNTS } from '@/lib/parent-auth';

type DemoCredentialsPanelProps = {
  onApply: (email: string) => void;
  disabled?: boolean;
};

export function DemoCredentialsPanel({ onApply, disabled = false }: DemoCredentialsPanelProps) {
  return (
    <aside
      className="login-demo-panel login-anim login-anim-card"
      aria-label="Demo parent credentials"
    >
      <p className="login-demo-title">Demo parent credentials</p>
      <ul className="login-demo-list">
        {PARENT_DEMO_ACCOUNTS.map((account) => (
          <li key={account.email} className="login-demo-item">
            <button type="button" disabled={disabled} onClick={() => onApply(account.email)}>
              {account.email}
            </button>
            <span>
              {account.label} · password {account.password} · {account.hint}
            </span>
          </li>
        ))}
      </ul>
      <p className="login-staff-note">
        Center staff: use Google or Microsoft on the login card to open the staff dashboard.
      </p>
    </aside>
  );
}
