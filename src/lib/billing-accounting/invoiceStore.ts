/** Center-wide invoice listing + create flow — client/localStorage only (no API). */

import {
  addStudentCredit,
  creditTotal,
  loadStudentBilling,
  postCreditUsage,
} from '@/lib/center-management/billingStore';

export type CenterInvoiceStatus =
  | 'Due'
  | 'Paid'
  | 'Overdue'
  | 'Pending'
  | 'Upcoming'
  | 'Draft'
  | 'Refund'
  | 'Cancelled';

export type InvoiceLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  amount: number;
  /** Debit-note line extras */
  typeLabel?: string;
  grossAmount?: number;
  discountAmount?: number;
  discountDescription?: string;
  discountPercent?: number;
};

export type InvoiceComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  staffOnly?: boolean;
};

export type FeeReminderEntry = {
  id: string;
  sentAt: string;
  sentBy: string;
};

export type InvoicePayment = {
  id: string;
  receiptId: string;
  amount: number;
  mode: string;
  date: string;
  reference?: string;
  usedCredit?: number;
  emailParent?: boolean;
  recordedBy: string;
  recordedAt: string;
};

export type InvoiceRefund = {
  id: string;
  amount: number;
  mode: string;
  date: string;
  reference?: string;
  addAsCredit?: boolean;
  recordedBy: string;
  recordedAt: string;
};

export type CenterInvoice = {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  billingPlan: string;
  dueDate: string;
  invoicedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: CenterInvoiceStatus;
  invoiceDate: string;
  kind: 'invoice' | 'debit' | 'upcoming';
  roomId?: string;
  groupId?: string;
  photoUrl?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  createdBy?: string;
  createdOn?: string;
  schoolNotes?: string;
  parentNotes?: string;
  emailParent?: boolean;
  cancelNote?: string;
  cancelledAt?: string;
  lines?: InvoiceLine[];
  comments?: InvoiceComment[];
  feeReminders?: FeeReminderEntry[];
  payments?: InvoicePayment[];
  refunds?: InvoiceRefund[];
  totalRefund?: number;
  /** Debit note: what the debit was raised against */
  raisedAgainst?: string;
};

export type FeePlanOption = {
  id: string;
  name: string;
  amount: number;
  popular?: boolean;
};

export type CatalogItem = {
  id: string;
  name: string;
  unitPrice: number;
  taxPercent: number;
};

export type DiscountDef = {
  id: string;
  name: string;
  value: number;
  unit: 'percent' | 'amount';
  kind: 'standard' | 'conditional';
  /** Fixed amount/percent vs profile-driven */
  mode?: 'fixed' | 'dynamic';
  itemCode?: string;
  sourceField?: string;
  /** Times redeemed (demo / ledger). */
  redemptions?: number;
  conditionalMode?: 'applications' | 'date';
  valueOfX?: string;
};

export type InvoiceLineDraft = {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  showDescription?: boolean;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountId?: string;
  discountAmount: number;
  refundable?: boolean;
  optionsOpen?: boolean;
};

const STORAGE_KEY = 'panacea.billing.center-invoices.v1';
const DISCOUNT_KEY = 'panacea.billing.discounts.v1';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export const FEE_PLAN_OPTIONS: FeePlanOption[] = [
  { id: 'fp-toddler', name: 'Toddler Monthly FeePlan (Sample)', amount: 100, popular: true },
  { id: 'fp-full', name: 'Full Day Monthly', amount: 12500, popular: true },
  { id: 'fp-half', name: 'Half Day Monthly', amount: 8500 },
  { id: 'fp-weekend', name: 'Weekend Club Weekly', amount: 2000 },
];

export const CATALOG_ITEMS: CatalogItem[] = [
  { id: 'ci-fee', name: 'Fee(M0PK)', unitPrice: 100, taxPercent: 0 },
  { id: 'ci-refundable', name: 'Refundable', unitPrice: 500, taxPercent: 0 },
  { id: 'ci-meals', name: 'Meal Charges', unitPrice: 1500, taxPercent: 5 },
  { id: 'ci-activity', name: 'Activity Fee', unitPrice: 800, taxPercent: 0 },
  { id: 'ci-transport', name: 'Transport', unitPrice: 2000, taxPercent: 5 },
];

const SEED_INVOICES: CenterInvoice[] = [
  {
    id: 'inv-3',
    invoiceId: 'INV-3',
    studentId: 'st-alex',
    studentName: 'Alex Demo Student',
    billingPlan: 'Toddler Monthly FeePlan (Sample)',
    dueDate: '2026-08-04',
    invoicedAmount: 100,
    paidAmount: 0,
    pendingAmount: 100,
    status: 'Due',
    invoiceDate: '2026-08-04',
    kind: 'invoice',
    billingPeriodStart: '2026-08-04',
    billingPeriodEnd: '2026-08-05',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-04',
    lines: [{ id: 'inv-3-l1', name: 'Fee', quantity: 1, unitPrice: 100, taxPercent: 0, amount: 100 }],
    comments: [],
    schoolNotes: '',
    parentNotes: '',
    emailParent: false,
  },
  {
    id: 'inv-1',
    invoiceId: 'INV-1',
    studentId: 's1',
    studentName: 'Aarav Sharma',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-08-05',
    invoicedAmount: 12500,
    paidAmount: 0,
    pendingAmount: 12500,
    status: 'Due',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-1-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
  },
  {
    id: 'inv-2',
    invoiceId: 'INV-2',
    studentId: 's2',
    studentName: 'Diya Patel',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-07-05',
    invoicedAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-07-01',
    kind: 'invoice',
    billingPeriodStart: '2026-07-01',
    billingPeriodEnd: '2026-07-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-07-01',
    lines: [
      { id: 'inv-2-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-2-pay-1',
        receiptId: 'REC-1',
        amount: 12500,
        mode: 'Bank Transfer',
        date: '2026-07-03',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-07-03T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'inv-4',
    invoiceId: 'INV-4',
    studentId: 's3',
    studentName: 'Kabir Singh',
    billingPlan: 'Half Day Monthly',
    dueDate: '2026-07-20',
    invoicedAmount: 8500,
    paidAmount: 0,
    pendingAmount: 8500,
    status: 'Overdue',
    invoiceDate: '2026-07-01',
    kind: 'invoice',
    billingPeriodStart: '2026-07-01',
    billingPeriodEnd: '2026-07-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-07-01',
    lines: [
      { id: 'inv-4-l1', name: 'Half Day Monthly', quantity: 1, unitPrice: 8500, taxPercent: 0, amount: 8500 },
    ],
  },
  {
    id: 'up-1',
    invoiceId: 'UP-1',
    studentId: 's1',
    studentName: 'Aarav Sharma',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-09-05',
    invoicedAmount: 12500,
    paidAmount: 0,
    pendingAmount: 12500,
    status: 'Pending',
    invoiceDate: '2026-09-01',
    kind: 'upcoming',
    billingPeriodStart: '2026-09-01',
    billingPeriodEnd: '2026-09-30',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-09-01',
    lines: [
      { id: 'up-1-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
  },
  {
    id: 'up-2',
    invoiceId: 'UP-2',
    studentId: 's2',
    studentName: 'Diya Patel',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-09-05',
    invoicedAmount: 12500,
    paidAmount: 0,
    pendingAmount: 12500,
    status: 'Pending',
    invoiceDate: '2026-09-01',
    kind: 'upcoming',
    billingPeriodStart: '2026-09-01',
    billingPeriodEnd: '2026-09-30',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-09-01',
    lines: [
      { id: 'up-2-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
  },
  {
    id: 'up-3',
    invoiceId: 'UP-3',
    studentId: 's3',
    studentName: 'Kabir Singh',
    billingPlan: 'Half Day Monthly',
    dueDate: '2026-10-05',
    invoicedAmount: 8500,
    paidAmount: 0,
    pendingAmount: 8500,
    status: 'Pending',
    invoiceDate: '2026-10-01',
    kind: 'upcoming',
    billingPeriodStart: '2026-10-01',
    billingPeriodEnd: '2026-10-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-10-01',
    lines: [
      { id: 'up-3-l1', name: 'Half Day Monthly', quantity: 1, unitPrice: 8500, taxPercent: 0, amount: 8500 },
    ],
  },
  {
    id: 'deb-3',
    invoiceId: 'DEB-3',
    studentId: 'st-demo-r1-2',
    studentName: 'Kavya Sharma',
    billingPlan: 'Special Interest',
    dueDate: '2026-08-11',
    invoicedAmount: 980,
    paidAmount: 0,
    pendingAmount: 980,
    status: 'Due',
    invoiceDate: '2026-08-04',
    kind: 'debit',
    raisedAgainst: 'Special Interest',
    billingPeriodStart: '2026-08-04',
    billingPeriodEnd: '2026-08-10',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-04',
    lines: [
      {
        id: 'deb-3-l1',
        name: 'Special Interest',
        typeLabel: 'Fee (M0PK)',
        quantity: 1,
        unitPrice: 1000,
        taxPercent: 0,
        amount: 980,
        grossAmount: 1000,
        discountAmount: 20,
        discountDescription: '',
      },
    ],
    comments: [],
    payments: [],
    schoolNotes: '',
    parentNotes: '',
  },
  {
    id: 'deb-2',
    invoiceId: 'DEB-2',
    studentId: 'st-alex',
    studentName: 'Alex Demo Student',
    billingPlan: 'Fee',
    dueDate: '2026-08-11',
    invoicedAmount: 100,
    paidAmount: 100,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-04',
    kind: 'debit',
    raisedAgainst: 'Fee',
    billingPeriodStart: '2026-08-04',
    billingPeriodEnd: '2026-08-07',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-04',
    lines: [
      {
        id: 'deb-2-l1',
        name: 'Fee',
        typeLabel: 'Fee (M0PK)',
        quantity: 1,
        unitPrice: 100,
        taxPercent: 0,
        amount: 100,
        grossAmount: 100,
        discountAmount: 0,
      },
    ],
    comments: [],
    payments: [
      {
        id: 'deb-2-pay-1',
        receiptId: 'DEBITNOTE-REC-1',
        amount: 100,
        mode: 'Cash',
        date: '2026-08-04',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-08-04T10:00:00.000Z',
      },
    ],
    schoolNotes: '',
    parentNotes: '',
  },
  {
    id: 'deb-5',
    invoiceId: 'DEB-5',
    studentId: 'st-alex',
    studentName: 'Alex Demo Student',
    billingPlan: 'Fee',
    dueDate: '2026-08-09',
    invoicedAmount: 9800,
    paidAmount: 0,
    pendingAmount: 9800,
    status: 'Due',
    invoiceDate: '2026-08-07',
    kind: 'debit',
    raisedAgainst: '',
    billingPeriodStart: '2026-08-07',
    billingPeriodEnd: '2026-08-14',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-07',
    lines: [
      {
        id: 'deb-5-l1',
        name: 'Fee',
        typeLabel: 'Fee (M0PK)',
        quantity: 1,
        unitPrice: 9800,
        taxPercent: 0,
        amount: 9800,
        grossAmount: 9800,
        discountAmount: 0,
      },
    ],
    comments: [],
    payments: [],
    schoolNotes: '',
    parentNotes: '',
  },
  /* —— Payment demo ledger (fills Payments + dashboard recent list) —— */
  {
    id: 'inv-pay-1',
    invoiceId: 'INV-101',
    studentId: 'st-sun-1',
    studentName: 'Ananya Reddy',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-08-05',
    invoicedAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-pay-1-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-pay-1-p1',
        receiptId: 'REC-101',
        amount: 12500,
        mode: 'Card',
        date: '2026-08-03',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-08-03T09:20:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-2',
    invoiceId: 'INV-102',
    studentId: 'st-sun-2',
    studentName: 'Rohan Iyer',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-08-08',
    invoicedAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-pay-2-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-pay-2-p1',
        receiptId: 'REC-102',
        amount: 7500,
        mode: 'Card',
        date: '2026-08-04',
        recordedBy: 'Darshan',
        recordedAt: '2026-08-04T11:05:00.000Z',
      },
      {
        id: 'inv-pay-2-p2',
        receiptId: 'REC-103',
        amount: 5000,
        mode: 'Cash',
        date: '2026-08-06',
        recordedBy: 'Darshan',
        recordedAt: '2026-08-06T16:40:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-3',
    invoiceId: 'INV-103',
    studentId: 'st-sun-3',
    studentName: 'Pooja Nair',
    billingPlan: 'Half Day Monthly',
    dueDate: '2026-08-10',
    invoicedAmount: 8500,
    paidAmount: 8500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-02',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-02',
    lines: [
      { id: 'inv-pay-3-l1', name: 'Half Day Monthly', quantity: 1, unitPrice: 8500, taxPercent: 0, amount: 8500 },
    ],
    payments: [
      {
        id: 'inv-pay-3-p1',
        receiptId: 'REC-104',
        amount: 8500,
        mode: 'Bank Transfer',
        date: '2026-08-07',
        recordedBy: 'Simran Jain',
        recordedAt: '2026-08-07T08:15:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-4',
    invoiceId: 'INV-104',
    studentId: 'st-with',
    studentName: 'Riya Kapoor',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-08-12',
    invoicedAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-pay-4-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-pay-4-p1',
        receiptId: 'REC-105',
        amount: 12500,
        mode: 'Cheque',
        date: '2026-08-08',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-08-08T13:00:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-5',
    invoiceId: 'INV-105',
    studentId: 'st-demo-r1-3',
    studentName: 'Arjun Mehta',
    billingPlan: 'Toddler Monthly',
    dueDate: '2026-08-09',
    invoicedAmount: 9800,
    paidAmount: 9800,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-pay-5-l1', name: 'Toddler Monthly', quantity: 1, unitPrice: 9800, taxPercent: 0, amount: 9800 },
    ],
    payments: [
      {
        id: 'inv-pay-5-p1',
        receiptId: 'REC-106',
        amount: 4800,
        mode: 'Credit Balance',
        date: '2026-08-05',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-08-05T10:30:00.000Z',
      },
      {
        id: 'inv-pay-5-p2',
        receiptId: 'REC-107',
        amount: 5000,
        mode: 'M-Pesa',
        date: '2026-08-09',
        recordedBy: 'Darshan',
        recordedAt: '2026-08-09T14:22:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-6',
    invoiceId: 'INV-106',
    studentId: 'st-sun-4',
    studentName: 'Vikram Bose',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-08-15',
    invoicedAmount: 12500,
    paidAmount: 6000,
    pendingAmount: 6500,
    status: 'Due',
    invoiceDate: '2026-08-01',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-01',
    lines: [
      { id: 'inv-pay-6-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-pay-6-p1',
        receiptId: 'REC-108',
        amount: 6000,
        mode: 'FPS',
        date: '2026-08-10',
        recordedBy: 'Simran Jain',
        recordedAt: '2026-08-10T09:05:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-7',
    invoiceId: 'INV-107',
    studentId: 'st-nara',
    studentName: 'Narasimha',
    billingPlan: 'Half Day Monthly',
    dueDate: '2026-07-28',
    invoicedAmount: 8500,
    paidAmount: 8500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-07-15',
    kind: 'invoice',
    billingPeriodStart: '2026-07-01',
    billingPeriodEnd: '2026-07-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-07-15',
    lines: [
      { id: 'inv-pay-7-l1', name: 'Half Day Monthly', quantity: 1, unitPrice: 8500, taxPercent: 0, amount: 8500 },
    ],
    payments: [
      {
        id: 'inv-pay-7-p1',
        receiptId: 'REC-109',
        amount: 8500,
        mode: 'Other',
        date: '2026-07-26',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-07-26T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-8',
    invoiceId: 'INV-108',
    studentId: 's1',
    studentName: 'Aarav Sharma',
    billingPlan: 'Full Day Monthly',
    dueDate: '2026-07-05',
    invoicedAmount: 12500,
    paidAmount: 12500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-07-01',
    kind: 'invoice',
    billingPeriodStart: '2026-07-01',
    billingPeriodEnd: '2026-07-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-07-01',
    lines: [
      { id: 'inv-pay-8-l1', name: 'Full Day Monthly', quantity: 1, unitPrice: 12500, taxPercent: 0, amount: 12500 },
    ],
    payments: [
      {
        id: 'inv-pay-8-p1',
        receiptId: 'REC-110',
        amount: 12500,
        mode: 'Bank Transfer',
        date: '2026-07-04',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-07-04T10:00:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-9',
    invoiceId: 'INV-109',
    studentId: 'st-demo-r1-2',
    studentName: 'Kavya Sharma',
    billingPlan: 'Activity Add-on',
    dueDate: '2026-08-06',
    invoicedAmount: 2200,
    paidAmount: 2200,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-08-02',
    kind: 'invoice',
    billingPeriodStart: '2026-08-01',
    billingPeriodEnd: '2026-08-31',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-08-02',
    lines: [
      { id: 'inv-pay-9-l1', name: 'Activity Fee', quantity: 1, unitPrice: 2200, taxPercent: 0, amount: 2200 },
    ],
    payments: [
      {
        id: 'inv-pay-9-p1',
        receiptId: 'REC-111',
        amount: 2200,
        mode: 'Cash',
        date: '2026-08-02',
        recordedBy: 'Darshan',
        recordedAt: '2026-08-02T15:45:00.000Z',
      },
    ],
  },
  {
    id: 'inv-pay-10',
    invoiceId: 'INV-110',
    studentId: 'st-alex',
    studentName: 'Alex Demo Student',
    billingPlan: 'Toddler Monthly FeePlan (Sample)',
    dueDate: '2026-08-01',
    invoicedAmount: 4500,
    paidAmount: 4500,
    pendingAmount: 0,
    status: 'Paid',
    invoiceDate: '2026-07-28',
    kind: 'invoice',
    billingPeriodStart: '2026-07-28',
    billingPeriodEnd: '2026-08-04',
    createdBy: 'Malika Thimisetty',
    createdOn: '2026-07-28',
    lines: [
      { id: 'inv-pay-10-l1', name: 'Fee', quantity: 1, unitPrice: 4500, taxPercent: 0, amount: 4500 },
    ],
    payments: [
      {
        id: 'inv-pay-10-p1',
        receiptId: 'REC-112',
        amount: 4500,
        mode: 'Card',
        date: '2026-07-30',
        recordedBy: 'Malika Thimisetty',
        recordedAt: '2026-07-30T11:10:00.000Z',
      },
    ],
  },
];

/** Local calendar date as YYYY-MM-DD (timezone-safe for day comparisons). */
export function localTodayIso(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Derive display/persist status from balances + due date.
 * Unpaid with dueDate before today → Overdue; unpaid otherwise → Due.
 * Billing period does not affect status — due date does.
 */
export function resolveCenterInvoiceStatus(
  invoice: Pick<CenterInvoice, 'status' | 'dueDate' | 'pendingAmount' | 'paidAmount' | 'kind'>,
  today = localTodayIso(),
): CenterInvoiceStatus {
  if (invoice.status === 'Cancelled' || invoice.status === 'Draft' || invoice.status === 'Refund') {
    return invoice.status;
  }
  if (invoice.kind === 'upcoming') {
    return Number(invoice.pendingAmount) <= 0 && Number(invoice.paidAmount) > 0
      ? 'Paid'
      : 'Upcoming';
  }
  if (Number(invoice.pendingAmount) <= 0) {
    return Number(invoice.paidAmount) > 0 || invoice.status === 'Paid' ? 'Paid' : invoice.status;
  }
  if (invoice.dueDate && invoice.dueDate < today) return 'Overdue';
  return 'Due';
}

/** Live targets for bulk fee reminders — always re-resolves status from due date + balance. */
export function listFeeReminderTargets(
  mode: 'overdue' | 'unpaid',
  source?: CenterInvoice[],
): CenterInvoice[] {
  const rows = (source ?? loadCenterInvoices()).map((r) => ({
    ...r,
    status: resolveCenterInvoiceStatus(r),
  }));
  return rows.filter((r) => {
    if (r.kind !== 'invoice') return false;
    if (r.status === 'Cancelled' || r.status === 'Draft' || r.status === 'Refund') return false;
    if (Number(r.pendingAmount) <= 0) return false;
    if (mode === 'overdue') return r.status === 'Overdue';
    return r.status === 'Due' || r.status === 'Overdue' || r.status === 'Pending';
  });
}

/** Re-resolve and persist statuses (e.g. day rollover / after payments). */
export function syncCenterInvoiceStatuses(): CenterInvoice[] {
  const next = loadCenterInvoices().map(enrichInvoice);
  saveCenterInvoices(next);
  return next;
}

/** Fill detail fields for older localStorage rows. */
export function enrichInvoice(row: CenterInvoice): CenterInvoice {
  const lines =
    row.lines && row.lines.length > 0
      ? row.lines
      : [
          {
            id: `${row.id}-line-1`,
            name: row.billingPlan || 'Fee',
            quantity: 1,
            unitPrice: row.invoicedAmount,
            taxPercent: 0,
            amount: row.invoicedAmount,
          },
        ];
  const base: CenterInvoice = {
    ...row,
    billingPeriodStart: row.billingPeriodStart ?? row.invoiceDate,
    billingPeriodEnd: row.billingPeriodEnd ?? row.dueDate,
    createdBy: row.createdBy ?? 'Malika Thimisetty',
    createdOn: row.createdOn ?? row.invoiceDate,
    schoolNotes: row.schoolNotes ?? '',
    parentNotes: row.parentNotes ?? '',
    emailParent: row.emailParent ?? false,
    lines,
    comments: row.comments ?? [],
    feeReminders: row.feeReminders ?? [],
    payments:
      (row.payments?.length ?? 0) > 0
        ? row.payments!
        : row.paidAmount > 0 && row.kind !== 'upcoming'
          ? [
              {
                id: `${row.id}-pay-inferred`,
                receiptId: row.kind === 'debit' ? 'DEBITNOTE-REC-1' : 'REC-1',
                amount: row.paidAmount,
                mode: 'Cash',
                date: row.invoiceDate,
                recordedBy: row.createdBy ?? 'Malika Thimisetty',
                recordedAt: `${row.invoiceDate}T12:00:00.000Z`,
              },
            ]
          : [],
    refunds: row.refunds ?? [],
    totalRefund: row.totalRefund ?? (row.refunds ?? []).reduce((s, r) => s + r.amount, 0),
  };
  return {
    ...base,
    status: resolveCenterInvoiceStatus(base),
  };
}

const DEFAULT_ACTOR = 'Malika Thimisetty';

/** Append a fee-reminder history row and persist it on the invoice. */
export function recordFeeReminder(id: string, sentBy = DEFAULT_ACTOR): CenterInvoice | null {
  const current = getCenterInvoiceById(id);
  if (!current) return null;
  const entry: FeeReminderEntry = {
    id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sentAt: new Date().toISOString(),
    sentBy,
  };
  return updateCenterInvoice(id, {
    feeReminders: [...(current.feeReminders ?? []), entry],
  });
}

/** Illumine-style: "Reminder sent on 04/08/2026 at 5:40 PM by …" */
export function formatFeeReminderLine(entry: FeeReminderEntry) {
  const d = new Date(entry.sentAt);
  if (Number.isNaN(d.getTime())) {
    return `Reminder sent by ${entry.sentBy}`;
  }
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Reminder sent on ${date} at ${time} by ${entry.sentBy}`;
}

const SEED_DISCOUNTS: DiscountDef[] = [
  {
    id: 'disc-early',
    name: 'Early Bird',
    value: 10,
    unit: 'percent',
    kind: 'conditional',
    mode: 'fixed',
    itemCode: 'EB10',
    redemptions: 4,
    conditionalMode: 'date',
    valueOfX: '2026-12-31',
  },
  {
    id: 'disc-sibling',
    name: 'Sibling Discount',
    value: 500,
    unit: 'amount',
    kind: 'standard',
    mode: 'fixed',
    itemCode: 'SIB5',
    redemptions: 12,
  },
  {
    id: 'disc-staff',
    name: 'Staff Child',
    value: 15,
    unit: 'percent',
    kind: 'conditional',
    mode: 'dynamic',
    itemCode: 'STF15',
    sourceField: 'Parent is staff',
    redemptions: 2,
    conditionalMode: 'applications',
    valueOfX: '24',
  },
  {
    id: 'disc-loyalty',
    name: 'Loyalty Annual',
    value: 1000,
    unit: 'amount',
    kind: 'conditional',
    mode: 'fixed',
    itemCode: 'LOY1K',
    redemptions: 0,
    conditionalMode: 'date',
    valueOfX: '2027-03-31',
  },
];

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInrPlain(amount: number) {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatDisplayDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Receipt / payments table label — wallet payments show as Credit Balance. */
export function formatInvoicePaymentMode(mode: string | undefined | null) {
  const raw = (mode || '').trim();
  if (!raw || raw === '-') return '—';
  if (raw === 'Credit' || raw.toLowerCase() === 'credit balance') return 'Credit Balance';
  return raw;
}

export function loadCenterInvoices(): CenterInvoice[] {
  if (!canUseStorage()) return SEED_INVOICES.map(enrichInvoice);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = SEED_INVOICES.map(enrichInvoice);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as CenterInvoice[];
    if (!Array.isArray(parsed)) return SEED_INVOICES.map(enrichInvoice);
    const enriched = parsed.map(enrichInvoice);
    // One-time: add debit seeds only if this store has never had debit notes.
    let next = enriched;
    if (!next.some((r) => r.kind === 'debit')) {
      const debitSeeds = SEED_INVOICES.filter((r) => r.kind === 'debit').map(enrichInvoice);
      next = [...debitSeeds, ...next];
    }
    // Do NOT re-inject individual seed debits — that undoes user deletes.
    // Merge any missing upcoming seed invoices (older localStorage).
    const missingUpcoming = SEED_INVOICES.filter(
      (s) => s.kind === 'upcoming' && !next.some((r) => r.id === s.id),
    ).map(enrichInvoice);
    if (missingUpcoming.length) {
      next = [...missingUpcoming, ...next];
    }
    // Merge payment demo invoices so Payments / dashboard stay populated.
    const missingPaymentSeeds = SEED_INVOICES.filter(
      (s) => (s.payments?.length ?? 0) > 0 && !next.some((r) => r.id === s.id),
    ).map(enrichInvoice);
    if (missingPaymentSeeds.length) {
      next = [...missingPaymentSeeds, ...next];
    }
    if (next !== enriched) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return SEED_INVOICES.map(enrichInvoice);
  }
}

export function saveCenterInvoices(rows: CenterInvoice[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function getCenterInvoiceById(id: string): CenterInvoice | null {
  const row = loadCenterInvoices().find((r) => r.id === id || r.invoiceId === id);
  return row ? enrichInvoice(row) : null;
}

/** Resolve an INV-* ref only when it belongs to the given student. */
export function findCenterInvoiceForStudent(
  invoiceRef: string,
  student: { id: string; name: string },
): CenterInvoice | null {
  const key = invoiceRef.trim().toUpperCase();
  if (!key) return null;
  const rows = loadCenterInvoices();
  const match = rows.find((r) => {
    const idMatch = r.invoiceId.toUpperCase() === key || r.id.toUpperCase() === key;
    if (!idMatch) return false;
    return (
      r.studentId === student.id ||
      r.studentName.trim().toLowerCase() === student.name.trim().toLowerCase()
    );
  });
  return match ? enrichInvoice(match) : null;
}

export function updateCenterInvoice(id: string, patch: Partial<CenterInvoice>) {
  const rows = loadCenterInvoices();
  const next = rows.map((r) => (r.id === id ? enrichInvoice({ ...r, ...patch }) : r));
  saveCenterInvoices(next);
  const row = next.find((r) => r.id === id) ?? null;
  if (row && (row.kind === 'invoice' || row.kind === 'debit')) {
    syncProfile(row);
  }
  return row;
}

export function addCenterInvoice(row: CenterInvoice) {
  const rows = loadCenterInvoices();
  const enriched = enrichInvoice(row);
  const next = [enriched, ...rows];
  saveCenterInvoices(next);
  if (enriched.kind === 'invoice' || enriched.kind === 'debit') {
    syncProfile(enriched);
  }
  return next;
}

export function deleteCenterInvoices(ids: string[]) {
  const idSet = new Set(ids);
  const next = loadCenterInvoices().filter((r) => !idSet.has(r.id) && !idSet.has(r.invoiceId));
  saveCenterInvoices(next);
  return next;
}

export function nextInvoiceId() {
  const rows = loadCenterInvoices().filter((r) => r.kind === 'invoice');
  const max = rows.reduce((n, r) => {
    const m = r.invoiceId.match(/(\d+)/);
    return m ? Math.max(n, Number(m[1])) : n;
  }, 0);
  return `INV-${max + 1}`;
}

export function loadDiscounts(): DiscountDef[] {
  if (!canUseStorage()) return SEED_DISCOUNTS.map(normalizeDiscount);
  try {
    const raw = localStorage.getItem(DISCOUNT_KEY);
    if (!raw) {
      localStorage.setItem(DISCOUNT_KEY, JSON.stringify(SEED_DISCOUNTS));
      return SEED_DISCOUNTS.map(normalizeDiscount);
    }
    const parsed = JSON.parse(raw) as DiscountDef[];
    if (!Array.isArray(parsed)) return SEED_DISCOUNTS.map(normalizeDiscount);
    // Refresh thin legacy seeds so Fee Plan Discount tab has demo depth.
    if (parsed.length <= 2 && !parsed.some((d) => d.itemCode)) {
      localStorage.setItem(DISCOUNT_KEY, JSON.stringify(SEED_DISCOUNTS));
      return SEED_DISCOUNTS.map(normalizeDiscount);
    }
    return parsed.map(normalizeDiscount);
  } catch {
    return SEED_DISCOUNTS.map(normalizeDiscount);
  }
}

function normalizeDiscount(row: DiscountDef): DiscountDef {
  return {
    ...row,
    mode: row.mode ?? 'fixed',
    itemCode: row.itemCode ?? row.id.replace(/^disc-/, '').toUpperCase().slice(0, 6),
    redemptions: row.redemptions ?? 0,
  };
}

export function saveDiscounts(rows: DiscountDef[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(DISCOUNT_KEY, JSON.stringify(rows));
}

export function addDiscount(row: DiscountDef) {
  const next = [normalizeDiscount(row), ...loadDiscounts().filter((d) => d.id !== row.id)];
  saveDiscounts(next);
  return next;
}

export function upsertDiscount(row: DiscountDef) {
  const normalized = normalizeDiscount(row);
  const all = loadDiscounts();
  const idx = all.findIndex((d) => d.id === normalized.id);
  if (idx >= 0) {
    const next = [...all];
    next[idx] = normalized;
    saveDiscounts(next);
  } else {
    saveDiscounts([normalized, ...all]);
  }
  return normalized;
}

export function deleteDiscounts(ids: string[]) {
  const set = new Set(ids);
  saveDiscounts(loadDiscounts().filter((d) => !set.has(d.id)));
}

export function formatDiscountValue(d: DiscountDef) {
  if (d.unit === 'percent') return `${d.value}%`;
  return `₹ ${d.value.toLocaleString('en-IN')}`;
}

export function lineAmount(line: InvoiceLineDraft, _taxMode: 'inclusive' | 'exclusive') {
  const gross = line.quantity * line.unitPrice;
  return Math.max(0, gross - (line.discountAmount || 0));
}

export function lineTaxAmount(line: InvoiceLineDraft, taxMode: 'inclusive' | 'exclusive') {
  const gross = line.quantity * line.unitPrice;
  const afterDisc = Math.max(0, gross - (line.discountAmount || 0));
  if (line.taxPercent <= 0) return 0;
  if (taxMode === 'exclusive') {
    return (afterDisc * line.taxPercent) / 100;
  }
  return afterDisc - afterDisc / (1 + line.taxPercent / 100);
}

export function summarizeLines(lines: InvoiceLineDraft[], taxMode: 'inclusive' | 'exclusive', invoiceDiscount = 0) {
  const subTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const itemsDiscount = lines.reduce((s, l) => s + (l.discountAmount || 0), 0);
  const afterItemDisc = Math.max(0, subTotal - itemsDiscount);
  const withoutTax = Math.max(0, afterItemDisc - invoiceDiscount);

  const tax = lines.reduce((s, l) => {
    const lineBase = Math.max(0, l.quantity * l.unitPrice - (l.discountAmount || 0));
    if (l.taxPercent <= 0 || afterItemDisc <= 0) return s;
    const share = lineBase / afterItemDisc;
    const baseAfterInvoiceDisc = Math.max(0, lineBase - invoiceDiscount * share);
    if (taxMode === 'exclusive') {
      return s + (baseAfterInvoiceDisc * l.taxPercent) / 100;
    }
    const inclusivePortion = baseAfterInvoiceDisc;
    return s + (inclusivePortion - inclusivePortion / (1 + l.taxPercent / 100));
  }, 0);

  const total = taxMode === 'exclusive' ? withoutTax + tax : withoutTax;
  return { subTotal, itemsDiscount, invoiceDiscount, withoutTax, tax, total };
}

const ACTOR = 'Malika Thimisetty';

function syncProfile(_invoice: CenterInvoice, _paymentDate?: string) {
  // Generated Invoice reads invoiceStore live — no profile invoice copy.
}

/** Public alias kept for call sites; no-op (single SoT = center invoices). */
export function syncProfileInvoice(invoice: CenterInvoice, paymentDate?: string) {
  syncProfile(invoice, paymentDate);
}

/** Next REC-n / DEBITNOTE-REC-n for a student. */
export function nextReceiptIdForStudent(
  studentId: string,
  kind: CenterInvoice['kind'] = 'invoice',
) {
  const prefix = kind === 'debit' ? 'DEBITNOTE-REC' : 'REC';
  const rows = loadCenterInvoices().filter(
    (r) => r.studentId === studentId && (kind === 'debit' ? r.kind === 'debit' : r.kind !== 'debit'),
  );
  let max = 0;
  for (const row of rows) {
    for (const payment of row.payments ?? []) {
      const m = payment.receiptId.match(/(\d+)/);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return `${prefix}-${max + 1}`;
}

export function getStudentReceipts(studentId: string, kind?: CenterInvoice['kind']) {
  const rows = loadCenterInvoices().filter((r) => {
    if (r.studentId !== studentId) return false;
    if (kind) return r.kind === kind;
    return true;
  });
  const out: { invoice: CenterInvoice; payment: InvoicePayment }[] = [];
  for (const invoice of rows) {
    for (const payment of invoice.payments ?? []) {
      out.push({ invoice, payment });
    }
  }
  return out.sort(
    (a, b) => new Date(b.payment.recordedAt).getTime() - new Date(a.payment.recordedAt).getTime(),
  );
}

export type PaymentRecord = {
  key: string;
  invoice: CenterInvoice;
  payment: InvoicePayment;
  /** Recorded payments are successful; refunded invoices stay listed as Success for the payment event. */
  status: 'Success';
};

/** Flatten successful payment rows recorded against invoices / debit notes. */
export function listSuccessfulPayments(): PaymentRecord[] {
  const out: PaymentRecord[] = [];
  for (const invoice of loadCenterInvoices()) {
    if (invoice.kind === 'upcoming') continue;
    for (const payment of invoice.payments ?? []) {
      if (payment.amount <= 0) continue;
      out.push({
        key: `${invoice.id}:${payment.id}`,
        invoice,
        payment,
        status: 'Success',
      });
    }
  }
  return out.sort(
    (a, b) =>
      new Date(b.payment.recordedAt || b.payment.date).getTime() -
      new Date(a.payment.recordedAt || a.payment.date).getTime(),
  );
}

export function latestPaymentDate(invoice: CenterInvoice) {
  const payments = invoice.payments ?? [];
  if (!payments.length) return null;
  return [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]?.date;
}

export function nextDebitId() {
  const rows = loadCenterInvoices().filter((r) => r.kind === 'debit');
  const max = rows.reduce((n, r) => {
    const m = r.invoiceId.match(/(\d+)/);
    return m ? Math.max(n, Number(m[1])) : n;
  }, 0);
  return `DEB-${max + 1}`;
}

/** @deprecated Prefer getStudentCreditBalance — kept for overlay placeholders. */
export const PLACEHOLDER_CREDIT_BALANCE = 1250;

export function getStudentCreditBalance(studentId: string) {
  if (!studentId) return 0;
  return creditTotal(loadStudentBilling(studentId).credits);
}

export type RecordPaymentInput = {
  amount: number;
  mode: string;
  date: string;
  reference?: string;
  emailParent?: boolean;
  useCredit?: boolean;
  /** Amount of credit to apply when useCredit is true. */
  creditAmount?: number;
};

export function recordInvoicePayment(id: string, input: RecordPaymentInput): CenterInvoice | null {
  const current = getCenterInvoiceById(id);
  if (!current) return null;

  let applied = 0;
  let mode = input.mode;
  let usedCredit: number | undefined;

  if (input.useCredit) {
    const creditAmt = Math.max(0, Number(input.creditAmount) || 0);
    const want = Math.min(current.pendingAmount, creditAmt);
    const { used } = postCreditUsage(current.studentId, want, {
      invoiceId: current.invoiceId,
      date: input.date,
      recordedBy: ACTOR,
    });
    applied = used;
    mode = 'Credit Balance';
    usedCredit = applied > 0 ? applied : undefined;
  } else {
    applied = Math.min(current.pendingAmount, Math.max(0, input.amount));
  }

  if (applied <= 0) return current;

  const paid = Math.min(current.invoicedAmount, current.paidAmount + applied);
  const pending = Math.max(0, current.invoicedAmount - paid);
  const payment: InvoicePayment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    receiptId: nextReceiptIdForStudent(current.studentId, current.kind),
    amount: applied,
    mode,
    date: input.date,
    reference: input.reference?.trim() || undefined,
    usedCredit,
    emailParent: input.emailParent,
    recordedBy: ACTOR,
    recordedAt: new Date().toISOString(),
  };

  const next = updateCenterInvoice(id, {
    paidAmount: paid,
    pendingAmount: pending,
    status: resolveCenterInvoiceStatus({
      ...current,
      paidAmount: paid,
      pendingAmount: pending,
    }),
    payments: [...(current.payments ?? []), payment],
  });
  // updateCenterInvoice already syncs profile; keep explicit paymentDate for paid status
  if (next) syncProfile(next, input.date);
  return next;
}

export type RecordRefundInput = {
  amount: number;
  mode: string;
  date: string;
  reference?: string;
  addAsCredit?: boolean;
};

export function recordInvoiceRefund(id: string, input: RecordRefundInput): CenterInvoice | null {
  const current = getCenterInvoiceById(id);
  if (!current) return null;
  const amount = Math.min(input.amount, current.paidAmount);
  if (amount <= 0) return current;

  const paid = Math.max(0, current.paidAmount - amount);
  const pending = Math.max(0, current.invoicedAmount - paid);
  const refund: InvoiceRefund = {
    id: `rf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    amount,
    mode: input.mode,
    date: input.date,
    reference: input.reference?.trim() || undefined,
    addAsCredit: Boolean(input.addAsCredit),
    recordedBy: ACTOR,
    recordedAt: new Date().toISOString(),
  };

  if (input.addAsCredit && current.studentId) {
    addStudentCredit(current.studentId, {
      amount,
      description: `Refund from ${current.invoiceId}`,
      paymentMode: input.mode,
      recordedBy: ACTOR,
      issuedAgainst: current.invoiceId,
      reason: `Refund from invoice ${current.invoiceId}`,
      category: 'Refund',
    });
  }

  const next = updateCenterInvoice(id, {
    paidAmount: paid,
    pendingAmount: pending,
    status: resolveCenterInvoiceStatus({
      ...current,
      paidAmount: paid,
      pendingAmount: pending,
    }),
    refunds: [...(current.refunds ?? []), refund],
    totalRefund: (current.totalRefund ?? 0) + amount,
  });
  if (next) syncProfile(next);
  return next;
}

export function isInvoicePaidLike(invoice: CenterInvoice) {
  return invoice.status === 'Paid' || (invoice.pendingAmount <= 0 && invoice.paidAmount > 0);
}

export function invoiceHasReceipts(invoice: CenterInvoice) {
  return (invoice.payments ?? []).length > 0;
}
