'use client';

import { useEffect, useState } from 'react';

type ResendOTPProps = {
  resendAvailableAt: string;
  onResend: () => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
};

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ResendOTP({
  resendAvailableAt,
  onResend,
  disabled = false,
  loading = false,
}: ResendOTPProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function tick() {
      const ms = new Date(resendAvailableAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.ceil(ms / 1000)));
    }
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [resendAvailableAt]);

  const coolingDown = remaining > 0;

  return (
    <div className="otp-resend login-anim login-anim-d5">
      <p className="otp-resend-label">Didn&apos;t receive the code?</p>
      {coolingDown ? (
        <p className="otp-resend-timer" aria-live="polite">
          Resend code in {formatCountdown(remaining)}
        </p>
      ) : (
        <button
          type="button"
          className="otp-resend-btn"
          disabled={disabled || loading}
          onClick={() => void onResend()}
        >
          {loading ? 'Sending...' : 'Resend Code'}
        </button>
      )}
    </div>
  );
}
