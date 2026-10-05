'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="concerns-stack" aria-busy="true" aria-label="Loading concerns">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="concerns-skeleton-card">
          <div className="concerns-skel-ribbon concerns-skel-shimmer" />
          <div className="concerns-skel-row">
            <div className="concerns-skel-circle concerns-skel-shimmer" />
            <div className="concerns-skel-lines">
              <div className="concerns-skel-line concerns-skel-shimmer" style={{ width: '40%' }} />
              <div className="concerns-skel-line concerns-skel-shimmer" style={{ width: '28%' }} />
            </div>
          </div>
          <div className="concerns-skel-line concerns-skel-shimmer" style={{ width: '62%' }} />
          <div className="concerns-skel-line concerns-skel-shimmer" />
          <div className="concerns-skel-line concerns-skel-shimmer" style={{ width: '88%' }} />
        </div>
      ))}
    </div>
  );
}
