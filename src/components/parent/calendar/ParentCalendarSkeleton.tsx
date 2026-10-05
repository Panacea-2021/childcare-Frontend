'use client';

export function ParentCalendarSkeleton() {
  return (
    <div className="pc-skeleton" aria-busy="true" aria-label="Loading school calendar">
      <div className="pc-skel-filters">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pc-skel-block pc-skel-field" />
        ))}
        <div className="pc-skel-toolbar">
          <div className="pc-skel-block pc-skel-toggle" />
          <div className="pc-skel-block pc-skel-total" />
        </div>
      </div>
      <div className="pc-skel-cal">
        <div className="pc-skel-nav">
          <div className="pc-skel-block pc-skel-month" />
          <div className="pc-skel-block pc-skel-legend" />
        </div>
        <div className="pc-skel-weekdays">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="pc-skel-block pc-skel-dow" />
          ))}
        </div>
        <div className="pc-skel-grid">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="pc-skel-block pc-skel-day">
              {i % 5 === 0 ? <span className="pc-skel-chip" /> : null}
              {i % 7 === 2 ? <span className="pc-skel-chip" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
