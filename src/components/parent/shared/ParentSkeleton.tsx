'use client';

import './parent-shared.css';

type Variant = 'list' | 'cards' | 'stats';

type Props = {
  variant?: Variant;
  rows?: number;
};

export function ParentSkeleton({ variant = 'list', rows = 4 }: Props) {
  if (variant === 'stats') {
    return (
      <div className="psh-stats" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="psh-skel-card" />
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="psh-skel" aria-busy="true" aria-label="Loading">
        <div className="psh-skel-line" style={{ width: '40%' }} />
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="psh-skel-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="psh-skel" aria-busy="true" aria-label="Loading">
      <div className="psh-skel-line" style={{ width: '35%' }} />
      <div className="psh-skel-line" style={{ width: '70%' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="psh-skel-row">
          <div className="psh-skel-block" style={{ width: 44, height: 44, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="psh-skel-line" style={{ width: '55%' }} />
            <div className="psh-skel-line" style={{ width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
