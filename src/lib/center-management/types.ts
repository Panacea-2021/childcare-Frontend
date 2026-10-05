export type StudentStatus =
  | 'Active'
  | 'Inactive'
  | 'On Hold'
  | 'Withdrawn'
  | 'Signed up'
  | 'Transferred'
  | 'Graduated';

export type Gender = 'Male' | 'Female' | 'Prefer not to say';

export type DoseStatus = 'Done' | 'Pending' | 'Overdue' | 'Exempt';
export type ExemptionReason = 'Medical' | 'Religious' | 'Personal Belief' | 'Others';

export type VaccineDose = {
  index: number;
  status: DoseStatus;
  administeredOn?: string;
  dueDate?: string;
  notes?: string;
  documentName?: string;
};

export type VaccineRecord = {
  id: string;
  name: string;
  mandatory?: boolean;
  instructionsUrl?: string;
  dosesRequired: number;
  doses: VaccineDose[];
  exempt?: boolean;
  exemptReason?: ExemptionReason;
  exemptNote?: string;
  exemptDocumentName?: string;
};

export type ParentRole = 'Mother' | 'Father';

export type StudentParent = {
  id: string;
  name: string;
  role: ParentRole;
  phone?: string;
  email?: string;
  company?: string;
  allowPickup?: boolean;
  kioskPin?: string;
  photoUrl?: string;
};

export type AuthorizedPickup = {
  id: string;
  name: string;
  relation: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
};

export const PICKUP_RELATIONS = [
  'Mother',
  'Father',
  'Parent',
  'Guardian',
  'Grandparent',
  'Sibling',
  'Aunt',
  'Uncle',
  'Family Friend',
  'Nanny',
  'Other',
] as const;

export type AllergySeverity = 'Mild' | 'Moderate' | 'Severe';

export type AllergyRecord = {
  id: string;
  name: string;
  category: string;
  severity: AllergySeverity;
  symptoms: string;
  parentNotes?: string;
  emergencyPlan?: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
};

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type ProgramEnrollment = {
  id: string;
  programId: string;
  programName: string;
  stage: 'Active' | 'Completed' | 'Upcoming';
  startDate: string;
  endDate: string;
  days: WeekDay[];
  labels: string[];
};

export type AttendanceRecord = {
  id: string;
  date: string;
  room: string;
  checkIn?: string;
  checkInBy?: string;
  checkOut?: string;
  checkOutBy?: string;
  lateCheckIn?: boolean;
  lateCheckOut?: boolean;
  temperature?: string;
  notes?: string;
  markedAbsent?: boolean;
  absentType?: string;
  absentNote?: string;
  leave?: boolean;
  notifyStaff?: string;
};

export type StudentNote = {
  id: string;
  description: string;
  mediaName?: string;
  createdBy: string;
  createdAt: string;
};

export type StudentFormRecord = {
  id: string;
  title: string;
  date: string;
  status: string;
  expiryDate?: string;
  expirySchedule?: string;
  process?: string;
  /** Catalog form id when shared from All Forms */
  sourceFormId?: string;
};

export type GalleryItem = {
  id: string;
  type: 'Photo' | 'Video';
  favourite?: boolean;
  name: string;
  url?: string;
};

export type Student = {
  id: string;
  name: string;
  preferredName: string;
  gender: Gender;
  status: StudentStatus;
  dob: string;
  ageLabel: string;
  registrationDate: string;
  admissionDate: string;
  admissionNumber: string;
  address: string;
  roomIds: string[];
  groupIds: string[];
  programIds: string[];
  upcomingProgramIds: string[];
  programEnrollments: ProgramEnrollment[];
  parents: StudentParent[];
  siblingIds: string[];
  phone: string;
  bloodGroup: string;
  medication: string;
  allergies: AllergyRecord[];
  emergencyContacts: EmergencyContact[];
  authorizedPickups: AuthorizedPickup[];
  vaccines: VaccineRecord[];
  immunizationExemptAll?: boolean;
  immunizationExemptReason?: ExemptionReason;
  immunizationExemptNote?: string;
  immunizationExemptDocumentName?: string;
  attendanceRecords: AttendanceRecord[];
  notes: StudentNote[];
  forms: StudentFormRecord[];
  gallery: GalleryItem[];
  photoUrl?: string;
  deactivatedOn?: string;
  kioskCode?: string;
  /** Multi-center scope — required for org-admin filtering */
  centerId?: string;
};

export type RoomOption = { id: string; name: string; status?: 'Active' | 'Inactive' };
export type GroupOption = { id: string; name: string };
export type ProgramOption = { id: string; name: string };

export type AddStudentInput = {
  name: string;
  preferredName: string;
  gender: Gender;
  status: StudentStatus;
  admissionDate: string;
  roomId: string;
  centerId?: string;
};

export type AddSiblingInput = AddStudentInput & {
  parentIds: string[];
  copyEmergency: boolean;
  copyPickup: boolean;
};
