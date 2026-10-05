/** Small icons for Billing & Accounting sidebar children. */

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

export function BillingSubIcon({ id }: Props) {
  switch (id) {
    /* LayoutDashboard */
    case 'billing-dashboard':
      return (
        <svg {...common} aria-hidden>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
        </svg>
      );

    /* FileText / Invoice */
    case 'billing-invoices':
      return (
        <svg {...common} aria-hidden>
          <path d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M9 11.5h6M9 14.5h6M9 17.5h3.5" />
        </svg>
      );

    /* Wallet / balances */
    case 'billing-student-balances':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 8.5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V10A1.5 1.5 0 0 1 4 8.5Z" />
          <path d="M2.5 10.5 5.2 5.8A1.5 1.5 0 0 1 6.5 5h11a1.5 1.5 0 0 1 1.3.8L21.5 10.5" />
          <circle cx="16.5" cy="14" r="1.4" />
        </svg>
      );

    /* CreditCard / payments */
    case 'billing-payments':
      return (
        <svg {...common} aria-hidden>
          <rect x="2.5" y="6" width="19" height="12.5" rx="2" />
          <path d="M2.5 10.5h19" />
          <path d="M7 15h3.5M13.5 15h3" />
        </svg>
      );

    /* Layers / fee plan */
    case 'billing-fee-plan':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 4.5 3.5 9 12 13.5 20.5 9 12 4.5Z" />
          <path d="M3.5 13.5 12 18l8.5-4.5" />
          <path d="M3.5 17 12 21.5 20.5 17" />
        </svg>
      );

    /* BellMail / fee reminders */
    case 'billing-fee-reminders':
      return (
        <svg {...common} aria-hidden>
          <path d="M6.5 16V10a5.5 5.5 0 1 1 11 0v6l1.8 2H4.7l1.8-2Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );

    default:
      return (
        <svg {...common} aria-hidden>
          <path d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
        </svg>
      );
  }
}
