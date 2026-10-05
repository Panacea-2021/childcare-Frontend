export type AppointmentStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Confirmed';

export type AppointmentPriority = 'low' | 'medium' | 'high';

export type AppointmentAudience = 'enquiry' | 'student';

export type RepeatRule = 'never' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type AppointmentViewMode = 'calendar' | 'list';

export type AppointmentTask = {
  id: string;
  appointmentId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  taskType: string;
  labels: string[];
  description: string;
  createdAt: string;
  status: 'Open' | 'Done';
};

export type AppointmentRecord = {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  facultyName: string;
  calendarId: string;
  calendarName: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  audience: AppointmentAudience;
  notes?: string;
  gender?: string;
  course?: string;
  campus?: string;
  batch?: string;
  relationship?: 'Mother' | 'Father' | 'Guardian';
  repeat: RepeatRule;
  taskCount: number;
  tasks?: AppointmentTask[];
  createdAt: string;
};

export type AppointmentFilters = {
  searchAppointment: string;
  searchParent: string;
  searchStudent: string;
  searchFaculty: string;
  calendarId: string;
  status: 'All' | AppointmentStatus;
  staff: string;
  fromDate: string;
};

export type FacultyCard = {
  id: string;
  name: string;
  department: string;
  initials: string;
  available: boolean;
  todayAppointments: number;
  workload: number;
};

export type StudentOption = {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  gender: string;
  course: string;
  batch: string;
  campus: string;
};

export type CalendarOption = {
  id: string;
  name: string;
  color: string;
  owner: string;
  available: boolean;
  workingHours: string;
  timezone: string;
  bookingDurationMin: number;
  meetingType: string;
  capacity: number;
  bookingLink: string;
};

export type CreateAppointmentDraft = {
  step: number;
  calendarId: string;
  date: string;
  startTime: string;
  endTime: string;
  repeat: RepeatRule;
  audience: AppointmentAudience;
  parentName: string;
  countryCode: string;
  phone: string;
  email: string;
  childName: string;
  gender: string;
  preferredCourse: string;
  campus: string;
  facultyName: string;
  notes: string;
  studentId: string;
  relationship: string;
};

export const DEFAULT_APPOINTMENT_FILTERS: AppointmentFilters = {
  searchAppointment: '',
  searchParent: '',
  searchStudent: '',
  searchFaculty: '',
  calendarId: 'All',
  status: 'All',
  staff: 'All',
  fromDate: '',
};

export const VIEW_STORAGE_KEY = 'panacea.appointments.viewMode';
export const DRAFT_STORAGE_KEY = 'panacea.appointments.createDraft';
export const STORE_KEY = 'panacea.appointments.v2';

/** Appointments UI lives under Enquiries → Tour */
export const TOUR_BASE = '/enquiries/tour';
