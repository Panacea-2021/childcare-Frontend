'use client';

export function LoadingSkeleton() {
  return (
    <div className="dr-skeleton" aria-hidden>
      <div className="dr-skel dr-skel-header" />
      <div className="dr-skel-stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="dr-skel" />
        ))}
      </div>
      <div className="dr-skel" style={{ height: 120 }} />
      <div className="dr-skel dr-skel-table" />
    </div>
  );
}
