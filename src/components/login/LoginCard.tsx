'use client';

import { useCallback, useState } from 'react';
import { LoginForm } from './LoginForm';
import { DemoCredentialsPanel } from './DemoCredentialsPanel';

export function LoginCard() {
  const [busy, setBusy] = useState(false);
  const [applyDemo, setApplyDemo] = useState<((email: string) => void) | null>(null);

  const registerApplyDemo = useCallback((apply: (email: string) => void) => {
    setApplyDemo(() => apply);
  }, []);

  return (
    <div className="login-layout">
      <div className="login-card login-anim login-anim-card">
        <LoginForm onBusyChange={setBusy} onRegisterApplyDemo={registerApplyDemo} />
      </div>

      <DemoCredentialsPanel
        disabled={busy}
        onApply={(email) => applyDemo?.(email)}
      />
    </div>
  );
}
