/** Thin-line sidebar icons (Illumine-style). */
export function ModuleIcon({ id }: { id: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (id) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
        </svg>
      );

    /* Document + graduation cap */
    case 'center-management':
      return (
        <svg {...common}>
          <path d="M7 3.5h7.2L19 8.2V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M8.5 11h5M8.5 14h4" />
          <path d="M13.2 17.2h5.1l-2.55 1.6-2.55-1.6Z" />
          <path d="M15.75 18.8v1.4" />
        </svg>
      );

    /* Framed bulleted list */
    case 'program':
      return (
        <svg {...common}>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <circle cx="8" cy="9" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="16" r="0.9" fill="currentColor" stroke="none" />
          <path d="M10.5 9h6M10.5 12.5h6M10.5 16h4.5" />
        </svg>
      );

    /* Calendar + check */
    case 'attendance-leaves':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
          <path d="M8 14h2.2M12.2 14h2.2M16.4 14H18" />
          <path d="M8 17h2.2M12.2 17h2.2" />
          <path d="M15.2 18.2l1.3 1.3 2.5-2.6" />
        </svg>
      );

    /* Speech bubble + smiley */
    case 'parent-communication':
      return (
        <svg {...common}>
          <path d="M5 4.5h14a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2h-5.2L8.5 19.5V16H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
          <circle cx="9.2" cy="10" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="10" r="0.85" fill="currentColor" stroke="none" />
          <path d="M9.2 12.4c.8 1.1 2.1 1.6 2.8 1.6s2-.5 2.8-1.6" />
        </svg>
      );

    /* Overlapping chat bubbles */
    case 'messages':
      return (
        <svg {...common}>
          <path d="M4 6.5h11a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H9.5L6 17.5V15H4a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" />
          <path d="M9 8.5h9a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-1.5l-2.5 2v-2H13" />
        </svg>
      );

    /* Invoice / document lines */
    case 'billing-accounting':
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M9 11.5h6M9 14.5h6M9 17.5h3.5" />
        </svg>
      );

    /* Map pin / tour */
    case 'tour-management':
      return (
        <svg {...common}>
          <path d="M12 21s-6.5-5.2-6.5-10A6.5 6.5 0 0 1 18.5 11c0 4.8-6.5 10-6.5 10Z" />
          <circle cx="12" cy="11" r="2.4" />
        </svg>
      );

    case 'enquiries':
      return (
        <svg {...common}>
          <circle cx="10" cy="8" r="3.2" />
          <circle cx="16.5" cy="9.2" r="2.5" />
          <path d="M3.8 19c1.1-3.2 3.5-4.8 6.2-4.8 1.4 0 2.7.4 3.8 1.2" />
          <path d="M14.2 15.8c1.5-.5 3.1-.3 4.5.8" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
          <path d="M8 14h2M12 14h2M16 14h2M8 17.5h2M12 17.5h2" />
        </svg>
      );

    /* Progress grid / tracking */
    case 'progress-tracking':
      return (
        <svg {...common}>
          <rect x="3.5" y="4" width="17" height="16" rx="2" />
          <path d="M3.5 9h17M9 9v11M14.5 9v11" />
          <path d="M5.5 12.5h2M11 14.5h2M16.5 11.5h2" />
        </svg>
      );

    case 'learning-assessment':
      return (
        <svg {...common}>
          <path d="M4 6.5 12 3.5l8 3V11c0 4.8-3.3 7.8-8 9.5C7.3 18.8 4 15.8 4 11V6.5Z" />
          <path d="M9.2 11.2l1.8 1.8 3.8-3.8" />
        </svg>
      );

    case 'forms':
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M9 12h6M9 15.5h4" />
        </svg>
      );

    case 'tools':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-3 3-2.7-2.7 3-3Z" />
        </svg>
      );

    case 'reports':
      return (
        <svg {...common}>
          <path d="M4 19.5V5" />
          <path d="M4 19.5h16" />
          <path d="M8 15.5v-4M12 15.5V8M16 15.5v-6" />
        </svg>
      );

    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M6.1 17.9l1.6-1.6M16.3 7.7l1.6-1.6" />
        </svg>
      );

    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.4 1-1.4 2V14" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'language':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5a14 14 0 0 1 0 17M12 3.5a14 14 0 0 0 0 17" />
        </svg>
      );

    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c1.4-3.4 3.8-5 7-5s5.6 1.6 7 5" />
        </svg>
      );

    case 'notifications':
      return (
        <svg {...common}>
          <path d="M6.5 16V10a5.5 5.5 0 1 1 11 0v6l1.8 2H4.7l1.8-2Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
