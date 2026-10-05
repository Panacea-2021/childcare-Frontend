/** Small icons for Center Management sidebar children. */

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

export function CenterSubIcon({ id }: Props) {
  switch (id) {
    case 'students':
      return (
        <svg {...common} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
          <path d="M14 14.2c1.7.2 3.2 1.2 3.8 3.3" />
        </svg>
      );
    case 'staff':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1-3.4 3.4-5 7-5s6 1.6 7 5" />
        </svg>
      );
    case 'rooms':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 20V9.5L12 4l8 5.5V20h-5.5v-5h-5v5H4Z" />
        </svg>
      );
    case 'groups':
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="9" r="2.5" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3.5 18c.5-2.4 2.2-3.6 4.5-3.6s4 1.2 4.5 3.6" />
          <path d="M11.5 18c.5-2.4 2.2-3.6 4.5-3.6s4 1.2 4.5 3.6" />
        </svg>
      );
    case 'labels':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
          <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'email-templates':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 8l9 6 9-6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
