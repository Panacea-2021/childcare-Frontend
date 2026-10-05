export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type TimeSlot = { start: string; end: string };

export type DayAvailability = {
  enabled: boolean;
  slots: TimeSlot[];
};

export type FieldVisibility = 'required' | 'optional' | 'hide';

export type CustomFieldType = 'Number' | 'Text' | 'Yes/No Checkbox' | 'Dropdown' | 'Date';

export type CustomField = {
  id: string;
  type: CustomFieldType;
  name: string;
  visibility: FieldVisibility;
};

export type Reminder = {
  id: string;
  amount: number;
  unit: 'days' | 'hours';
};

export type StandardFields = {
  name: FieldVisibility;
  email: FieldVisibility;
  phone: FieldVisibility;
  childName: FieldVisibility;
  childGender: FieldVisibility;
};

export type TourCalendarConfig = {
  id: string;
  name: string;
  labels: string[];
  startDate: string;
  endDate: string;
  maxCapacity: number;
  totalDurationMin: number;
  availability: Record<DayKey, DayAvailability>;
  assignedStaff: string[];
  notifyEmail: boolean;
  notifyInApp: boolean;
  notifyNewBookings: string[];
  notifyCalendarEdits: string[];
  autoAssignStaff: boolean;
  createEnquiryOnBook: boolean;
  defaultEnquiryStatus: string;
  advanceBookingEnabled: boolean;
  advanceBookingDays: number;
  minNoticeEnabled: boolean;
  minNoticeHours: number;
  reminders: Reminder[];
  allowOnStaffHolidays: boolean;
  standardFields: StandardFields;
  customFields: CustomField[];
  formTitle: string;
  hideSchoolLogo: boolean;
  hideSchoolName: boolean;
  hideTitle: boolean;
  hideDuration: boolean;
  fontFamily: string;
  baseSize: number;
  fontWeight: string;
  textColor: string;
  accentColor: string;
  buttonTextColor: string;
  cardBackground: string;
  active: boolean;
  color: string;
};

export type EditorSection =
  | 'basics'
  | 'availability'
  | 'staff'
  | 'booking-rules'
  | 'booking-fields'
  | 'advanced';

export type CalendarsMode = 'list' | 'create' | 'edit' | 'preview';

export const DAY_KEYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_COLORS: Record<DayKey, string> = {
  Mon: '#16a34a',
  Tue: '#ea580c',
  Wed: '#7c3aed',
  Thu: '#2563eb',
  Fri: '#ca8a04',
  Sat: '#db2777',
  Sun: '#64748b',
};

export const LABEL_OPTIONS = ['Open House', 'Tour', 'VIP', 'Weekend', 'Trial'];

export const STAFF_OPTIONS = ['Darshan', 'Priya Nair', 'Ananya Rao', 'Vikram Shah', 'Meera Iyer'];

export const CUSTOM_FIELD_TYPES: CustomFieldType[] = [
  'Number',
  'Text',
  'Yes/No Checkbox',
  'Dropdown',
  'Date',
];

export const ENQUIRY_STATUSES = ['Tour Scheduled', 'New', 'Contacted', 'Closed'];
