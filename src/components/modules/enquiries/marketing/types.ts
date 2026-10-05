export type AutomationStatus = 'Active' | 'Draft' | 'Paused';

export type TriggerType = 'stage_change' | 'tour_booked' | 'form_submission';

export type ActionType =
  | 'send_whatsapp'
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'assign_counselor'
  | 'send_notification'
  | 'update_stage'
  | 'add_tag'
  | 'create_appointment'
  | 'wait_delay';

export type DelayUnit = 'minutes' | 'hours' | 'days';

export type ConditionOperator = 'is' | 'is_not' | 'contains' | 'equals';

export type AutomationCondition = {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
};

export type ActionTiming =
  | { mode: 'immediate' }
  | { mode: 'delay'; amount: number; unit: DelayUnit };

export type AutomationAction = {
  id: string;
  type: ActionType;
  timing: ActionTiming;
  /** Action-specific config */
  templateId?: string;
  subject?: string;
  body?: string;
  taskTitle?: string;
  taskAssignee?: string;
  counselorId?: string;
  notificationMessage?: string;
  stage?: string;
  tag?: string;
  appointmentType?: string;
  waitAmount?: number;
  waitUnit?: DelayUnit;
};

export type AutomationTrigger = {
  type: TriggerType | null;
  /** Stage Change */
  status?: string;
  formAsSource?: string;
  /** Tour Booked */
  tourId?: string;
  /** Form Submission */
  formId?: string;
  conditions: AutomationCondition[];
};

export type MarketingAutomation = {
  id: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  runs: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Optional link to template it was created from */
  templateId?: string;
};

export type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  uses: number;
  createdBy: string;
  updatedAt: string;
};

export type BuilderStep = 1 | 2 | 3;

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  stage_change: 'Stage Change',
  tour_booked: 'Tour Booked',
  form_submission: 'Form Submission',
};

export const ACTION_LABELS: Record<ActionType, string> = {
  send_whatsapp: 'Send WhatsApp',
  send_email: 'Send Email',
  send_sms: 'Send SMS',
  create_task: 'Create Task',
  assign_counselor: 'Assign Counselor',
  send_notification: 'Send Internal Notification',
  update_stage: 'Update Enquiry Stage',
  add_tag: 'Add Tag',
  create_appointment: 'Create Appointment',
  wait_delay: 'Wait/Delay',
};

export const STATUS_BADGE_CLASS: Record<AutomationStatus, string> = {
  Active: 'ui-badge ui-badge-mint',
  Draft: 'ui-badge ui-badge-lavender',
  Paused: 'ui-badge ui-badge-blush',
};
