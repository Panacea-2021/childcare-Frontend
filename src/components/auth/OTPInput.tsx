'use client';

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
} from 'react';

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
};

export function OTPInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const baseId = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const firstEmpty = digits.findIndex((d) => !d);
    const index = firstEmpty === -1 ? 0 : firstEmpty;
    inputsRef.current[index]?.focus();
  }, [autoFocus, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (joined.length === length) {
      onComplete?.(joined);
    }
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      setDigit(index, '');
      return;
    }

    if (cleaned.length > 1) {
      // Multi-digit paste into one box
      const chars = cleaned.slice(0, length - index).split('');
      const next = digits.slice();
      chars.forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      const joined = next.join('').slice(0, length);
      onChange(joined);
      const focusAt = Math.min(index + chars.length, length - 1);
      inputsRef.current[focusAt]?.focus();
      if (joined.length === length) onComplete?.(joined);
      return;
    }

    setDigit(index, cleaned);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '');
        return;
      }
      if (index > 0) {
        e.preventDefault();
        setDigit(index - 1, '');
        inputsRef.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusAt = Math.min(pasted.length, length) - 1;
    inputsRef.current[Math.max(focusAt, 0)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  }

  return (
    <div
      className={`otp-boxes ${error ? 'is-error' : ''}`.trim()}
      role="group"
      aria-label={`${length}-digit verification code`}
    >
      {digits.map((digit, index) => (
        <input
          key={`${baseId}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={`${baseId}-${index}`}
          className="otp-box"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
