'use client';

import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import './loading.css';

type Props = {
  label?: string;
  className?: string;
};

export function SectionLoader({ label = 'Loading…', className = '' }: Props) {
  return (
    <div className={`pl-section${className ? ` ${className}` : ''}`} role="status" aria-live="polite">
      <span className="pl-section__icon" aria-hidden>
        <Sparkles size={20} />
      </span>
      <span>{label}</span>
      <span className="pl-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

export function InlineSpinner({ className = '' }: { className?: string }) {
  return <span className={`pl-spin${className ? ` ${className}` : ''}`} aria-hidden />;
}

export function BusyLabel({ children = 'Processing…' }: { children?: ReactNode }) {
  return (
    <span className="pl-btn-busy">
      <InlineSpinner />
      {children}
    </span>
  );
}
