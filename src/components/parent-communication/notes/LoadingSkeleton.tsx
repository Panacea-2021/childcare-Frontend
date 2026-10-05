'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="notes-grid" aria-busy="true" aria-label="Loading notes">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="notes-skeleton-card">
          <div className="notes-skel-row">
            <div className="notes-skel-circle notes-skel-shimmer" />
            <div className="notes-skel-lines">
              <div className="notes-skel-line notes-skel-shimmer" style={{ width: '55%' }} />
              <div className="notes-skel-line notes-skel-shimmer" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="notes-skel-pill notes-skel-shimmer" />
          <div className="notes-skel-line notes-skel-shimmer" />
          <div className="notes-skel-line notes-skel-shimmer" style={{ width: '85%' }} />
          <div className="notes-skel-line notes-skel-shimmer" style={{ width: '70%' }} />
        </div>
      ))}
    </div>
  );
}
