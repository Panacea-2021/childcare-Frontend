/** Small Lucide-style icons for Enquiries sidebar children. */

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

export function EnquirySubIcon({ id }: Props) {
  switch (id) {
    case 'enquiry-dashboard':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'enquiries-list':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case 'enquiry-tasks':
      return (
        <svg {...common} aria-hidden>
          <path d="M9 11l2 2 4-4" />
          <path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'enquiry-forms':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </svg>
      );
    case 'enquiry-automations':
    case 'enquiry-marketing':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 11v2a9 9 0 0 0 9 9h1" />
          <path d="M21 15V9a2 2 0 0 0-2-2h-1L8 3v18l10-4h1a2 2 0 0 0 2-2Z" />
        </svg>
      );
    case 'enquiry-email-campaigns':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    case 'enquiry-facebook':
      return (
        <svg {...common} aria-hidden>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'enquiry-whatsapp':
      return (
        <svg {...common} aria-hidden>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z" />
          <path d="M9.5 9.5c.4 1.6 1.8 3.1 3.4 3.5l1.1-1.1c.2-.2.5-.3.8-.2.6.2 1.3.4 2 .4.3 0 .5.2.5.5v1.7c0 .3-.2.5-.5.5A8.1 8.1 0 0 1 8 9.5c0-.3.2-.5.5-.5H10c.3 0 .5.2.5.5Z" />
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
