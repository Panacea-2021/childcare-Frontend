export function DashboardSkeleton() {
  return (
    <div className="dash-skeleton" aria-busy="true" aria-live="polite" aria-label="Loading dashboard">
      <div className="dash-skelHead">
        <div className="dash-skelBlock dash-skelTitle" />
        <div className="dash-skelBlock dash-skelDate" />
      </div>
      <div className="dash-skelStats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dash-skelBlock dash-skelCard" />
        ))}
      </div>
      <div className="dash-skelBlock dash-skelAttendance" />
      <div className="dash-skelWidgets">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dash-skelBlock dash-skelWidget" />
        ))}
      </div>
      <div className="dash-skelBlock dash-skelAttendance" />
      <div className="dash-skelWidgets2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="dash-skelBlock dash-skelWidget" />
        ))}
      </div>
    </div>
  );
}
