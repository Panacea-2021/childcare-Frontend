'use client';

export function LoadingSkeleton() {
  return (
    <div className="sa-skeleton-grid" aria-busy="true" aria-label="Loading announcements">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sa-skel" />
      ))}
    </div>
  );
}
