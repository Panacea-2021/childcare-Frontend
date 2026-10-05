export type ReportCategoryId =
  | 'favorites'
  | 'student-attendance'
  | 'student-info'
  | 'billing'
  | 'staff'
  | 'enquiry'
  | 'tour-management'
  | 'admissions'
  | 'form-submission'
  | 'activity';

export type ReportIconKey =
  | 'clipboardCheck'
  | 'userX'
  | 'clock'
  | 'timer'
  | 'calendarDays'
  | 'calendarRange'
  | 'car'
  | 'calendarClock'
  | 'logIn'
  | 'users'
  | 'cake'
  | 'shieldAlert'
  | 'phone'
  | 'stickyNote'
  | 'userCheck'
  | 'barChart3'
  | 'fileSpreadsheet'
  | 'syringe'
  | 'receipt'
  | 'wallet'
  | 'fileText'
  | 'layers'
  | 'list'
  | 'circleDollarSign'
  | 'badgePercent'
  | 'percent'
  | 'creditCard'
  | 'piggyBank'
  | 'history'
  | 'scale'
  | 'banknote'
  | 'undo2'
  | 'coins'
  | 'scrollText'
  | 'trendingUp'
  | 'calendarClock2'
  | 'hourglass'
  | 'handCoins'
  | 'idCard'
  | 'userRound'
  | 'clipboardList'
  | 'activity'
  | 'gitBranch'
  | 'helpCircle'
  | 'lineChart'
  | 'pieChart'
  | 'radio'
  | 'graduationCap'
  | 'bookOpen'
  | 'listOrdered'
  | 'arrowLeftRight'
  | 'userPlus'
  | 'badgeCheck'
  | 'status'
  | 'building2'
  | 'userMinus'
  | 'doorOpen'
  | 'award'
  | 'formInput'
  | 'clipboardPen'
  | 'sparkles';

export type ReportDefinition = {
  id: string;
  name: string;
  description: string;
  categoryId: Exclude<ReportCategoryId, 'favorites'>;
  section?: string;
  icon: ReportIconKey;
  estimatedTime: string;
};

export type ReportCategory = {
  id: ReportCategoryId;
  label: string;
  description: string;
  icon: ReportIconKey;
};

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'favorites',
    label: 'Favorite Reports',
    description: 'Your starred reports, ready in one place.',
    icon: 'sparkles',
  },
  {
    id: 'student-attendance',
    label: 'Student Attendance',
    description: 'Daily presence, lateness, schedules, and pickup sheets.',
    icon: 'clipboardCheck',
  },
  {
    id: 'student-info',
    label: 'Student Info',
    description: 'Profiles, allergies, contacts, and immunization records.',
    icon: 'users',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Invoices, payments, deposits, aging, and subsidies.',
    icon: 'receipt',
  },
  {
    id: 'staff',
    label: 'Staff',
    description: 'Staff directory and attendance exports.',
    icon: 'idCard',
  },
  {
    id: 'enquiry',
    label: 'Enquiry',
    description: 'Pipeline stages, sources, and lost-enquiry insights.',
    icon: 'gitBranch',
  },
  {
    id: 'tour-management',
    label: 'Tour Management',
    description: 'Appointment and calendar tour enquiry exports.',
    icon: 'calendarClock',
  },
  {
    id: 'admissions',
    label: 'Admissions',
    description: 'Programs, status tracking, transfers, and capacity.',
    icon: 'graduationCap',
  },
  {
    id: 'form-submission',
    label: 'Form Submission Report',
    description: 'Student and staff form submission exports.',
    icon: 'formInput',
  },
  {
    id: 'activity',
    label: 'Activity Report',
    description: 'Classroom activity Excel exports.',
    icon: 'sparkles',
  },
];

export const ALL_REPORTS: ReportDefinition[] = [
  // Student Attendance
  {
    id: 'att-summary',
    name: 'Attendance Summary',
    description: 'Center-wide attendance overview with present, absent, and late totals.',
    categoryId: 'student-attendance',
    icon: 'clipboardCheck',
    estimatedTime: '~12s',
  },
  {
    id: 'att-absentees',
    name: 'Absentees Report',
    description: 'List of students marked absent for the selected period.',
    categoryId: 'student-attendance',
    icon: 'userX',
    estimatedTime: '~10s',
  },
  {
    id: 'att-late',
    name: 'Late Attendance',
    description: 'Students who checked in after the configured late threshold.',
    categoryId: 'student-attendance',
    icon: 'clock',
    estimatedTime: '~10s',
  },
  {
    id: 'att-daily-timecard',
    name: 'Daily Time Card',
    description: 'Day-by-day check-in and check-out timestamps per student.',
    categoryId: 'student-attendance',
    icon: 'timer',
    estimatedTime: '~15s',
  },
  {
    id: 'att-monthly',
    name: 'Monthly Attendance',
    description: 'Monthly attendance matrix for classrooms and individuals.',
    categoryId: 'student-attendance',
    icon: 'calendarDays',
    estimatedTime: '~18s',
  },
  {
    id: 'att-weekly',
    name: 'Weekly Attendance Report',
    description: 'Week-level attendance summary with trend indicators.',
    categoryId: 'student-attendance',
    icon: 'calendarRange',
    estimatedTime: '~14s',
  },
  {
    id: 'att-dropoff-pickup',
    name: 'Drop Off And Pickup Sheet',
    description: 'Authorized drop-off and pickup log for front-desk operations.',
    categoryId: 'student-attendance',
    icon: 'car',
    estimatedTime: '~12s',
  },
  {
    id: 'att-daily-schedule',
    name: 'Daily Schedule Report',
    description: 'Planned classroom schedule with attendance context.',
    categoryId: 'student-attendance',
    icon: 'calendarClock',
    estimatedTime: '~12s',
  },
  {
    id: 'att-checkin-checkout',
    name: 'Check-In / Check-Out Form Records',
    description: 'Form submissions tied to check-in and check-out events.',
    categoryId: 'student-attendance',
    icon: 'logIn',
    estimatedTime: '~14s',
  },

  // Student Info
  {
    id: 'si-students',
    name: 'Students Report',
    description: 'Complete student roster with core profile fields.',
    categoryId: 'student-info',
    icon: 'users',
    estimatedTime: '~15s',
  },
  {
    id: 'si-age',
    name: 'Students Age Report',
    description: 'Age breakdowns and birthdate details for enrolled students.',
    categoryId: 'student-info',
    icon: 'cake',
    estimatedTime: '~10s',
  },
  {
    id: 'si-allergy',
    name: 'Students Allergy Report',
    description: 'Allergy and medical alert export for classrooms and kitchens.',
    categoryId: 'student-info',
    icon: 'shieldAlert',
    estimatedTime: '~10s',
  },
  {
    id: 'si-emergency',
    name: 'Students Emergency Contacts',
    description: 'Emergency contact names, relationships, and phone numbers.',
    categoryId: 'student-info',
    icon: 'phone',
    estimatedTime: '~10s',
  },
  {
    id: 'si-notes',
    name: 'Student Notes',
    description: 'Internal student notes captured by staff.',
    categoryId: 'student-info',
    icon: 'stickyNote',
    estimatedTime: '~12s',
  },
  {
    id: 'si-pickups',
    name: 'Authorised Pickups',
    description: 'Authorized pickup persons linked to each student.',
    categoryId: 'student-info',
    icon: 'userCheck',
    estimatedTime: '~10s',
  },
  {
    id: 'si-count-age',
    name: 'Student Count By Age Group',
    description: 'Headcount grouped by age band for capacity planning.',
    categoryId: 'student-info',
    icon: 'barChart3',
    estimatedTime: '~8s',
  },
  {
    id: 'si-info-sheet',
    name: 'Student Information Sheet',
    description: 'Printable information sheets with key student details.',
    categoryId: 'student-info',
    icon: 'fileSpreadsheet',
    estimatedTime: '~16s',
  },
  {
    id: 'si-immunization',
    name: 'Immunization Report',
    description: 'Immunization status and compliance tracking export.',
    categoryId: 'student-info',
    icon: 'syringe',
    estimatedTime: '~12s',
  },

  // Billing — Student Invoices Information
  {
    id: 'bill-balance',
    name: 'Student Balance',
    description: 'Outstanding balances by student and family account.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'wallet',
    estimatedTime: '~14s',
  },
  {
    id: 'bill-invoices',
    name: 'Invoices',
    description: 'Invoice listing with status, amounts, and due dates.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'fileText',
    estimatedTime: '~16s',
  },
  {
    id: 'bill-fee-plan',
    name: 'Fee Plan',
    description: 'Assigned fee plans and billing schedules.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'layers',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-line-item',
    name: 'Line Item',
    description: 'Invoice line-item detail across students and periods.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'list',
    estimatedTime: '~14s',
  },
  {
    id: 'bill-monthly-charges',
    name: 'Monthly Charges Report',
    description: 'Monthly recurring and one-time charges summary.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'circleDollarSign',
    estimatedTime: '~15s',
  },
  {
    id: 'bill-credit-note',
    name: 'Credit Note Report',
    description: 'Issued credit notes with linked invoices and amounts.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'badgePercent',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-discount',
    name: 'Discount Report',
    description: 'Applied discounts and promotions by student.',
    categoryId: 'billing',
    section: 'Student Invoices Information',
    icon: 'percent',
    estimatedTime: '~12s',
  },

  // Billing — Payment and Deposits
  {
    id: 'bill-payment',
    name: 'Payment Report',
    description: 'Payments received with method, date, and reference.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'creditCard',
    estimatedTime: '~14s',
  },
  {
    id: 'bill-deposit-history',
    name: 'Deposit History',
    description: 'Historical deposit transactions and adjustments.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'piggyBank',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-credit-history',
    name: 'Credit History',
    description: 'Credit ledger activity across family accounts.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'history',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-credit-balance',
    name: 'Credit Balance Report',
    description: 'Current credit balances available for application.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'scale',
    estimatedTime: '~10s',
  },
  {
    id: 'bill-deposit',
    name: 'Deposit Report',
    description: 'Active deposits held and related student accounts.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'banknote',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-refund',
    name: 'Refund Listing Report',
    description: 'Refunds issued with reason, amount, and status.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'undo2',
    estimatedTime: '~12s',
  },
  {
    id: 'bill-daily-collection',
    name: 'Daily Collection Summary',
    description: 'Day-wise cash and electronic collection totals.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'coins',
    estimatedTime: '~10s',
  },
  {
    id: 'bill-customer-statement',
    name: 'Customer Statement',
    description: 'Account statements suitable for parent sharing.',
    categoryId: 'billing',
    section: 'Payment and Deposits',
    icon: 'scrollText',
    estimatedTime: '~16s',
  },

  // Billing — Aging, Compliance & Specialized
  {
    id: 'bill-expense',
    name: 'Expense Report',
    description: 'Center expenses categorized for accounting review.',
    categoryId: 'billing',
    section: 'Aging, Compliance & Specialized Reports',
    icon: 'trendingUp',
    estimatedTime: '~14s',
  },
  {
    id: 'bill-monthly-aging',
    name: 'Monthly Aging Report',
    description: 'Receivables aging buckets by month.',
    categoryId: 'billing',
    section: 'Aging, Compliance & Specialized Reports',
    icon: 'calendarClock2',
    estimatedTime: '~15s',
  },
  {
    id: 'bill-invoice-ageing',
    name: 'Invoice Ageing Report',
    description: 'Invoice-level aging for collections follow-up.',
    categoryId: 'billing',
    section: 'Aging, Compliance & Specialized Reports',
    icon: 'hourglass',
    estimatedTime: '~15s',
  },

  // Billing — Subsidy
  {
    id: 'bill-subsidy',
    name: 'Subsidy Collection',
    description: 'Subsidy collections tracked by program and period.',
    categoryId: 'billing',
    section: 'Subsidy Reports',
    icon: 'handCoins',
    estimatedTime: '~12s',
  },

  // Staff — Staff Data
  {
    id: 'staff-report',
    name: 'Staff Report',
    description: 'Staff directory export with roles and employment details.',
    categoryId: 'staff',
    section: 'Staff Data',
    icon: 'userRound',
    estimatedTime: '~12s',
  },

  // Staff — Staff Attendance
  {
    id: 'staff-att-summary',
    name: 'Attendance Summary',
    description: 'Staff attendance overview for the selected date range.',
    categoryId: 'staff',
    section: 'Staff Attendance',
    icon: 'clipboardList',
    estimatedTime: '~12s',
  },
  {
    id: 'staff-att-absentees',
    name: 'Absentees Report',
    description: 'Staff members marked absent in the selected period.',
    categoryId: 'staff',
    section: 'Staff Attendance',
    icon: 'userX',
    estimatedTime: '~10s',
  },
  {
    id: 'staff-att-late',
    name: 'Late Attendance',
    description: 'Late staff check-ins against shift schedules.',
    categoryId: 'staff',
    section: 'Staff Attendance',
    icon: 'clock',
    estimatedTime: '~10s',
  },
  {
    id: 'staff-att-monthly',
    name: 'Monthly Attendance',
    description: 'Monthly staff attendance matrix for payroll review.',
    categoryId: 'staff',
    section: 'Staff Attendance',
    icon: 'calendarDays',
    estimatedTime: '~16s',
  },
  {
    id: 'staff-att-timecard',
    name: 'Daily Time Card',
    description: 'Daily staff time cards with punch details.',
    categoryId: 'staff',
    section: 'Staff Attendance',
    icon: 'timer',
    estimatedTime: '~14s',
  },

  // Enquiry
  {
    id: 'enq-report',
    name: 'Enquiry Report',
    description: 'Full enquiry listing with stage and owner details.',
    categoryId: 'enquiry',
    icon: 'clipboardList',
    estimatedTime: '~12s',
  },
  {
    id: 'enq-activity',
    name: 'Enquiry Activity Log',
    description: 'Chronological log of enquiry interactions and updates.',
    categoryId: 'enquiry',
    icon: 'activity',
    estimatedTime: '~14s',
  },
  {
    id: 'enq-count-stage',
    name: 'Enquiry Count By Stage',
    description: 'Pipeline snapshot of enquiries grouped by stage.',
    categoryId: 'enquiry',
    icon: 'gitBranch',
    estimatedTime: '~8s',
  },
  {
    id: 'enq-lost',
    name: 'Lost Enquiry Reasons',
    description: 'Reasons captured when enquiries are marked lost.',
    categoryId: 'enquiry',
    icon: 'helpCircle',
    estimatedTime: '~10s',
  },
  {
    id: 'enq-weekly',
    name: 'Weekly Enquiry Summary',
    description: 'Week-over-week enquiry volume and conversion summary.',
    categoryId: 'enquiry',
    icon: 'lineChart',
    estimatedTime: '~12s',
  },
  {
    id: 'enq-cumulative',
    name: 'Cumulative Enquiry By Stage',
    description: 'Cumulative stage progression for funnel analysis.',
    categoryId: 'enquiry',
    icon: 'pieChart',
    estimatedTime: '~12s',
  },
  {
    id: 'enq-source',
    name: 'Enquiry Source Report',
    description: 'Lead sources contributing to enquiry volume.',
    categoryId: 'enquiry',
    icon: 'radio',
    estimatedTime: '~10s',
  },

  // Tour Management
  {
    id: 'tour-appointment',
    name: 'Appointment Report',
    description: 'Details about enquiries created from calendars.',
    categoryId: 'tour-management',
    icon: 'calendarClock',
    estimatedTime: '~12s',
  },

  // Admissions — Programs
  {
    id: 'adm-program-students',
    name: 'Program Students Report',
    description: 'Students enrolled in each program with status.',
    categoryId: 'admissions',
    section: 'Programs',
    icon: 'bookOpen',
    estimatedTime: '~14s',
  },
  {
    id: 'adm-programs',
    name: 'Programs Report',
    description: 'Program catalog with capacity and enrollment counts.',
    categoryId: 'admissions',
    section: 'Programs',
    icon: 'listOrdered',
    estimatedTime: '~10s',
  },
  {
    id: 'adm-deferred',
    name: 'Deferred List Report',
    description: 'Students deferred with deferred dates and reasons.',
    categoryId: 'admissions',
    section: 'Programs',
    icon: 'hourglass',
    estimatedTime: '~12s',
  },
  {
    id: 'adm-transfer-programs',
    name: 'Transfer Campus List With Programs',
    description: 'Campus transfers including destination programs.',
    categoryId: 'admissions',
    section: 'Programs',
    icon: 'arrowLeftRight',
    estimatedTime: '~14s',
  },
  {
    id: 'adm-new-joiner',
    name: 'New Joiner Breakdown By Month',
    description: 'Monthly new admissions broken down by program.',
    categoryId: 'admissions',
    section: 'Programs',
    icon: 'userPlus',
    estimatedTime: '~12s',
  },

  // Admissions — Status Tracking
  {
    id: 'adm-active',
    name: 'Active Students Report',
    description: 'Currently active students across rooms and programs.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'badgeCheck',
    estimatedTime: '~12s',
  },
  {
    id: 'adm-status',
    name: 'Student Status Report',
    description: 'Students grouped by admissions and enrollment status.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'status',
    estimatedTime: '~12s',
  },
  {
    id: 'adm-transfer-campus',
    name: 'Transfer Campus List Report',
    description: 'Campus transfer requests and completed transfers.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'building2',
    estimatedTime: '~12s',
  },
  {
    id: 'adm-withdrawal',
    name: 'Withdrawal Report',
    description: 'Withdrawn students with exit dates and reasons.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'userMinus',
    estimatedTime: '~12s',
  },
  {
    id: 'adm-room-capacity',
    name: 'Room Capacity Report',
    description: 'Room utilization versus licensed capacity.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'doorOpen',
    estimatedTime: '~10s',
  },
  {
    id: 'adm-graduated',
    name: 'Graduated Students Report',
    description: 'Students who graduated from programs or age groups.',
    categoryId: 'admissions',
    section: 'Admissions Status Tracking',
    icon: 'award',
    estimatedTime: '~12s',
  },

  // Form Submission
  {
    id: 'form-student',
    name: 'Student Form Submission Report',
    description: 'Student form completions, pending items, and timestamps.',
    categoryId: 'form-submission',
    icon: 'formInput',
    estimatedTime: '~14s',
  },
  {
    id: 'form-staff',
    name: 'Staff Form Submission Report',
    description: 'Staff form submissions and compliance status.',
    categoryId: 'form-submission',
    icon: 'clipboardPen',
    estimatedTime: '~14s',
  },

  // Activity
  {
    id: 'activity-excel',
    name: 'Activity Excel Report',
    description: 'Export classroom activities for archival and sharing.',
    categoryId: 'activity',
    icon: 'sparkles',
    estimatedTime: '~16s',
  },
];

export function getReportsByCategory(categoryId: Exclude<ReportCategoryId, 'favorites'>) {
  return ALL_REPORTS.filter((r) => r.categoryId === categoryId);
}

export function getCategoryLabel(categoryId: ReportCategoryId) {
  return REPORT_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function groupReportsBySection(reports: ReportDefinition[]) {
  const sections: { title: string | null; reports: ReportDefinition[] }[] = [];
  const map = new Map<string | null, ReportDefinition[]>();

  for (const report of reports) {
    const key = report.section ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(report);
  }

  for (const [title, items] of map) {
    sections.push({ title, reports: items });
  }
  return sections;
}
