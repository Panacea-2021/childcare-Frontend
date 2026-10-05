export type LoadingContext =
  | 'default'
  | 'app'
  | 'invoices'
  | 'payments'
  | 'balances'
  | 'fee-plan'
  | 'students'
  | 'staff'
  | 'attendance'
  | 'messages'
  | 'reports'
  | 'dashboard'
  | 'calendar'
  | 'forms';

const COPY: Record<LoadingContext, { title: string; rotating: string[] }> = {
  default: {
    title: 'Getting things ready…',
    rotating: ['Almost there…', 'Just a second…', 'Preparing your view…'],
  },
  app: {
    title: 'Warming up Panacea…',
    rotating: ['Opening your center…', 'Almost ready…', 'Preparing magic…'],
  },
  invoices: {
    title: 'Getting invoices ready…',
    rotating: ['Sorting payments…', 'Balancing the books…', 'Almost there…'],
  },
  payments: {
    title: 'Loading payment history…',
    rotating: ['Matching receipts…', 'Almost ready…', 'Fetching ledger…'],
  },
  balances: {
    title: 'Loading student balances…',
    rotating: ['Checking credits…', 'Tallying dues…', 'Almost there…'],
  },
  'fee-plan': {
    title: 'Preparing fee plans…',
    rotating: ['Loading components…', 'Almost ready…', 'Organizing rates…'],
  },
  students: {
    title: 'Loading student profiles…',
    rotating: ['Gathering family details…', 'Almost there…', 'Opening roster…'],
  },
  staff: {
    title: 'Loading staff data…',
    rotating: ['Checking schedules…', 'Almost ready…', 'Fetching profiles…'],
  },
  attendance: {
    title: 'Preparing attendance data…',
    rotating: ['Marking the day…', 'Almost there…', 'Syncing check-ins…'],
  },
  messages: {
    title: 'Opening conversations…',
    rotating: ['Connecting with parents…', 'Almost ready…', 'Fetching chats…'],
  },
  reports: {
    title: 'Building your reports…',
    rotating: ['Crunching numbers…', 'Almost there…', 'Formatting charts…'],
  },
  dashboard: {
    title: 'Preparing your dashboard…',
    rotating: ['Gathering insights…', 'Almost ready…', 'Polishing the view…'],
  },
  calendar: {
    title: 'Opening your calendar…',
    rotating: ['Checking events…', 'Almost ready…', 'Loading dates…'],
  },
  forms: {
    title: 'Opening form builder…',
    rotating: ['Setting up fields…', 'Almost ready…', 'Preparing canvas…'],
  },
};

export function getLoadingCopy(context: LoadingContext = 'default') {
  return COPY[context] ?? COPY.default;
}
