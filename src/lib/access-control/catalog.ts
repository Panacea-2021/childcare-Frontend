/** Canonical Access Control catalog — single source of truth. */
export type Permission = { id: string; label: string };
export type PermissionGroup = { id: string; label: string; permissions: Permission[] };
export type Category = {
  id: string;
  label: string;
  groups: PermissionGroup[];
  topLevel?: Permission[];
};

export const ACCESS_CONTROL_ROLES = [
  'Finance Admin',
  'Super Admin',
  'Administrator',
  'Principal',
  'Center Head',
  'Teacher',
  'Senior Teacher',
  'Head Teacher',
] as const;

export const ACCESS_CONTROL_CATEGORIES: Category[] = [
  {
    id: 'center-management',
    label: 'Center Management',
    groups: [
      {
        id: 'staff-management',
        label: 'Staff Management',
        permissions: [
          { id: 'cm-staff-update-other-role', label: "Update other 'Staff' member role" },
          { id: 'cm-staff-edit', label: "Add or edit 'Staff' information" },
          { id: 'cm-staff-update-own-role', label: 'Update own role' },
          { id: 'cm-staff-view', label: "View 'Staff' page" },
          { id: 'cm-staff-delete', label: "Delete 'Staff' information" },
        ],
      },
      {
        id: 'student-management',
        label: 'Student Management',
        permissions: [
          { id: 'cm-stu-edit', label: "Edit 'Student' profile details" },
          { id: 'cm-stu-delete', label: "Delete 'Student' profile" },
          { id: 'cm-stu-add', label: "Add new 'Student' profile" },
          { id: 'cm-stu-view', label: "View 'Student' profile page" },
        ],
      },
      {
        id: 'students',
        label: 'Students',
        permissions: [
          { id: 'cm-students-view-page', label: "View 'Students' page with list of students" },
          { id: 'cm-students-signed-up', label: "Show 'Signed Up Students'" },
          { id: 'cm-students-phone', label: "Show 'Phone No' on student list" },
          { id: 'cm-students-info', label: "View 'Student' information details" },
        ],
      },
      {
        id: 'rooms',
        label: 'Rooms',
        permissions: [
          { id: 'cm-rooms-delete', label: "Delete 'Rooms'" },
          { id: 'cm-rooms-create', label: "Create 'Rooms'" },
          { id: 'cm-rooms-rename', label: "Rename 'Rooms'" },
        ],
      },
      {
        id: 'groups',
        label: 'Groups',
        permissions: [
          { id: 'cm-groups-create', label: "Create 'Groups'" },
          { id: 'cm-groups-delete', label: "Delete 'Groups'" },
        ],
      },
      {
        id: 'access-control',
        label: 'Access Control',
        permissions: [
          { id: 'cm-ac-email-templates', label: "Edit 'System Email templates' within 'Settings'" },
          { id: 'cm-ac-fee-reminder', label: "Edit 'Fee Reminder Template'" },
          { id: 'cm-ac-invoices', label: "Show 'illumine invoices' generated for the preschool" },
          { id: 'cm-ac-parent-invite', label: "Edit 'Parent Invitation Email template'" },
          { id: 'cm-ac-resource-add', label: "Add or Update 'Resource Center' documents" },
          { id: 'cm-ac-install-report', label: "View 'Installation Report'" },
          { id: 'cm-ac-resource-view', label: "View 'Resource Center'" },
          { id: 'cm-ac-settings', label: "View or update 'Settings'" },
        ],
      },
      {
        id: 'notes-within-profile',
        label: 'Notes within Profile',
        permissions: [
          { id: 'cm-notes-student', label: "Add / update notes within 'Student Profile'" },
          { id: 'cm-notes-staff', label: "Add / update notes within 'Staff Profile'" },
          { id: 'cm-notes-view-staff', label: "View staff notes within 'Staff Profile'" },
        ],
      },
      {
        id: 'documents-within-profile',
        label: 'Documents within Profile',
        permissions: [
          { id: 'cm-docs-staff', label: "Access 'Documents' uploaded within 'Staff Profile'" },
          { id: 'cm-docs-student', label: "Access 'Documents' within 'Student Profile'" },
        ],
      },
    ],
  },
  {
    id: 'student-attendance',
    label: 'Student Attendance',
    groups: [
      {
        id: 'stu-att',
        label: 'Student Attendance',
        permissions: [
          { id: 'sa-record', label: "Record 'Student Attendance'" },
          { id: 'sa-update', label: "Update 'Student Attendance' details" },
        ],
      },
      {
        id: 'stu-leaves',
        label: 'Student Leaves',
        permissions: [
          { id: 'sl-view', label: "View 'Student Leaves'" },
          { id: 'sl-add', label: "Add 'Student Leaves'" },
          { id: 'sl-approve', label: "Approve 'Student Leave Requests'" },
          { id: 'sl-edit', label: "Edit 'Student Leave' details" },
          { id: 'sl-comment', label: "Comment on 'Student Leave Requests'" },
        ],
      },
    ],
  },
  {
    id: 'staff-attendance',
    label: 'Staff Attendance',
    groups: [
      {
        id: 'stf-att',
        label: 'Staff Attendance',
        permissions: [
          { id: 'sta-update', label: "Update 'Staff Attendance'" },
          { id: 'sta-record', label: "Record 'Staff attendance'" },
        ],
      },
      {
        id: 'stf-leaves',
        label: 'Staff Leaves',
        permissions: [
          { id: 'stl-edit', label: "Edit 'Staff Leave'" },
          { id: 'stl-add', label: "Add 'Staff Leave'" },
          { id: 'stl-approve', label: "Approve Staff 'Leave Requests'" },
          { id: 'stl-view', label: "View 'Staff Leave' page" },
        ],
      },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    groups: [
      {
        id: 'group-messages',
        label: 'Group Messages',
        permissions: [
          { id: 'msg-group-edit', label: "Edit 'Group' details" },
          { id: 'msg-group-create', label: "Create a new 'Group'" },
          { id: 'msg-group-view', label: "View or reply to 'Group Messages'" },
        ],
      },
      {
        id: 'parent-messages',
        label: 'Parent Messages',
        permissions: [
          { id: 'msg-parent-send', label: "Send 'Direct Message' to parents" },
          { id: 'msg-parent-shared', label: 'View or reply to Shared Messages from parents' },
          {
            id: 'msg-parent-read-all',
            label: "Read 'Direct message' and 'Group message's sent by all 'Staff' members",
          },
        ],
      },
      {
        id: 'staff-messages',
        label: 'Staff Messages',
        permissions: [
          { id: 'msg-staff-announce', label: "Post 'Staff Announcement'" },
          { id: 'msg-staff-send', label: "Send a message to 'Staff' via 'Staff Messages'" },
        ],
      },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    groups: [
      {
        id: 'school-calendar',
        label: 'School Calendar',
        permissions: [
          { id: 'cal-comment', label: "Comment on 'Calender'" },
          { id: 'cal-delete', label: "Delete 'Calender'" },
          { id: 'cal-create', label: "Create new 'Calender'" },
          { id: 'cal-media', label: "Add media to 'Calender' details" },
          { id: 'cal-view', label: "View 'Calender' page" },
          { id: 'cal-edit', label: "Edit 'Calender' details" },
        ],
      },
      {
        id: 'student-schedule',
        label: 'Student Schedule',
        permissions: [
          { id: 'cal-ss-view', label: "View 'Student Schedule'" },
          { id: 'cal-ss-edit', label: "Edit 'Student Schedule'" },
          { id: 'cal-ss-create', label: "Create 'Student Schedule'" },
          { id: 'cal-ss-delete', label: "Delete 'Student Schedule'" },
        ],
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    groups: [
      {
        id: 'billing-module',
        label: 'Billing',
        permissions: [
          { id: 'bill-view-dashboard', label: "View 'Billing' Dashboard" },
          { id: 'bill-view-module', label: "View 'Billing' module" },
        ],
      },
      {
        id: 'fee-plan',
        label: 'Fee Plan',
        permissions: [
          { id: 'bill-fp-view', label: "View 'Fee Plans'" },
          { id: 'bill-fp-create-update', label: "Create and update 'Fee Plan'" },
          { id: 'bill-fp-delete', label: "Delete 'Fee Plan'" },
          { id: 'bill-fp-component', label: "Add or update 'Fee Component'" },
        ],
      },
      {
        id: 'payment',
        label: 'Payment',
        permissions: [
          { id: 'bill-pay-update', label: "Update 'Payment Record'" },
          { id: 'bill-record-payment', label: 'Record payment' },
          { id: 'bill-send-reminders', label: "Send 'Reminders'" },
        ],
      },
      {
        id: 'invoice',
        label: 'Invoice',
        permissions: [
          { id: 'bill-inv-credit', label: "Add a 'Credit Note'" },
          { id: 'bill-inv-edit', label: "Edit 'Invoice'" },
          { id: 'bill-inv-fee', label: "Apply 'Fee Component' in an 'Invoice'" },
          { id: 'bill-inv-create', label: "Create 'Invoice'" },
          { id: 'bill-inv-delete', label: "Delete 'Invoice'" },
          { id: 'bill-inv-cancel', label: "Cancel 'Invoice'" },
        ],
      },
      {
        id: 'discount-taxes',
        label: 'Discount & Taxes',
        permissions: [
          { id: 'bill-disc-apply', label: "Apply 'Discount in Fee plan or Invoice'" },
          { id: 'bill-disc-update', label: 'Add or update discount' },
          { id: 'bill-tax-add', label: "Add 'Taxes'" },
        ],
      },
      { id: 'subsidy', label: 'Subsidy', permissions: [] },
      { id: 'quickbooks', label: 'Quickbooks', permissions: [] },
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment',
    groups: [
      {
        id: 'assessments',
        label: 'Assessments',
        permissions: [
          { id: 'as-share', label: "Share 'Assessments' with 'Parents'" },
          { id: 'as-create', label: "Create 'Assessments'" },
          { id: 'as-view', label: "View 'Assessments'" },
          { id: 'as-delete', label: "Delete 'Assessments'" },
        ],
      },
      {
        id: 'student-assessment',
        label: 'Student Assessment',
        permissions: [
          { id: 'as-milestones', label: 'Add or delete milestones and category' },
        ],
      },
      {
        id: 'assessment-settings',
        label: 'Assessment Settings',
        permissions: [
          { id: 'as-framework', label: "Add or update 'Learning Framework'" },
          { id: 'as-manage-page', label: "Show 'Manage Assessments Page'" },
        ],
      },
      {
        id: 'assessment-reports',
        label: 'Assessment Reports',
        permissions: [
          { id: 'as-delete-journey', label: "Delete 'Learning Journey'" },
          { id: 'as-create-journey', label: "Create or update 'Learning Journey'" },
          { id: 'as-share-journey', label: "Share 'Learning Journey PDF' with 'Parents'" },
          { id: 'as-view-journey', label: "View 'Learning Journey' Page" },
          { id: 'as-view-reports', label: "View 'Assessment Reports'" },
        ],
      },
      {
        id: 'observation',
        label: 'Observation',
        permissions: [
          { id: 'as-view-obs-report', label: "View 'Observation Report'" },
          { id: 'as-delete-obs', label: "Delete 'Observations'" },
          { id: 'as-edit-obs', label: "Edit 'Observations'" },
          { id: 'as-add-obs', label: "Add 'Observations'" },
          { id: 'as-view-obs', label: "View 'Observations'" },
        ],
      },
      {
        id: 'assessment-template',
        label: 'Assessment Template',
        permissions: [
          { id: 'as-tmpl-delete', label: "Delete 'Assessment Template'" },
          { id: 'as-tmpl-create', label: "Create 'Assessment Template'" },
          { id: 'as-tmpl-edit', label: "Edit 'Assessment Template'" },
        ],
      },
      { id: 'learning-journey', label: 'Learning Journey', permissions: [] },
    ],
  },
  {
    id: 'ai-features',
    label: 'AI features',
    groups: [
      {
        id: 'ai',
        label: 'AI features',
        permissions: [
          { id: 'ai-use', label: "Use 'AI' features" },
          { id: 'ai-configure', label: "Configure 'AI' settings" },
        ],
      },
    ],
  },
  {
    id: 'lessons',
    label: 'Lessons',
    groups: [
      {
        id: 'lesson-group',
        label: 'Lesson Group',
        permissions: [
          { id: 'les-add-update', label: "Add or update 'Lessons'" },
          { id: 'les-delete', label: 'Delete Lessons' },
          { id: 'les-view', label: 'View Lessons' },
          { id: 'les-share', label: 'Share Lessons' },
        ],
      },
      {
        id: 'lesson-plan',
        label: 'Lesson Plan',
        permissions: [
          { id: 'les-plan-edit', label: "Add or edit 'Weekly Lesson Plan'" },
          { id: 'les-plan-view', label: "View 'Weekly Lesson Plan'" },
        ],
      },
      {
        id: 'curriculum-document',
        label: 'Curriculum Document',
        permissions: [
          { id: 'les-curr-view', label: "View 'Curriculum Documents'" },
          { id: 'les-curr-download', label: "Download 'Curriculum Documents'" },
          { id: 'les-curr-add', label: "Add 'Curriculum Documents'" },
        ],
      },
    ],
  },
  {
    id: 'programs',
    label: 'Programs',
    groups: [
      {
        id: 'programs',
        label: 'Programs',
        permissions: [
          { id: 'prog-view', label: "View 'Programs' page" },
          { id: 'prog-export', label: "Export 'Programs' Data" },
          { id: 'prog-reports', label: "Access 'Program Reports'" },
          { id: 'prog-assign', label: "Assign 'Students' to 'Programs'" },
          { id: 'prog-add-update', label: "Add or update 'Programs'" },
        ],
      },
    ],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    groups: [
      {
        id: 'enquiry',
        label: 'Enquiry',
        permissions: [
          { id: 'enq-add-update', label: "Add or update 'Enquiry'" },
          { id: 'enq-view', label: "View 'Enquiry' page" },
          { id: 'enq-delete', label: "Delete 'Enquiry'" },
        ],
      },
      {
        id: 'enquiry-forms',
        label: 'Enquiry Forms',
        permissions: [
          { id: 'enq-form-reject', label: "Reject 'Enquiry Forms Submissions'" },
          { id: 'enq-form-add-update', label: "Add or update 'Enquiry Forms'" },
          { id: 'enq-form-delete', label: "Delete 'Enquiry Forms'" },
          {
            id: 'enq-form-status',
            label:
              "Update 'Enquiry Form Submission Status' after initial approval or rejection or submission",
          },
          { id: 'enq-form-view-subs', label: "View 'Enquiry Form Submissions'" },
          { id: 'enq-form-view-page', label: "View 'Enquiry Forms' page" },
          { id: 'enq-form-request-changes', label: "Request changes in 'Enquiry Form Submissions'" },
          { id: 'enq-form-approve', label: "Approve 'Enquiry Form Submissions'" },
          { id: 'enq-form-share', label: 'Share Enquiry Forms' },
        ],
      },
      {
        id: 'whatsapp',
        label: 'Whatsapp',
        permissions: [
          { id: 'enq-wa-create-tmpl', label: "Create 'Whatsapp Template'" },
          { id: 'enq-wa-view-msgs', label: "View 'Whatsapp Messages'" },
          { id: 'enq-wa-view-tmpls', label: "View 'Whatsapp Templates'" },
          { id: 'enq-wa-configure', label: "Configure 'Whatsapp'" },
          { id: 'enq-wa-send', label: "Send 'Whatsapp Messages'" },
        ],
      },
      { id: 'enq-sms', label: 'SMS', permissions: [] },
      {
        id: 'enq-facebook',
        label: 'Facebook',
        permissions: [{ id: 'enq-fb-configure', label: "Configure 'Facebook Leads Page'" }],
      },
      { id: 'enq-phone-calls', label: 'Phone Calls', permissions: [] },
    ],
  },
  {
    id: 'safety',
    label: 'Safety and security',
    groups: [
      {
        id: 'cctv',
        label: 'CCTV',
        permissions: [
          { id: 'safe-cctv', label: "View or update 'CCTV' configuration" },
        ],
      },
      {
        id: 'bus-tracking',
        label: 'Bus Tracking',
        permissions: [
          { id: 'safe-bus-edit', label: "Add or edit or delete 'Bus Routes'" },
          { id: 'safe-bus-view', label: "View or track 'Bus Routes'" },
        ],
      },
    ],
  },
  {
    id: 'parent-communication',
    label: 'Parent communication',
    groups: [
      {
        id: 'notes',
        label: 'Notes',
        permissions: [
          { id: 'pc-notes-view', label: "View 'Notes' page" },
          { id: 'pc-notes-done', label: "'Mark as Done'" },
          { id: 'pc-notes-comment', label: "'Comment' on 'Notes'" },
        ],
      },
      {
        id: 'post-activity',
        label: 'Post Activity',
        permissions: [
          { id: 'pc-post-announce', label: "Post 'Student Announcement'" },
          { id: 'pc-post-view', label: "View 'Activity Page'" },
          { id: 'pc-post-add', label: "Add new 'Post'" },
          { id: 'pc-post-no-approval', label: "Post 'Activities' without approval" },
          { id: 'pc-post-delete', label: "Delete 'Post'" },
          { id: 'pc-post-edit', label: "Edit 'Post'" },
        ],
      },
      {
        id: 'voice-notes',
        label: 'Voice notes',
        permissions: [{ id: 'pc-voice', label: "Add or delete 'Voice Note'" }],
      },
      {
        id: 'concern',
        label: 'Concern',
        permissions: [
          { id: 'pc-concern-comment', label: "Comment on 'Concern'" },
          { id: 'pc-concern-resolve', label: "Resolve 'Concern'" },
          { id: 'pc-concern-view', label: "View 'Concerns page'" },
        ],
      },
      {
        id: 'newsletter',
        label: 'Newsletter',
        permissions: [
          { id: 'pc-nl-create', label: "Create 'Newsletters'" },
          { id: 'pc-nl-share', label: "Share 'Newsletters' with 'Students'" },
          { id: 'pc-nl-templates', label: "Add/edit/delete 'Newsletter Templates'" },
        ],
      },
      { id: 'daily-report', label: 'Daily Report', permissions: [] },
      {
        id: 'parent-comments',
        label: 'Parent Comments',
        permissions: [{ id: 'pc-comment-delete', label: 'Delete Parent Comment' }],
      },
    ],
  },
  {
    id: 'tour-management',
    label: 'Tour Management',
    groups: [
      {
        id: 'appointments-tours',
        label: 'Appointments / Tours',
        permissions: [
          { id: 'tour-appt-add', label: "Add an 'Appointment'" },
          { id: 'tour-appt-edit', label: "Edit 'Appointments'" },
          { id: 'tour-appt-view', label: "View 'Tour Management' page" },
        ],
      },
      {
        id: 'blockoff',
        label: 'Blockoff Period',
        permissions: [
          { id: 'tour-bo-delete', label: "Delete 'Blockoff period'" },
          { id: 'tour-bo-edit', label: "Edit 'Blockoff period'" },
          { id: 'tour-bo-add', label: "Add 'Blockoff period'" },
          { id: 'tour-bo-view', label: "View 'Blockoff periods'" },
        ],
      },
      {
        id: 'tour-calendar',
        label: 'Calendar',
        permissions: [
          { id: 'tour-cal-view', label: "View 'Appointment Calendar'" },
          { id: 'tour-cal-delete', label: "Delete 'Appointment Calendar'" },
          { id: 'tour-cal-add', label: "Add 'Appointment Calendar'" },
          { id: 'tour-cal-edit', label: "Edit 'Appointment Calendar'" },
        ],
      },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    groups: [
      {
        id: 'student-forms',
        label: 'Student Forms',
        permissions: [
          { id: 'form-stu-report', label: "View 'Student Form Submission Report'" },
          { id: 'form-stu-approve', label: "Approve 'Student Form Submissions'" },
          { id: 'form-stu-view-subs', label: "View 'Student Form Submissions'" },
          { id: 'form-stu-reject', label: "Reject 'Student Form Submissions'" },
          { id: 'form-stu-view-page', label: "View 'Student Forms' page" },
          { id: 'form-stu-add-update', label: "Add or update 'Student Forms'" },
          { id: 'form-stu-expiry', label: "Configure expiry for 'Student Forms'" },
          {
            id: 'form-stu-status',
            label:
              "Update 'Student Form Submission Status' after initial approval or rejection or submission",
          },
          { id: 'form-stu-request-changes', label: "Request changes in 'Student Form Submissions'" },
          { id: 'form-stu-delete', label: "Delete 'Student Forms'" },
          { id: 'form-stu-share', label: "Share 'Student Forms'" },
        ],
      },
      {
        id: 'staff-forms',
        label: 'Staff Forms',
        permissions: [
          {
            id: 'form-stf-status',
            label:
              "Update 'Staff Form Submission Status' after initial approval or rejection or submission",
          },
          { id: 'form-stf-share', label: "Share 'Staff Forms'" },
          { id: 'form-stf-add-update', label: "Add or update 'Staff Forms'" },
          { id: 'form-stf-delete', label: "Delete 'Staff Forms'" },
          { id: 'form-stf-reject', label: "Reject 'Staff Form Submissions'" },
          { id: 'form-stf-request-changes', label: "Request changes in 'Staff Form Submissions'" },
          { id: 'form-stf-approve', label: "Approve 'Staff Form Submissions'" },
          { id: 'form-stf-view-subs', label: "View 'Staff Forms' Submissions'" },
          { id: 'form-stf-view-page', label: "View 'Staff Forms' page" },
          { id: 'form-stf-expiry', label: "Configure expiry for 'Staff Forms'" },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    groups: [
      {
        id: 'tools',
        label: 'Tools',
        permissions: [
          { id: 'tools-id-cards', label: "Generate 'ID Cards'" },
          { id: 'tools-certificates', label: "Generate 'Certificates'" },
        ],
      },
    ],
  },
  {
    id: 'multi-center',
    label: 'Multi Center Management',
    groups: [
      {
        id: 'multi',
        label: 'Multi Center Management',
        permissions: [
          { id: 'mc-view', label: 'View centers' },
          { id: 'mc-switch', label: 'Switch between centers' },
          { id: 'mc-edit', label: 'Edit multi-center settings' },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    groups: [
      {
        id: 'reports',
        label: 'Reports (View report and favorite)',
        permissions: [
          { id: 'rep-stu-att', label: "Access 'Student Attendance Reports'" },
          { id: 'rep-activity', label: "Access 'Activity Report'" },
          { id: 'rep-enquiry', label: "Access 'Enquiry Reports'" },
          { id: 'rep-student', label: "Access 'Student' Reports'" },
          { id: 'rep-staff-att', label: "Access 'Staff Attendance Reports'" },
          { id: 'rep-billing', label: "Access 'Billing' Reports'" },
        ],
      },
    ],
  },
];

export function allPermissionIds(): string[] {
  const ids: string[] = [];
  for (const cat of ACCESS_CONTROL_CATEGORIES) {
    for (const p of cat.topLevel ?? []) ids.push(p.id);
    for (const g of cat.groups) for (const p of g.permissions) ids.push(p.id);
  }
  return ids;
}

export const ALL_PERMISSION_IDS = allPermissionIds();

export function defaultCheckedForRole(role: string): Set<string> {
  if (role === 'Super Admin' || role === 'Administrator') return new Set(ALL_PERMISSION_IDS);
  if (role === 'Finance Admin') {
    return new Set([
      // Staff Management — matches screenshot (partial)
      'cm-staff-edit',
      'cm-staff-view',
      'cm-staff-delete',
      // Student Management — all
      'cm-stu-edit',
      'cm-stu-delete',
      'cm-stu-add',
      'cm-stu-view',
      // Students — all
      'cm-students-view-page',
      'cm-students-signed-up',
      'cm-students-phone',
      'cm-students-info',
      // Rooms — rename unchecked
      'cm-rooms-delete',
      'cm-rooms-create',
      // Groups — all
      'cm-groups-create',
      'cm-groups-delete',
      // Access Control — partial
      'cm-ac-fee-reminder',
      'cm-ac-parent-invite',
      'cm-ac-install-report',
      'cm-ac-settings',
      // Notes + Documents — all
      'cm-notes-student',
      'cm-notes-staff',
      'cm-notes-view-staff',
      'cm-docs-staff',
      'cm-docs-student',
      // Student Attendance + Student Leaves — all (matches reference)
      'sa-record',
      'sa-update',
      'sl-view',
      'sl-add',
      'sl-approve',
      'sl-edit',
      'sl-comment',
      // Billing — matches reference (Finance Admin partial)
      'bill-view-dashboard',
      'bill-view-module',
      'bill-pay-update',
      'bill-record-payment',
      'bill-send-reminders',
      'bill-inv-create',
      'bill-inv-delete',
      'bill-disc-apply',
      // Assessment Template — all (matches reference)
      'as-tmpl-delete',
      'as-tmpl-create',
      'as-tmpl-edit',
      // Lessons — all (matches reference)
      'les-add-update',
      'les-delete',
      'les-view',
      'les-share',
      'les-plan-edit',
      'les-plan-view',
      'les-curr-view',
      'les-curr-download',
      'les-curr-add',
      // Programs — matches reference (Finance Admin partial)
      'prog-view',
      'prog-export',
      'prog-assign',
      'prog-add-update',
      // Enquiries — Enquiry + Enquiry Forms (Whatsapp/Facebook unchecked)
      'enq-add-update',
      'enq-view',
      'enq-delete',
      'enq-form-reject',
      'enq-form-add-update',
      'enq-form-delete',
      'enq-form-status',
      'enq-form-view-subs',
      'enq-form-view-page',
      'enq-form-request-changes',
      'enq-form-approve',
      'enq-form-share',
      // Safety and security — all (matches reference)
      'safe-cctv',
      'safe-bus-edit',
      'safe-bus-view',
      // Parent communication — matches reference (Finance Admin partial)
      'pc-notes-view',
      'pc-notes-done',
      'pc-notes-comment',
      'pc-post-announce',
      'pc-post-view',
      'pc-post-add',
      'pc-post-delete',
      'pc-post-edit',
      'pc-concern-comment',
      'pc-concern-resolve',
      'pc-concern-view',
      'pc-nl-create',
      'pc-nl-share',
      'pc-nl-templates',
      // Tour Management — all (matches reference)
      'tour-appt-add',
      'tour-appt-edit',
      'tour-appt-view',
      'tour-bo-delete',
      'tour-bo-edit',
      'tour-bo-add',
      'tour-bo-view',
      'tour-cal-view',
      'tour-cal-delete',
      'tour-cal-add',
      'tour-cal-edit',
      // Forms — Student Forms (except report) + Staff Forms expiry only
      'form-stu-approve',
      'form-stu-view-subs',
      'form-stu-reject',
      'form-stu-view-page',
      'form-stu-add-update',
      'form-stu-expiry',
      'form-stu-status',
      'form-stu-request-changes',
      'form-stu-delete',
      'form-stu-share',
      'form-stf-expiry',
      // Tools — all (matches reference)
      'tools-id-cards',
      'tools-certificates',
      // Reports — matches reference (Activity Report unchecked)
      'rep-stu-att',
      'rep-enquiry',
      'rep-student',
      'rep-staff-att',
      'rep-billing',
    ]);
  }
  if (role === 'Teacher' || role === 'Senior Teacher' || role === 'Head Teacher') {
    return new Set(
      ALL_PERMISSION_IDS.filter(
        (id) =>
          id.includes('view') ||
          id.startsWith('sa-') ||
          id.startsWith('sl-') ||
          id.startsWith('msg-') ||
          id.startsWith('cal-') ||
          id.startsWith('les-') ||
          id.startsWith('pc-'),
      ),
    );
  }
  return new Set(ALL_PERMISSION_IDS.filter((id) => id.includes('view')));
}

