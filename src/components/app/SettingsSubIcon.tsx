/** Small icons for Settings sidebar children. */

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

export function SettingsSubIcon({ id }: Props) {
  switch (id) {
    case 'settings-programs':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      );
    case 'settings-access-control':
      return (
        <svg {...common} aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'settings-activity-posts':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 6h16v12H4z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      );
    case 'settings-attendance':
      return (
        <svg {...common} aria-hidden>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 11h16" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      );
    case 'settings-billing':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 15h4" />
        </svg>
      );
    case 'settings-bus-tracking':
      return (
        <svg {...common} aria-hidden>
          <path d="M5 17H3v-5l2-5h12l2 5v5h-2" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'settings-cctv':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 8l7 4-7 4V8Z" />
          <rect x="10" y="7" width="11" height="10" rx="2" />
        </svg>
      );
    case 'settings-forms':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2Z" />
          <path d="M10 9h4M10 13h4" />
        </svg>
      );
    case 'settings-lesson':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case 'settings-roles':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1-3.4 3.4-5 7-5s6 1.6 7 5" />
          <path d="M17 7l1.5 1.5L21 6" />
        </svg>
      );
    case 'settings-school-details':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 10.5 12 4l9 6.5V20H3v-9.5Z" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case 'settings-staff-leave':
      return (
        <svg {...common} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5" />
          <rect x="13" y="10" width="8" height="8" rx="1.5" />
          <path d="M15 13h4M17 11v4" />
        </svg>
      );
    case 'settings-vaccine-library':
      return (
        <svg {...common} aria-hidden>
          <path d="M9 3v4M15 3v4" />
          <path d="M8 7h8l-1 3v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8L8 7Z" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'settings-email-templates':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 8l9 6 9-6" />
        </svg>
      );
    case 'settings-other':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
  }
}
