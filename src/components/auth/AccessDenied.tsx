'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

type AccessDeniedProps = {
  title?: string;
  description?: string;
  homeHref?: string;
};

/** Minimal access-denied panel using existing design tokens / ui-btn. */
export function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this page. Contact your administrator if you need access.',
  homeHref = '/dashboard',
}: AccessDeniedProps) {
  return (
    <div className="mod-page" style={{ maxWidth: 520, margin: '48px auto', textAlign: 'center' }}>
      <div
        className="mod-form-card"
        style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
      >
        <span
          aria-hidden
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldOff size={22} />
        </span>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary, #1F2937)' }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #6B7280)', lineHeight: 1.5 }}>
          {description}
        </p>
        <Link href={homeHref} className="ui-btn ui-btn-primary" style={{ marginTop: 8, textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
