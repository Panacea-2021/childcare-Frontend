'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type LoadingButtonProps = {
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  loadingLabel?: string;
};

export function LoadingButton({
  loading = false,
  disabled = false,
  children,
  loadingLabel = 'Signing in...',
}: LoadingButtonProps) {
  return (
    <button
      type="submit"
      className={`login-submit-btn ${loading ? 'is-loading' : ''}`}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader2 className="login-submit-spinner" size={18} aria-hidden />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
