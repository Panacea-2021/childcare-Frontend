import type {
  ActionType,
  AutomationAction,
  AutomationTemplate,
  MarketingAutomation,
} from './types';

export const ENQUIRY_STATUS_OPTIONS = [
  'New',
  'Assigned',
  'Contact Attempted',
  'Contacted',
  'Follow Up',
  'Interested',
  'Not Interested',
  'Info Shared',
  'Meeting Scheduled',
  'Meeting Completed',
  'Negotiation',
  'Verification In Progress',
  'Approved',
  'Converted',
  'On Hold',
  'Lost',
  'Duplicate',
  'Closed',
] as const;

export const TOUR_OPTIONS = [
  { id: 'campus-tour', label: 'Campus Tour' },
  { id: 'counselling-tour', label: 'Counselling Tour' },
  { id: 'course-orientation', label: 'Course Orientation' },
  { id: 'online-counselling', label: 'Online Counselling' },
] as const;

export const FORM_OPTIONS = [
  { id: 'student-admission', label: 'Student Admission Enquiry' },
  { id: 'website-enquiry', label: 'Website Enquiry' },
  { id: 'course-enquiry', label: 'Course Enquiry' },
  { id: 'scholarship-enquiry', label: 'Scholarship Enquiry' },
  { id: 'contact-us', label: 'Contact Us Form' },
] as const;

export const CONDITION_FIELDS = [
  'Course',
  'Center',
  'Source',
  'Campaign',
  'City',
  'Lead Type',
  'Status',
] as const;

export const CONDITION_OPERATORS = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
] as const;

export const WHATSAPP_TEMPLATES = [
  {
    id: 'wa-interested-followup',
    name: 'Interested Lead Follow-up',
    body: 'Hi {{parentName}}, thanks for your interest in {{course}}. Our counselor will reach out shortly.',
  },
  {
    id: 'wa-tour-reminder',
    name: 'Tour Reminder',
    body: 'Hi {{parentName}}, this is a reminder for your {{tourName}} tomorrow at {{time}}.',
  },
  {
    id: 'wa-welcome',
    name: 'Website Enquiry Welcome',
    body: 'Welcome {{parentName}}! We received your enquiry and will get back within 24 hours.',
  },
  {
    id: 'wa-reengage',
    name: 'Lost Lead Re-engagement',
    body: 'Hi {{parentName}}, we still have seats available for {{course}}. Would you like us to call you?',
  },
] as const;

export const EMAIL_TEMPLATES = [
  {
    id: 'em-welcome',
    name: 'Welcome Email',
    subject: 'Thanks for your enquiry — {{schoolName}}',
    body: 'Dear {{parentName}},\n\nThank you for enquiring about {{course}}. Our team will contact you soon.\n\nRegards,\nAdmissions',
  },
  {
    id: 'em-tour',
    name: 'Tour Confirmation',
    subject: 'Your campus tour is confirmed',
    body: 'Dear {{parentName}},\n\nYour {{tourName}} is scheduled for {{date}} at {{time}}.\n\nSee you soon!',
  },
  {
    id: 'em-followup',
    name: 'Follow-up Email',
    subject: 'Quick follow-up on your enquiry',
    body: 'Hi {{parentName}},\n\nJust checking in regarding your interest in {{course}}. How can we help?',
  },
] as const;

export const SMS_TEMPLATES = [
  {
    id: 'sms-reminder',
    name: 'Tour SMS Reminder',
    body: 'Reminder: Your {{tourName}} is tomorrow at {{time}}. Reply STOP to opt out.',
  },
  {
    id: 'sms-welcome',
    name: 'Welcome SMS',
    body: 'Thanks for contacting {{schoolName}}. We will call you shortly.',
  },
  {
    id: 'sms-followup',
    name: 'Follow-up SMS',
    body: 'Hi {{parentName}}, still interested in {{course}}? Call us anytime.',
  },
] as const;

export const COUNSELOR_OPTIONS = [
  { id: 'c1', label: 'Priya Sharma' },
  { id: 'c2', label: 'Rahul Mehta' },
  { id: 'c3', label: 'Ananya Patel' },
  { id: 'c4', label: 'Vikram Singh' },
] as const;

export const TAG_OPTIONS = [
  'Hot Lead',
  'Warm Lead',
  'UPSC',
  'Scholarship',
  'VIP',
  'Re-engaged',
] as const;

export const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'send_whatsapp', label: 'Send WhatsApp' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_sms', label: 'Send SMS' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'assign_counselor', label: 'Assign Counselor' },
  { value: 'send_notification', label: 'Send Internal Notification' },
  { value: 'update_stage', label: 'Update Enquiry Stage' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'create_appointment', label: 'Create Appointment' },
  { value: 'wait_delay', label: 'Wait/Delay' },
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newCondition() {
  return {
    id: uid('cond'),
    field: 'Course',
    operator: 'is' as const,
    value: '',
  };
}

export function newAction(type: ActionType = 'send_whatsapp'): AutomationAction {
  return {
    id: uid('act'),
    type,
    timing: { mode: 'immediate' },
    waitAmount: 1,
    waitUnit: 'days',
  };
}

export function emptyTrigger() {
  return {
    type: null as null,
    conditions: [] as ReturnType<typeof newCondition>[],
  };
}

const now = new Date();
const iso = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const SEED_AUTOMATIONS: MarketingAutomation[] = [
  {
    id: 'auto_1',
    name: 'Interested Lead Follow-up',
    description: 'WhatsApp + task when a lead becomes Interested.',
    status: 'Active',
    trigger: {
      type: 'stage_change',
      status: 'Interested',
      conditions: [{ id: 'c1', field: 'Course', operator: 'is', value: 'UPSC' }],
    },
    actions: [
      {
        id: 'a1',
        type: 'send_whatsapp',
        timing: { mode: 'immediate' },
        templateId: 'wa-interested-followup',
      },
      {
        id: 'a2',
        type: 'create_task',
        timing: { mode: 'delay', amount: 1, unit: 'hours' },
        taskTitle: 'Call interested lead',
        taskAssignee: 'c1',
      },
    ],
    runs: 124,
    createdBy: 'Admin',
    createdAt: iso(30),
    updatedAt: iso(0),
  },
  {
    id: 'auto_2',
    name: 'Tour Reminder',
    description: 'Remind parents before a scheduled tour.',
    status: 'Active',
    trigger: {
      type: 'tour_booked',
      tourId: 'campus-tour',
      conditions: [],
    },
    actions: [
      {
        id: 'a3',
        type: 'send_whatsapp',
        timing: { mode: 'delay', amount: 1, unit: 'days' },
        templateId: 'wa-tour-reminder',
      },
      {
        id: 'a4',
        type: 'send_sms',
        timing: { mode: 'delay', amount: 2, unit: 'hours' },
        templateId: 'sms-reminder',
      },
    ],
    runs: 86,
    createdBy: 'Priya Sharma',
    createdAt: iso(45),
    updatedAt: iso(2),
  },
  {
    id: 'auto_3',
    name: 'Website Enquiry Welcome',
    description: 'Welcome sequence for website form submissions.',
    status: 'Draft',
    trigger: {
      type: 'form_submission',
      formId: 'website-enquiry',
      conditions: [],
    },
    actions: [
      {
        id: 'a5',
        type: 'send_email',
        timing: { mode: 'immediate' },
        templateId: 'em-welcome',
        subject: 'Thanks for your enquiry — {{schoolName}}',
      },
      {
        id: 'a6',
        type: 'send_whatsapp',
        timing: { mode: 'immediate' },
        templateId: 'wa-welcome',
      },
    ],
    runs: 0,
    createdBy: 'Admin',
    createdAt: iso(5),
    updatedAt: iso(1),
  },
  {
    id: 'auto_4',
    name: 'Lost Lead Re-engagement',
    description: 'Re-engage lost leads with email and a follow-up task.',
    status: 'Paused',
    trigger: {
      type: 'stage_change',
      status: 'Lost',
      conditions: [],
    },
    actions: [
      {
        id: 'a7',
        type: 'send_email',
        timing: { mode: 'delay', amount: 3, unit: 'days' },
        templateId: 'em-followup',
        subject: 'Quick follow-up on your enquiry',
      },
      {
        id: 'a8',
        type: 'create_task',
        timing: { mode: 'delay', amount: 3, unit: 'days' },
        taskTitle: 'Re-engage lost lead',
        taskAssignee: 'c2',
      },
    ],
    runs: 42,
    createdBy: 'Rahul Mehta',
    createdAt: iso(60),
    updatedAt: iso(7),
  },
  {
    id: 'auto_5',
    name: 'Form Lead Assignment',
    status: 'Active',
    trigger: {
      type: 'form_submission',
      formId: 'student-admission',
      conditions: [{ id: 'c2', field: 'City', operator: 'is', value: 'Mumbai' }],
    },
    actions: [
      {
        id: 'a9',
        type: 'assign_counselor',
        timing: { mode: 'immediate' },
        counselorId: 'c1',
      },
      {
        id: 'a10',
        type: 'send_notification',
        timing: { mode: 'immediate' },
        notificationMessage: 'New Mumbai admission enquiry assigned',
      },
    ],
    runs: 210,
    createdBy: 'Admin',
    createdAt: iso(90),
    updatedAt: iso(3),
  },
  {
    id: 'auto_6',
    name: 'Scholarship Nurture Draft',
    status: 'Draft',
    trigger: {
      type: 'form_submission',
      formId: 'scholarship-enquiry',
      conditions: [],
    },
    actions: [
      {
        id: 'a11',
        type: 'add_tag',
        timing: { mode: 'immediate' },
        tag: 'Scholarship',
      },
      {
        id: 'a12',
        type: 'send_email',
        timing: { mode: 'delay', amount: 1, unit: 'days' },
        templateId: 'em-followup',
      },
    ],
    runs: 0,
    createdBy: 'Ananya Patel',
    createdAt: iso(4),
    updatedAt: iso(4),
  },
];

export const SEED_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Interested Lead Nurture',
    description: 'WhatsApp message and counselor task when stage moves to Interested.',
    category: 'Follow-up',
    trigger: {
      type: 'stage_change',
      status: 'Interested',
      conditions: [],
    },
    actions: [
      {
        id: 'ta1',
        type: 'send_whatsapp',
        timing: { mode: 'immediate' },
        templateId: 'wa-interested-followup',
      },
      {
        id: 'ta2',
        type: 'create_task',
        timing: { mode: 'immediate' },
        taskTitle: 'Follow up with interested lead',
        taskAssignee: 'c1',
      },
    ],
    uses: 38,
    createdBy: 'System',
    updatedAt: iso(10),
  },
  {
    id: 'tpl_2',
    name: 'Tour Confirmation Pack',
    description: 'WhatsApp + SMS reminders when a campus tour is booked.',
    category: 'Tours',
    trigger: {
      type: 'tour_booked',
      tourId: 'campus-tour',
      conditions: [],
    },
    actions: [
      {
        id: 'ta3',
        type: 'send_whatsapp',
        timing: { mode: 'immediate' },
        templateId: 'wa-tour-reminder',
      },
      {
        id: 'ta4',
        type: 'send_sms',
        timing: { mode: 'delay', amount: 1, unit: 'days' },
        templateId: 'sms-reminder',
      },
    ],
    uses: 22,
    createdBy: 'System',
    updatedAt: iso(14),
  },
  {
    id: 'tpl_3',
    name: 'Website Welcome Journey',
    description: 'Email and WhatsApp welcome for website form submissions.',
    category: 'Forms',
    trigger: {
      type: 'form_submission',
      formId: 'website-enquiry',
      conditions: [],
    },
    actions: [
      {
        id: 'ta5',
        type: 'send_email',
        timing: { mode: 'immediate' },
        templateId: 'em-welcome',
        subject: 'Thanks for your enquiry — {{schoolName}}',
      },
      {
        id: 'ta6',
        type: 'send_whatsapp',
        timing: { mode: 'immediate' },
        templateId: 'wa-welcome',
      },
    ],
    uses: 51,
    createdBy: 'System',
    updatedAt: iso(20),
  },
  {
    id: 'tpl_4',
    name: 'Lost Lead Win-back',
    description: 'Re-engage lost leads after a short delay.',
    category: 'Re-engagement',
    trigger: {
      type: 'stage_change',
      status: 'Lost',
      conditions: [],
    },
    actions: [
      {
        id: 'ta7',
        type: 'wait_delay',
        timing: { mode: 'immediate' },
        waitAmount: 3,
        waitUnit: 'days',
      },
      {
        id: 'ta8',
        type: 'send_email',
        timing: { mode: 'immediate' },
        templateId: 'em-followup',
      },
      {
        id: 'ta9',
        type: 'create_task',
        timing: { mode: 'immediate' },
        taskTitle: 'Win back lost lead',
      },
    ],
    uses: 17,
    createdBy: 'Admin',
    updatedAt: iso(8),
  },
];

export function actionSummary(actions: AutomationAction[]): string {
  if (!actions.length) return '—';
  const labels = actions.map((a) => {
    switch (a.type) {
      case 'send_whatsapp':
        return 'WhatsApp';
      case 'send_email':
        return 'Email';
      case 'send_sms':
        return 'SMS';
      case 'create_task':
        return 'Task';
      case 'assign_counselor':
        return 'Assign';
      case 'send_notification':
        return 'Notify';
      case 'update_stage':
        return 'Stage';
      case 'add_tag':
        return 'Tag';
      case 'create_appointment':
        return 'Appointment';
      case 'wait_delay':
        return 'Wait';
      default:
        return 'Action';
    }
  });
  const unique = [...new Set(labels)];
  if (unique.length <= 2) return unique.join(' + ');
  return `${unique.slice(0, 2).join(' + ')} +${unique.length - 2}`;
}

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function cloneIds<T extends { id: string }>(items: T[], prefix: string): T[] {
  return items.map((item) => ({ ...item, id: uid(prefix) }));
}

export { uid };
