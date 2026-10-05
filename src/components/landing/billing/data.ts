export type BillingFeatureId =
  | 'flexible'
  | 'recurring'
  | 'subsidy'
  | 'invoices'
  | 'reminders';

export const BILLING_FEATURES = [
  {
    id: 'flexible' as const,
    title: 'Flexible Billing Cycles',
    description:
      'Monthly, weekly, bi-weekly, or custom. Match your centre schedule exactly. Set different cycles per programme or classroom.',
    duration: 3800,
  },
  {
    id: 'recurring' as const,
    title: 'Recurring, One-time & Deposits',
    description:
      'Set up recurring tuition and one-time charges for events or supplies, and manage enrollment deposits, all from one plan.',
    duration: 3800,
  },
  {
    id: 'subsidy' as const,
    title: 'Subsidy Calculators & Alerts',
    description:
      'Automatically calculate subsidy coverage, track authorisation periods, and get alerts before they expire so you never miss a renewal.',
    duration: 3800,
  },
  {
    id: 'invoices' as const,
    title: 'Branded Invoices',
    description:
      "Send professional branded invoices with your centre's logo, name, and payment details — automatically generated and delivered.",
    duration: 3800,
  },
  {
    id: 'reminders' as const,
    title: 'Reminders & Late Fees',
    description:
      'Set up automatic payment reminders before and after due dates. Late fees are applied based on your rules — no manual follow-up needed.',
    duration: 3800,
  },
];

export const BILLING_PARENT_POINTS = [
  'Easy online payments',
  'Saved payment methods',
  'Automatic receipts',
  'Clear balances',
  'Secure payment experience',
];

export const BILLING_TRUST = [
  {
    id: 'fees',
    title: 'No Hidden Fees',
    detail: 'Clear pricing and transparent billing for every family and every charge.',
  },
  {
    id: 'audit',
    title: 'Full Audit Trail',
    detail: 'Every payment, adjustment, and billing action stays visible and searchable.',
  },
  {
    id: 'secure',
    title: 'Secure Payments',
    detail: 'Protect financial information and payment workflows with modern safeguards.',
  },
];

export const BILLING_COMPARISON_ROWS = [
  { feature: 'Flexible Billing Cycles', traditional: false, generic: true, panacea: true },
  { feature: 'Recurring Payments', traditional: true, generic: true, panacea: true },
  { feature: 'One-Time Charges & Deposits', traditional: false, generic: true, panacea: true },
  { feature: 'Subsidy Management', traditional: false, generic: false, panacea: true },
  { feature: 'Automated Reminders', traditional: false, generic: true, panacea: true },
  { feature: 'Branded Invoices', traditional: false, generic: false, panacea: true },
  { feature: 'Revenue Dashboard', traditional: false, generic: true, panacea: true },
  { feature: 'Payment Tracking', traditional: true, generic: true, panacea: true },
];

export const BILLING_FAQS = [
  {
    id: 'q1',
    question: 'Can Panacea support different billing schedules?',
    answer:
      'Yes. Create monthly, weekly, bi-weekly, quarterly, yearly, or fully custom cycles — and vary them by programme, classroom, or family when needed.',
  },
  {
    id: 'q2',
    question: 'Can I create recurring and one-time charges?',
    answer:
      'You can run recurring tuition plans alongside one-time charges for events, supplies, or deposits from a single tuition plan workflow.',
  },
  {
    id: 'q3',
    question: 'Can Panacea track subsidy payments?',
    answer:
      'Panacea helps calculate subsidy coverage, track authorisations, surface renewal alerts, and apply funding against family balances.',
  },
  {
    id: 'q4',
    question: 'Can invoices be customized?',
    answer:
      'Yes. Generate branded invoices with your centre logo, name, and payment details so every statement feels professional and on-brand.',
  },
  {
    id: 'q5',
    question: 'Can payment reminders be automated?',
    answer:
      'Schedule reminders before and after due dates by email and SMS, then auto-apply late fees based on rules you define.',
  },
  {
    id: 'q6',
    question: 'Can parents pay online?',
    answer:
      'Parents can review balances, save payment methods, pay securely online, and receive automatic receipts after each successful payment.',
  },
  {
    id: 'q7',
    question: 'Can I see outstanding balances?',
    answer:
      'Yes. Track collected, pending, and overdue amounts across families and centres from one billing overview.',
  },
  {
    id: 'q8',
    question: 'Can I track revenue in real time?',
    answer:
      'The revenue dashboard shows collections, outstanding balances, subsidy payments, and trends so directors always know where cash flow stands.',
  },
];

export const BILLING_AUTOMATION_STEPS = [
  { id: 'created', label: 'Invoice Created' },
  { id: 'sent', label: 'Invoice Sent' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'payment', label: 'Payment' },
  { id: 'receipt', label: 'Receipt' },
];

export const BILLING_SUBSIDY_FLOW = [
  { id: 'approved', label: 'Subsidy Approved' },
  { id: 'funding', label: 'Funding Available' },
  { id: 'applied', label: 'Payment Applied' },
  { id: 'balance', label: 'Balance Updated' },
];
