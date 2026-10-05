/** Thin-line sidebar icons matching Admin `ModuleIcon` style. */
export function ParentModuleIcon({ id }: { id: string }) {
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
    case 'timeline':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );

    case 'lessons':
      return (
        <svg {...common}>
          <path d="M4 6.5 12 3.5l8 3V11c0 4.8-3.3 7.8-8 9.5C7.3 18.8 4 15.8 4 11V6.5Z" />
          <path d="M9.2 11.2l1.8 1.8 3.8-3.8" />
        </svg>
      );

    case 'messages':
      return (
        <svg {...common}>
          <path d="M4 6.5h11a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H9.5L6 17.5V15H4a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" />
          <path d="M9 8.5h9a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-1.5l-2.5 2v-2H13" />
        </svg>
      );

    case 'school-calendar':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
          <path d="M8 14h2M12 14h2M16 14h2M8 17.5h2M12 17.5h2" />
        </svg>
      );

    case 'student-invoices':
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M9 11.5h6M9 14.5h6M9 17.5h3.5" />
        </svg>
      );

    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c1.4-3.4 3.8-5 7-5s5.6 1.6 7 5" />
        </svg>
      );

    case 'resource-center':
      return (
        <svg {...common}>
          <path d="M4 7.5A2 2 0 0 1 6 5.5h4.2L12 7.5H18a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z" />
          <path d="M8 12.5h8M8 15.5h5" />
        </svg>
      );

    case 'support':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.4 1-1.4 2V14" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
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
