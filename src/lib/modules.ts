export type AppModuleChild = {
  id: string;
  label: string;
  href: string;
};

export type AppModule = {
  id: string;
  label: string;
  href: string;
  hasChildren?: boolean;
  children?: AppModuleChild[];
};

export const APP_MODULES: AppModule[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  {
    id: 'center-management',
    label: 'Center Management',
    href: '/center-management',
    hasChildren: true,
    children: [
      { id: 'students', label: 'Students', href: '/center-management/students' },
      { id: 'staff', label: 'Staff', href: '/center-management/staff' },
      { id: 'rooms', label: 'Rooms', href: '/center-management/rooms' },
      { id: 'groups', label: 'Groups', href: '/center-management/groups' },
      { id: 'labels', label: 'Labels', href: '/center-management/labels' },
      { id: 'email-templates', label: 'Email Templates', href: '/center-management/email-templates' },
    ],
  },
  {
    id: 'program',
    label: 'Program',
    href: '/program',
    hasChildren: true,
    children: [
      { id: 'program-list', label: 'Program', href: '/program' },
      { id: 'program-dashboard', label: 'Dashboard', href: '/program/dashboard' },
      { id: 'program-movement', label: 'Program Movement', href: '/program/program-movement' },
    ],
  },
  {
    id: 'attendance-leaves',
    label: 'Attendance & Leaves',
    href: '/attendance-leaves',
    hasChildren: true,
    children: [
      {
        id: 'student-attendance',
        label: 'Student Attendance',
        href: '/attendance-leaves/student-attendance',
      },
      {
        id: 'staff-attendance',
        label: 'Staff Attendance',
        href: '/attendance-leaves/staff-attendance',
      },
      {
        id: 'student-staff-ratio',
        label: 'Student Staff Ratio',
        href: '/attendance-leaves/student-staff-ratio',
      },
      {
        id: 'attendance-forecast',
        label: 'Attendance Forecast',
        href: '/attendance-leaves/attendance-forecast',
      },
    ],
  },
  {
    id: 'parent-communication',
    label: 'Parent Communication',
    href: '/parent-communication',
    hasChildren: true,
    children: [
      { id: 'activities', label: 'Activities', href: '/parent-communication/activities' },
      { id: 'daily-reports', label: 'Daily Reports', href: '/parent-communication/daily-reports' },
      { id: 'notes', label: 'Notes', href: '/parent-communication/notes' },
      { id: 'concerns', label: 'Concerns', href: '/parent-communication/concerns' },
      { id: 'newsletters', label: 'Newsletters', href: '/parent-communication/newsletters' },
      { id: 'resource-center', label: 'Resource Center', href: '/parent-communication/resource-center' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/messages',
    hasChildren: true,
    children: [
      { id: 'parent-messages', label: 'Parent Messages', href: '/messages/parent-messages' },
      { id: 'staff-messages', label: 'Staff Messages', href: '/messages/staff-messages' },
      { id: 'staff-announcement', label: 'Staff Announcement', href: '/messages/staff-announcement' },
    ],
  },
  {
    id: 'billing-accounting',
    label: 'Billing & Accounting',
    href: '/billing-accounting',
    hasChildren: true,
    children: [
      { id: 'billing-dashboard', label: 'Dashboard', href: '/billing-accounting' },
      { id: 'billing-invoices', label: 'Invoices', href: '/billing-accounting/invoices' },
      {
        id: 'billing-student-balances',
        label: 'Student Balances',
        href: '/billing-accounting/student-balances',
      },
      { id: 'billing-payments', label: 'Payments', href: '/billing-accounting/payments' },
      { id: 'billing-fee-plan', label: 'Fee Plan', href: '/billing-accounting/fee-plan' },
      {
        id: 'billing-fee-reminders',
        label: 'Fee Reminders',
        href: '/billing-accounting/fee-reminders',
      },
    ],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    href: '/enquiries',
    hasChildren: true,
    children: [
      { id: 'enquiry-dashboard', label: 'Dashboard', href: '/enquiries/dashboard' },
      { id: 'enquiries-list', label: 'Enquiries', href: '/enquiries' },
      { id: 'enquiry-tasks', label: 'Tasks', href: '/tasks' },
      { id: 'enquiry-forms', label: 'Enquiry Forms', href: '/enquiries/forms' },
      { id: 'enquiry-automations', label: 'Automations', href: '/enquiries/marketing' },
      {
        id: 'enquiry-email-campaigns',
        label: 'Email Campaigns',
        href: '/enquiries/marketing/email-campaigns',
      },
      { id: 'enquiry-facebook', label: 'Facebook', href: '/enquiries/facebook' },
      { id: 'enquiry-whatsapp', label: 'WhatsApp', href: '/enquiries/whatsapp' },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    hasChildren: true,
    children: [
      { id: 'staff-schedule', label: 'Staff Schedule', href: '/calendar/staff-schedule' },
      { id: 'student-schedule', label: 'Student Schedule', href: '/calendar/student-schedule' },
      { id: 'staff-holidays', label: 'Staff Holidays', href: '/calendar/staff-holidays' },
      { id: 'birthday-calendar', label: 'Birthday Calendar', href: '/calendar/birthday-calendar' },
      { id: 'school-calendar', label: 'School Calendar', href: '/calendar' },
      { id: 'meal-planner', label: 'Meal Planner', href: '/calendar/meal-planner' },
    ],
  },
  {
    id: 'progress-tracking',
    label: 'Progress Tracking',
    href: '/progress-tracking',
    hasChildren: true,
    children: [
      { id: 'progress-grid', label: 'Progress Grid', href: '/progress-tracking/progress-grid' },
      { id: 'student-progress', label: 'Student Progress', href: '/progress-tracking/student-progress' },
      { id: 'lesson-plan', label: 'Lesson Plan', href: '/progress-tracking/lesson-plan' },
      { id: 'lesson-set-mapping', label: 'Lesson Set Mapping', href: '/progress-tracking/lesson-set-mapping' },
      { id: 'progress-boards', label: 'Progress Boards', href: '/progress-tracking/progress-boards' },
      { id: 'observations', label: 'Observations', href: '/progress-tracking/observations' },
      { id: 'learning-journey', label: 'Learning Journey', href: '/progress-tracking/learning-journey' },
    ],
  },
  {
    id: 'learning-assessment',
    label: 'Learning & Assessment',
    href: '/learning-assessment',
    hasChildren: true,
    children: [
      { id: 'lessons', label: 'Lessons', href: '/learning-assessment/lessons' },
      { id: 'assessments', label: 'Assessments', href: '/learning-assessment' },
      { id: 'curriculum-document', label: 'Curriculum Document', href: '/learning-assessment/curriculum-document' },
      { id: 'manage', label: 'Manage', href: '/learning-assessment/manage' },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    href: '/forms',
    hasChildren: true,
    children: [
      { id: 'all-forms', label: 'All Forms', href: '/forms' },
      { id: 'admission-process', label: 'Admission Process', href: '/forms/admission-process' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    href: '/tools',
    hasChildren: true,
    children: [
      { id: 'id-cards', label: 'ID Cards', href: '/tools/id-cards' },
      { id: 'certificates', label: 'Certificates', href: '/tools/certificates' },
    ],
  },
  { id: 'reports', label: 'Reports', href: '/reports', hasChildren: true },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    hasChildren: true,
    children: [
      { id: 'settings-programs', label: 'Programs', href: '/settings?section=programs' },
      { id: 'settings-access-control', label: 'Access Control', href: '/settings?section=access-control' },
      { id: 'settings-activity-posts', label: 'Activity Posts', href: '/settings?section=activity-posts' },
      { id: 'settings-attendance', label: 'Attendance', href: '/settings?section=attendance' },
      { id: 'settings-billing', label: 'Billing', href: '/settings?section=billing' },
      { id: 'settings-bus-tracking', label: 'Bus Tracking', href: '/settings?section=bus-tracking' },
      { id: 'settings-cctv', label: 'CCTV', href: '/settings?section=cctv' },
      { id: 'settings-forms', label: 'Forms', href: '/settings?section=forms' },
      { id: 'settings-lesson', label: 'Lesson', href: '/settings?section=lesson' },
      { id: 'settings-roles', label: 'Roles', href: '/settings?section=roles' },
      { id: 'settings-school-details', label: 'School Details', href: '/settings?section=school-details' },
      {
        id: 'settings-staff-leave',
        label: 'Staff Leave Management',
        href: '/settings?section=staff-leave-management',
      },
      { id: 'settings-vaccine-library', label: 'Vaccine Library', href: '/settings?section=vaccine-library' },
      { id: 'settings-email-templates', label: 'Email Templates', href: '/settings?section=email-templates' },
      { id: 'settings-other', label: 'Other Settings', href: '/settings?section=other-settings' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    hasChildren: true,
    children: [
      { id: 'help-product-guide', label: 'Product Guide', href: '/help?section=product-guide' },
      { id: 'help-support', label: 'Support', href: '/help?section=support' },
    ],
  },
  { id: 'language', label: 'Language', href: '/language' },
  { id: 'profile', label: 'Profile', href: '/profile' },
  { id: 'notifications', label: 'Notifications', href: '/notifications' },
];
