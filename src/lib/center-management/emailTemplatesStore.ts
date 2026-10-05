export type EmailTemplateType = 'automated_fee_reminder' | 'enquiry';

export type EmailTemplateAttachment = {
  id: string;
  name: string;
  size?: number;
};

export type EmailTemplate = {
  id: string;
  name: string;
  replyTo: string;
  subject: string;
  labelId: string | null;
  type: EmailTemplateType;
  bodyHtml: string;
  isSystem: boolean;
  status: AutomationStatus;
  updatedBy: string;
  updatedAt: string;
  attachments: EmailTemplateAttachment[];
};

export type AutomationWhen = 'immediate' | number;
export type GenerateFor = 'invoice_creation_date' | 'invoice_due_date';
export type AutomationStatus = 'Active' | 'Inactive';

export type FeeAutomation = {
  id: string;
  title: string;
  templateId: string | null;
  replyTo: string;
  subject: string;
  descriptionHtml: string;
  when: AutomationWhen;
  generateFor: GenerateFor;
  sendPush: boolean;
  status: AutomationStatus;
  createdAt: string;
  updatedAt: string;
};

const TEMPLATES_KEY = 'panacea.centerManagement.emailTemplates';
const AUTOMATIONS_KEY = 'panacea.centerManagement.feeAutomations';
const TEMPLATES_VERSION_KEY = 'panacea.centerManagement.emailTemplates.seedVersion';
const AUTOMATIONS_VERSION_KEY = 'panacea.centerManagement.feeAutomations.seedVersion';
const TEMPLATES_VERSION = '2';
const AUTOMATIONS_VERSION = '2';

export const TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  automated_fee_reminder: 'Automated fee reminder',
  enquiry: 'Enquiry',
};

export const ENQUIRY_TAGS = [
  '{{schoolName}}',
  '{{studentName}}',
  '{{parentName}}',
  '{{parent_one_name}}',
  '{{parent_two_name}}',
] as const;

export const FEE_REMINDER_TAGS = [
  '{{schoolName}}',
  '{{studentName}}',
  '{{invoiceNumber}}',
  '{{dueDate}}',
  '{{pendingAmount}}',
  '{{lateFee}}',
] as const;

export const WHEN_OPTIONS: { value: AutomationWhen; label: string }[] = [
  { value: 'immediate', label: 'Immediate' },
  ...Array.from({ length: 30 }, (_, i) => {
    const n = i + 1;
    return { value: n, label: n === 1 ? '1 day' : `${n} days` };
  }),
];

export const GENERATE_FOR_OPTIONS: { value: GenerateFor; label: string }[] = [
  { value: 'invoice_creation_date', label: 'Invoice creation date' },
  { value: 'invoice_due_date', label: 'Invoice due date' },
];

const FRIENDLY_BODY = `<p>Dear {{studentName}}'s Family,</p>
<p>We hope you are doing well. This is a friendly reminder from {{schoolName}} that your tuition payment (Invoice #: {{invoiceNumber}}) of {{pendingAmount}} is due tomorrow, {{dueDate}}. Please ensure your payment method is ready for processing. If payment is not received by the due date, a late fee of {{lateFee}} may apply. If you have already made the payment, please ignore this message. Thank you for being a valued part of {{schoolName}}.</p>
<p>Warm regards, {{schoolName}}</p>`;

const UPCOMING_BODY = `<p>Dear {{studentName}}'s Family,</p>
<p>This is a gentle note from {{schoolName}} about an upcoming tuition payment. Invoice #: {{invoiceNumber}} for {{pendingAmount}} is approaching its due date of {{dueDate}}. Kindly arrange payment at your earliest convenience. A late fee of {{lateFee}} may apply after the due date.</p>
<p>Thank you,<br/>{{schoolName}}</p>`;

const DUE_TODAY_BODY = `<p>Dear {{studentName}}'s Family,</p>
<p>Your tuition payment (Invoice #: {{invoiceNumber}}) of {{pendingAmount}} is due today, {{dueDate}}. Please complete the payment to avoid a late fee of {{lateFee}}. If you have already paid, please disregard this message.</p>
<p>Warm regards,<br/>{{schoolName}}</p>`;

const GENTLE_BODY = `<p>Dear {{studentName}}'s Family,</p>
<p>We hope you are well. This is a gentle reminder from {{schoolName}} that tuition payment for Invoice #: {{invoiceNumber}} ({{pendingAmount}}) is still pending. The due date was {{dueDate}}. Please arrange payment soon. A late fee of {{lateFee}} may apply.</p>
<p>Thank you for your attention,<br/>{{schoolName}}</p>`;

const SECOND_BODY = `<p>Dear {{studentName}}'s Family,</p>
<p>This is a second reminder from {{schoolName}} regarding Invoice #: {{invoiceNumber}} for {{pendingAmount}}, originally due on {{dueDate}}. Please settle the outstanding balance at your earliest convenience. A late fee of {{lateFee}} may apply if payment remains overdue.</p>
<p>Warm regards,<br/>{{schoolName}}</p>`;

const WELCOME_BODY = `<p>Dear {{parentName}},</p>
<p>Welcome to {{schoolName}}! We are delighted that {{studentName}} will be joining our community. Our team is here to make the first days warm and easy.</p>
<p>Warm regards,<br/>{{schoolName}}</p>`;

const TOUR_BODY = `<p>Dear {{parentName}},</p>
<p>Thank you for your interest in {{schoolName}}. We look forward to showing you around and answering questions about programs for {{studentName}}.</p>
<p>See you soon,<br/>{{schoolName}}</p>`;

const SYSTEM_DATE = '2026-05-20T10:00:00.000Z';

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'et-sys-1',
    name: 'Friendly Reminder! Fees Due Tomorrow',
    replyTo: '',
    subject: 'Friendly Reminder: Invoice due tomorrow',
    labelId: 'lbl-20',
    type: 'automated_fee_reminder',
    bodyHtml: FRIENDLY_BODY,
    isSystem: true,
    status: 'Active',
    updatedBy: 'System generated',
    updatedAt: SYSTEM_DATE,
    attachments: [],
  },
  {
    id: 'et-sys-2',
    name: 'Upcoming Payment Reminder',
    replyTo: '',
    subject: 'Upcoming Tuition Payment',
    labelId: 'lbl-20',
    type: 'automated_fee_reminder',
    bodyHtml: UPCOMING_BODY,
    isSystem: true,
    status: 'Active',
    updatedBy: 'System generated',
    updatedAt: SYSTEM_DATE,
    attachments: [],
  },
  {
    id: 'et-sys-3',
    name: 'Due Today Reminder',
    replyTo: '',
    subject: 'Payment Due Today',
    labelId: null,
    type: 'automated_fee_reminder',
    bodyHtml: DUE_TODAY_BODY,
    isSystem: true,
    status: 'Active',
    updatedBy: 'System generated',
    updatedAt: SYSTEM_DATE,
    attachments: [],
  },
  {
    id: 'et-sys-4',
    name: 'Gentle Reminder! Payment Pending',
    replyTo: '',
    subject: 'Gentle Reminder: Tuition Payment Pending',
    labelId: null,
    type: 'automated_fee_reminder',
    bodyHtml: GENTLE_BODY,
    isSystem: true,
    status: 'Active',
    updatedBy: 'System generated',
    updatedAt: SYSTEM_DATE,
    attachments: [],
  },
  {
    id: 'et-sys-5',
    name: 'Second Reminder',
    replyTo: '',
    subject: 'Second Reminder: Pending Invoice',
    labelId: null,
    type: 'automated_fee_reminder',
    bodyHtml: SECOND_BODY,
    isSystem: true,
    status: 'Inactive',
    updatedBy: 'System generated',
    updatedAt: SYSTEM_DATE,
    attachments: [],
  },
  {
    id: 'et-cust-1',
    name: 'Welcome to Panacea',
    replyTo: 'hello@panacea.care',
    subject: 'Welcome to {{schoolName}}!',
    labelId: 'lbl-21',
    type: 'enquiry',
    bodyHtml: WELCOME_BODY,
    isSystem: false,
    status: 'Active',
    updatedBy: 'Malika Thimisetty',
    updatedAt: '2026-06-02T09:30:00.000Z',
    attachments: [],
  },
  {
    id: 'et-cust-2',
    name: 'Tour Confirmation',
    replyTo: 'tours@panacea.care',
    subject: 'Your campus tour is confirmed',
    labelId: null,
    type: 'enquiry',
    bodyHtml: TOUR_BODY,
    isSystem: false,
    status: 'Active',
    updatedBy: 'Darshan',
    updatedAt: '2026-06-08T14:10:00.000Z',
    attachments: [],
  },
  {
    id: 'et-cust-3',
    name: 'Enrolment Next Steps',
    replyTo: 'admissions@panacea.care',
    subject: 'Next steps for {{studentName}}',
    labelId: 'lbl-21',
    type: 'enquiry',
    bodyHtml: `<p>Dear {{parentName}},</p><p>Thank you for choosing {{schoolName}}. Please complete the enrolment forms so we can prepare for {{studentName}}'s first day.</p><p>Best,<br/>{{schoolName}}</p>`,
    isSystem: false,
    status: 'Active',
    updatedBy: 'Malika Thimisetty',
    updatedAt: '2026-06-15T11:00:00.000Z',
    attachments: [],
  },
];

export const DEFAULT_AUTOMATIONS: FeeAutomation[] = [
  {
    id: 'fa-1',
    title: 'Day-before due reminder',
    templateId: 'et-sys-1',
    replyTo: 'billing@panacea.care',
    subject: 'Friendly Reminder: Invoice due tomorrow',
    descriptionHtml: '<p>Sends a friendly reminder one day before the invoice due date.</p>',
    when: 1,
    generateFor: 'invoice_due_date',
    sendPush: true,
    status: 'Active',
    createdAt: '2026-05-21T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'fa-2',
    title: 'Due today alert',
    templateId: 'et-sys-3',
    replyTo: 'billing@panacea.care',
    subject: 'Payment Due Today',
    descriptionHtml: '<p>Notifies families on the invoice due date.</p>',
    when: 'immediate',
    generateFor: 'invoice_due_date',
    sendPush: true,
    status: 'Active',
    createdAt: '2026-05-21T10:05:00.000Z',
    updatedAt: '2026-06-01T10:05:00.000Z',
  },
  {
    id: 'fa-3',
    title: '3-day overdue follow-up',
    templateId: 'et-sys-4',
    replyTo: 'billing@panacea.care',
    subject: 'Gentle Reminder: Tuition Payment Pending',
    descriptionHtml: '<p>Gentle follow-up three days after the due date.</p>',
    when: 3,
    generateFor: 'invoice_due_date',
    sendPush: false,
    status: 'Active',
    createdAt: '2026-05-22T09:00:00.000Z',
    updatedAt: '2026-06-02T09:00:00.000Z',
  },
  {
    id: 'fa-4',
    title: 'Invoice created notice',
    templateId: 'et-sys-2',
    replyTo: '',
    subject: 'Upcoming Tuition Payment',
    descriptionHtml: '<p>Lets families know when a new invoice is created.</p>',
    when: 'immediate',
    generateFor: 'invoice_creation_date',
    sendPush: false,
    status: 'Inactive',
    createdAt: '2026-05-25T12:00:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
  },
];

export function createEmailId(prefix = 'et'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTemplate(item: Partial<EmailTemplate>): EmailTemplate {
  return {
    id: String(item.id ?? createEmailId()),
    name: String(item.name ?? ''),
    replyTo: String(item.replyTo ?? ''),
    subject: String(item.subject ?? ''),
    labelId: item.labelId ?? null,
    type: item.type === 'enquiry' ? 'enquiry' : 'automated_fee_reminder',
    bodyHtml: String(item.bodyHtml ?? ''),
    isSystem: Boolean(item.isSystem),
    status: item.status === 'Inactive' ? 'Inactive' : 'Active',
    updatedBy: String(item.updatedBy ?? 'You'),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
  };
}

function normalizeAutomation(item: Partial<FeeAutomation>): FeeAutomation {
  const when =
    item.when === 'immediate' || typeof item.when === 'number' ? item.when : 'immediate';
  return {
    id: String(item.id ?? createEmailId('fa')),
    title: String(item.title ?? ''),
    templateId: item.templateId ?? null,
    replyTo: String(item.replyTo ?? ''),
    subject: String(item.subject ?? ''),
    descriptionHtml: String(item.descriptionHtml ?? ''),
    when,
    generateFor:
      item.generateFor === 'invoice_due_date' ? 'invoice_due_date' : 'invoice_creation_date',
    sendPush: Boolean(item.sendPush),
    status: item.status === 'Inactive' ? 'Inactive' : 'Active',
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
  };
}

export function loadEmailTemplates(): EmailTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const version = localStorage.getItem(TEMPLATES_VERSION_KEY);
    if (version !== TEMPLATES_VERSION) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      localStorage.setItem(TEMPLATES_VERSION_KEY, TEMPLATES_VERSION);
      return DEFAULT_TEMPLATES;
    }
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      localStorage.setItem(TEMPLATES_VERSION_KEY, TEMPLATES_VERSION);
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return parsed.map(normalizeTemplate);
  } catch (err) {
    console.error('Failed to load email templates:', err);
    return DEFAULT_TEMPLATES;
  }
}

export function saveEmailTemplates(templates: EmailTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save email templates:', err);
  }
}

export function loadFeeAutomations(): FeeAutomation[] {
  if (typeof window === 'undefined') return DEFAULT_AUTOMATIONS;
  try {
    const version = localStorage.getItem(AUTOMATIONS_VERSION_KEY);
    if (version !== AUTOMATIONS_VERSION) {
      localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(DEFAULT_AUTOMATIONS));
      localStorage.setItem(AUTOMATIONS_VERSION_KEY, AUTOMATIONS_VERSION);
      return DEFAULT_AUTOMATIONS;
    }
    const raw = localStorage.getItem(AUTOMATIONS_KEY);
    if (!raw) {
      localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(DEFAULT_AUTOMATIONS));
      localStorage.setItem(AUTOMATIONS_VERSION_KEY, AUTOMATIONS_VERSION);
      return DEFAULT_AUTOMATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_AUTOMATIONS;
    return parsed.map(normalizeAutomation);
  } catch (err) {
    console.error('Failed to load fee automations:', err);
    return DEFAULT_AUTOMATIONS;
  }
}

export function saveFeeAutomations(items: FeeAutomation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save fee automations:', err);
  }
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function whenBadgeLabel(when: AutomationWhen): string {
  if (when === 'immediate') return 'Email will be sent Immediately';
  const n = Number(when);
  return n === 1
    ? 'Email will be sent after 1 day'
    : `Email will be sent after ${n} days`;
}

export function generateForBadgeLabel(value: GenerateFor): string {
  return value === 'invoice_due_date'
    ? 'Applied on Invoice due date'
    : 'Applied on Invoice creation date';
}

export function tagsForType(type: EmailTemplateType | 'all'): readonly string[] {
  if (type === 'automated_fee_reminder') return FEE_REMINDER_TAGS;
  return ENQUIRY_TAGS;
}
