export type StudentProfileStatus = 'Active' | 'Enrolled' | 'On Hold' | 'Withdrawn' | 'Prospect';

export type FormShareStatus = 'Shared' | 'Pending' | 'Completed' | 'Expired';

export type InvoicePaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export type DocKind = 'folder' | 'file';

export type StudentProfileTab = 'about' | 'documents' | 'forms' | 'invoices';

export type ProfileField = {
  label: string;
  value: string;
};

export type StudentProfile = {
  id: string;
  name: string;
  studentId: string;
  status: StudentProfileStatus;
  program: string;
  campus: string;
  counselor: string;
  mobile: string;
  email: string;
  photoUrl?: string;
  gender: string;
  dob: string;
  age: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  batch: string;
  course: string;
  admissionStatus: string;
  currentStage: string;
  enquiry: {
    enquiryDate: string;
    leadSource: string;
    campaign: string;
    counselor: string;
    stage: string;
    status: string;
    interestedProgram: string;
    followUpDate: string;
    remarks: string;
  };
  parent: {
    fatherName: string;
    motherName: string;
    guardianName: string;
    relationship: string;
    mobile: string;
    altMobile: string;
    email: string;
    occupation: string;
    address: string;
    emergencyContact: string;
  };
};

export type ProfileDocument = {
  id: string;
  kind: DocKind;
  name: string;
  uploadedAt: string;
  uploadedBy: string;
  size?: string;
  parentId?: string | null;
  fileCount?: number;
};

export type SharedForm = {
  id: string;
  formName: string;
  sharedDate: string;
  sharedBy: string;
  status: FormShareStatus;
  sourceFormId?: string;
};

export type StudentInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  paid: number;
  balance: number;
  paymentStatus: InvoicePaymentStatus;
  dueDate: string;
};

export const SHAREABLE_FORMS = [
  'Admission Form',
  'Scholarship Form',
  'Hostel Form',
  'Medical Form',
  'Transport Form',
  'Consent Form',
  'Fee Declaration Form',
  'Parent Undertaking',
] as const;

export type ShareableFormName = (typeof SHAREABLE_FORMS)[number];
