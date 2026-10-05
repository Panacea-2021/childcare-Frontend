import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  CheckCircle2,
  Heart,
  Clock3,
  UserX,
} from 'lucide-react';

/** Default pipeline labels — stages are fully dynamic via Stage Management. */
export type EnquiryStage = string;
export type GenderOption = 'Male' | 'Female' | 'Prefer Not to Say';
export type DefaultEnquiryStage =
  | 'Stored'
  | 'Admitted'
  | 'Interested'
  | 'Waitlisted'
  | 'Lost';

export type CustomFieldType =
  | 'Text'
  | 'Number'
  | 'Email'
  | 'Phone'
  | 'Date'
  | 'Textarea'
  | 'Dropdown'
  | 'Checkbox'
  | 'Radio Button';

export type CustomFieldCategory = 'child' | 'enquiry' | 'parent';

export type CustomFieldDef = {
  id: string;
  category: CustomFieldCategory;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type EnquiryActivity = {
  id: string;
  type: 'created' | 'stage' | 'note' | 'appointment' | 'contact';
  title: string;
  description?: string;
  at: string;
};

export type EnquiryRecord = {
  id: string;
  studentName: string;
  preferredName?: string;
  stage: EnquiryStage;
  gender: GenderOption;
  dateOfBirth?: string;
  source: string;
  subSource?: string;
  lostReason?: string;
  program: string;
  assignedTo: string;
  createdOn: string;
  expectedStartDate?: string;
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherCompany?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherCompany?: string;
  school?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  interest?: string;
  customValues?: Record<string, string | boolean>;
  activities?: EnquiryActivity[];
};

export type EnquiryViewMode = 'list' | 'board';

export type EnquiryFilters = {
  search: string;
  stage: 'All' | EnquiryStage;
  assignedTo: 'All' | string;
  source: 'All' | string;
  program: 'All' | string;
  dateFrom: string;
  dateTo: string;
};

export type PendingStageMove = {
  enquiryId: string;
  studentName: string;
  fromStage: EnquiryStage;
  toStage: EnquiryStage;
};

export type ListColumnKey =
  | 'student'
  | 'stage'
  | 'source'
  | 'assignedTo'
  | 'program'
  | 'expectedStart'
  | 'parentContact'
  | 'createdOn'
  | 'actions';

export type FacultyOption = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

export type StatTone = 'stored' | 'admitted' | 'interested' | 'waitlisted' | 'lost' | 'custom';

export type EnquiryStat = {
  id: string;
  label: EnquiryStage;
  count: number;
  subtitle: string;
  trend: string;
  tone: StatTone;
  color?: string;
  Icon: LucideIcon;
};

export const STAGE_OPTIONS: {
  value: DefaultEnquiryStage;
  label: DefaultEnquiryStage;
  tone: Exclude<StatTone, 'custom'>;
}[] = [
  { value: 'Stored', label: 'Stored', tone: 'stored' },
  { value: 'Admitted', label: 'Admitted', tone: 'admitted' },
  { value: 'Interested', label: 'Interested', tone: 'interested' },
  { value: 'Waitlisted', label: 'Waitlisted', tone: 'waitlisted' },
  { value: 'Lost', label: 'Lost', tone: 'lost' },
];

export const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Prefer Not to Say'];

export const SOURCE_OPTIONS = [
  'Facebook Ads',
  'Instagram',
  'WhatsApp',
  'Website',
  'Walk In',
  'Referral',
  'Banner',
  'Newspaper',
  'Event',
  'Google Search',
] as const;

export const SUB_SOURCE_MAP: Record<string, string[]> = {
  Referral: ['Friend', 'Parent', 'Existing Student', 'Relative'],
  'Facebook Ads': ['Campaign A', 'Campaign B', 'Video Ad', 'Lead Form'],
  Website: ['Landing Page', 'Contact Form', 'Chat Widget'],
  WhatsApp: ['Direct Chat', 'QR Code', 'Broadcast'],
  Instagram: ['Story Ad', 'Feed Post', 'DM', 'Bio Link'],
  'Walk In': ['Campus Visit', 'Open House', 'Sibling Visit'],
  Banner: ['Mall Banner', 'Roadside', 'School Gate'],
  Newspaper: ['Local Daily', 'Weekend Special', 'Classified'],
  Event: ['Community Fair', 'Parent Meetup', 'Expo Stall'],
  'Google Search': ['Google Ads', 'Organic Search', 'Maps Listing'],
};

export const CUSTOM_FIELD_TYPES: CustomFieldType[] = [
  'Text',
  'Number',
  'Email',
  'Phone',
  'Date',
  'Textarea',
  'Dropdown',
  'Checkbox',
  'Radio Button',
];

export const STAT_META: Record<
  DefaultEnquiryStage,
  { tone: Exclude<StatTone, 'custom'>; Icon: LucideIcon; subtitle: string }
> = {
  Stored: { tone: 'stored', Icon: Archive, subtitle: 'Students' },
  Admitted: { tone: 'admitted', Icon: CheckCircle2, subtitle: 'Students' },
  Interested: { tone: 'interested', Icon: Heart, subtitle: 'Students' },
  Waitlisted: { tone: 'waitlisted', Icon: Clock3, subtitle: 'Students' },
  Lost: { tone: 'lost', Icon: UserX, subtitle: 'Students' },
};
