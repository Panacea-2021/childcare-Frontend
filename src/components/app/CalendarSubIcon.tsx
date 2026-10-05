/** Small Lucide-style icons for Calendar sidebar children. */

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

export function CalendarSubIcon({ id }: Props) {
  switch (id) {
    case 'staff-schedule':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 11h18" />
          <path d="M9 15h2M13 15h2" />
        </svg>
      );
    case 'student-schedule':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 4 3 9l9 5 9-5-9-5Z" />
          <path d="M3 14l9 5 9-5" />
        </svg>
      );
    case 'staff-holidays':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3v3M12 18v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M3 12h3M18 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      );
    case 'birthday-calendar':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 7v2M8 9h8l1 11H7L8 9Z" />
          <path d="M9 7c0-1.2.8-2 2-2s1.5.6 2 1.2c.5-.6 1-1.2 2-1.2s2 .8 2 2" />
        </svg>
      );
    case 'school-calendar':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 11h18" />
          <path d="M8 15h3v3H8z" />
        </svg>
      );
    case 'meal-planner':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 3v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M8 7h4M16 3v18" />
        </svg>
      );
    case 'program-list':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 7h12M8 12h12M8 17h12" />
          <path d="M4 7h.01M4 12h.01M4 17h.01" />
        </svg>
      );
    case 'program-dashboard':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'program-movement':
      return (
        <svg {...common} aria-hidden>
          <path d="M7 8h12M16 4l4 4-4 4" />
          <path d="M17 16H5M8 12l-4 4 4 4" />
        </svg>
      );
    case 'parent-messages':
      return (
        <svg {...common} aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      );
    case 'staff-messages':
      return (
        <svg {...common} aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'staff-announcement':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 11v2a9 9 0 0 0 9 9h1" />
          <path d="M21 15V9a2 2 0 0 0-2-2h-1L8 3v18l10-4h1a2 2 0 0 0 2-2Z" />
        </svg>
      );
    case 'activities':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3v4M8 7h8l1 12H7L8 7Z" />
          <path d="M9 11h6M10 15h4" />
        </svg>
      );
    case 'daily-reports':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </svg>
      );
    case 'notes':
      return (
        <svg {...common} aria-hidden>
          <path d="M15 3H7a2 2 0 0 0-2 2v14l4-2 4 2 4-2 4 2V9l-6-6Z" />
          <path d="M9 11h6M9 15h4" />
        </svg>
      );
    case 'concerns':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3 3 19h18L12 3Z" />
          <path d="M12 9v5M12 17h.01" />
        </svg>
      );
    case 'newsletters':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 8l9 6 9-6" />
        </svg>
      );
    case 'resource-center':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <path d="M5 7h14M5 12h14M5 17h10" />
        </svg>
      );
  }
}
