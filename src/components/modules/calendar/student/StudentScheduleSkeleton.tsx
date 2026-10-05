'use client';

export function StudentScheduleSkeleton() {
  return (
    <div className="ss-skeleton" aria-busy="true" aria-label="Loading student schedule">
      <div className="ss-skel-block ss-skel-header" />
      <div className="ss-skel-summary">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ss-skel-block" />
        ))}
      </div>
      <div className="ss-skel-block ss-skel-filters" />
      <div className="ss-skel-block ss-skel-grid" />
    </div>
  );
}
