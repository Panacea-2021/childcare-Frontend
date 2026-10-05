/** Small icons for Attendance & Leaves sidebar children. */

type Props = { id: string };

const common = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function AttendanceSubIcon({ id }: Props) {
  switch (id) {
    /* Users — Student Attendance */
    case 'student-attendance':
      return (
        <svg {...common} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
          <path d="M14 14.2c1.7.2 3.2 1.2 3.8 3.3" />
        </svg>
      );

    /* UserCog — Staff Attendance */
    case 'staff-attendance':
      return (
        <svg {...common} aria-hidden>
          <circle cx="10" cy="8" r="3.1" />
          <path d="M3.5 19c.8-3.2 3-4.8 6.5-4.8" />
          <circle cx="17.5" cy="16" r="2.6" />
          <path d="M17.5 12.8v1.1M17.5 18.1v1.1M14.7 16h1.1M19.2 16h1.1M15.5 14l.8.8M18.7 17.2l.8.8M15.5 18l.8-.8M18.7 14.8l.8-.8" />
        </svg>
      );

    /* Gauge — Student Staff Ratio */
    case 'student-staff-ratio':
      return (
        <svg {...common} aria-hidden>
          <path d="M5.2 18.2a8.5 8.5 0 1 1 13.6 0" />
          <path d="M12 14.5l3.2-4.4" />
          <circle cx="12" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );

    /* LineChart — Attendance Forecast */
    case 'attendance-forecast':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19.5V5" />
          <path d="M4 19.5h16" />
          <path d="M7.5 15.5 11 11l3 2.5 4.5-6" />
          <path d="M15.5 7.5h3v3" />
        </svg>
      );

    default:
      return (
        <svg {...common} aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M4 10h16" />
        </svg>
      );
  }
}
