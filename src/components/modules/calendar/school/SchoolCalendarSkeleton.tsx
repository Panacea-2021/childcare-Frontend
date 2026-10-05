'use client';

export function SchoolCalendarSkeleton() {
  return (
    <div className="sc-skeleton" aria-busy="true" aria-label="Loading school calendar">
      <div className="sc-skel-header">
        <div className="sc-skel-block sc-skel-title" />
        <div className="sc-skel-block sc-skel-btn" />
      </div>
      <div className="sc-skel-filters">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="sc-skel-block sc-skel-field" />
        ))}
      </div>
      <div className="sc-skel-cal">
        <div className="sc-skel-weekdays">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="sc-skel-block sc-skel-dow" />
          ))}
        </div>
        <div className="sc-skel-grid">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="sc-skel-block sc-skel-day" />
          ))}
        </div>
      </div>
    </div>
  );
}
