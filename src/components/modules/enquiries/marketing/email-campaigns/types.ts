export type CampaignStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Sending'
  | 'Sent'
  | 'Paused'
  | 'Failed';

export type TemplateCategory =
  | 'Admissions'
  | 'Events'
  | 'Announcements'
  | 'Parent Communication'
  | 'School Updates'
  | 'Promotions'
  | 'Welcome'
  | 'Follow-up'
  | 'Newsletter';

export type AudienceType =
  | 'all_parents'
  | 'parents_of_students'
  | 'students'
  | 'staff'
  | 'prospective_parents'
  | 'new_enquiries'
  | 'active_enquiries'
  | 'interested_leads'
  | 'custom';

export type EmailBlockType =
  | 'logo'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'footer'
  | 'html';

export type BlockAlign = 'left' | 'center' | 'right';

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  content: string;
  align?: BlockAlign;
  href?: string;
  meta?: Record<string, string>;
};

export type CampaignAttachment = {
  id: string;
  name: string;
  sizeLabel: string;
  sizeBytes: number;
  mimeType: string;
};

export type AudienceFilters = {
  audienceType: AudienceType | '';
  className: string;
  section: string;
  campus: string;
  admissionStatus: string;
};

export type ScheduleMode = 'now' | 'later';

export type CampaignAnalytics = {
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  conversions: number;
};

export type RecipientActivityStatus =
  | 'Delivered'
  | 'Opened'
  | 'Clicked'
  | 'Bounced'
  | 'Unsubscribed';

export type RecipientActivity = {
  id: string;
  contactName: string;
  email: string;
  status: RecipientActivityStatus;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  converted: boolean;
};

export type EmailCampaign = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  previewText: string;
  audienceLabel: string;
  audience: AudienceFilters;
  recipientCount: number;
  channel: 'Email';
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
  blocks: EmailBlock[];
  attachments: CampaignAttachment[];
  scheduleMode: ScheduleMode;
  timezone: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  analytics?: CampaignAnalytics;
  recipients?: RecipientActivity[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
  updatedAt: string;
  previewAccent: string;
};

export const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: 'all_parents', label: 'All Parents' },
  { value: 'parents_of_students', label: 'Parents of Students' },
  { value: 'students', label: 'Students' },
  { value: 'staff', label: 'Staff' },
  { value: 'prospective_parents', label: 'Prospective Parents' },
  { value: 'new_enquiries', label: 'New Enquiries' },
  { value: 'active_enquiries', label: 'Active Enquiries' },
  { value: 'interested_leads', label: 'Interested Leads' },
  { value: 'custom', label: 'Custom Audience' },
];

export const TEMPLATE_CATEGORIES: Array<TemplateCategory | 'All'> = [
  'All',
  'Admissions',
  'Events',
  'Announcements',
  'Parent Communication',
  'School Updates',
  'Promotions',
  'Welcome',
  'Follow-up',
  'Newsletter',
];

export const STATUS_BADGE_CLASS: Record<CampaignStatus, string> = {
  Draft: 'ec-badge ec-badge-draft',
  Scheduled: 'ec-badge ec-badge-scheduled',
  Sending: 'ec-badge ec-badge-sending',
  Sent: 'ec-badge ec-badge-sent',
  Paused: 'ec-badge ec-badge-paused',
  Failed: 'ec-badge ec-badge-failed',
};

export const SENDER_OPTIONS = [
  { name: 'Bright Future Academy', email: 'admissions@school.com' },
  { name: 'School Office', email: 'office@school.com' },
  { name: 'Principal Office', email: 'principal@school.com' },
];
