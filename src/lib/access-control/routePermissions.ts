/**
 * Route → permission rules for the admin app.
 * ANY of the listed permissions grants access. Empty = authenticated only.
 */

export type RoutePermissionRule = {
  /** Path prefix or exact path (no trailing slash except root) */
  pattern: string;
  /** Match exact path only when true */
  exact?: boolean;
  /** ANY of these permissions allows access; empty = any authenticated staff */
  anyOf?: string[];
};

/**
 * More specific rules should appear before broader prefixes.
 */
export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  { pattern: '/dashboard', anyOf: [] },

  { pattern: '/center-management/students', anyOf: ['cm-students-view-page', 'cm-stu-view'] },
  { pattern: '/center-management/staff', anyOf: ['cm-staff-view'] },
  { pattern: '/center-management/rooms', anyOf: ['cm-rooms-create', 'cm-rooms-delete', 'cm-rooms-rename'] },
  { pattern: '/center-management/groups', anyOf: ['cm-groups-create', 'cm-groups-delete'] },
  { pattern: '/center-management/labels', anyOf: ['cm-ac-settings'] },
  { pattern: '/center-management/email-templates', anyOf: ['cm-ac-email-templates', 'cm-ac-settings'] },
  { pattern: '/center-management', anyOf: ['cm-students-view-page', 'cm-staff-view', 'cm-rooms-create', 'cm-groups-create'] },

  {
    pattern: '/attendance-leaves/student-attendance',
    anyOf: ['sa-record', 'sa-update', 'sl-view', 'sl-add', 'sl-approve', 'sl-edit', 'sl-comment'],
  },
  {
    pattern: '/attendance-leaves/staff-attendance',
    anyOf: ['sta-record', 'sta-update', 'stl-view', 'stl-add', 'stl-edit', 'stl-approve'],
  },
  {
    pattern: '/attendance-leaves/student-staff-ratio',
    anyOf: ['sa-record', 'sa-update', 'sta-record', 'sta-update'],
  },
  {
    pattern: '/attendance-leaves/attendance-forecast',
    anyOf: ['sa-record', 'sa-update', 'rep-stu-att'],
  },
  {
    pattern: '/attendance-leaves',
    anyOf: ['sa-record', 'sa-update', 'sta-record', 'sta-update', 'sl-view', 'stl-view'],
  },

  {
    pattern: '/parent-communication/activities',
    anyOf: ['pc-post-view', 'pc-post-add', 'pc-post-edit', 'pc-post-delete', 'pc-post-announce'],
  },
  { pattern: '/parent-communication/daily-reports', anyOf: ['pc-post-view', 'pc-notes-view'] },
  { pattern: '/parent-communication/notes', anyOf: ['pc-notes-view', 'pc-notes-done', 'pc-notes-comment'] },
  {
    pattern: '/parent-communication/concerns',
    anyOf: ['pc-concern-view', 'pc-concern-comment', 'pc-concern-resolve'],
  },
  {
    pattern: '/parent-communication/newsletters',
    anyOf: ['pc-nl-create', 'pc-nl-share', 'pc-nl-templates'],
  },
  {
    pattern: '/parent-communication/resource-center',
    anyOf: ['cm-ac-resource-view', 'cm-ac-resource-add'],
  },
  {
    pattern: '/parent-communication',
    anyOf: [
      'pc-post-view',
      'pc-notes-view',
      'pc-concern-view',
      'pc-nl-create',
      'cm-ac-resource-view',
    ],
  },

  { pattern: '/messages/parent-messages', anyOf: ['msg-parent-send', 'msg-parent-shared', 'msg-parent-read-all'] },
  { pattern: '/messages/staff-messages', anyOf: ['msg-staff-send'] },
  { pattern: '/messages/staff-announcement', anyOf: ['msg-staff-announce'] },
  {
    pattern: '/messages',
    anyOf: ['msg-parent-send', 'msg-parent-shared', 'msg-staff-send', 'msg-staff-announce', 'msg-group-view'],
  },

  { pattern: '/billing-accounting/invoices', anyOf: ['bill-inv-create', 'bill-inv-edit', 'bill-inv-delete', 'bill-inv-cancel', 'bill-view-module'] },
  { pattern: '/billing-accounting/payments', anyOf: ['bill-record-payment', 'bill-pay-update', 'bill-view-module'] },
  { pattern: '/billing-accounting/fee-plan', anyOf: ['bill-fp-view', 'bill-fp-create-update', 'bill-fp-delete', 'bill-fp-component'] },
  { pattern: '/billing-accounting/fee-reminders', anyOf: ['bill-send-reminders', 'cm-ac-fee-reminder'] },
  { pattern: '/billing-accounting/student-balances', anyOf: ['bill-view-module', 'bill-view-dashboard'] },
  { pattern: '/billing-accounting', anyOf: ['bill-view-dashboard', 'bill-view-module'] },

  { pattern: '/enquiries/dashboard', anyOf: ['enq-view'] },
  { pattern: '/enquiries/forms', anyOf: ['enq-form-view-page', 'enq-form-add-update', 'enq-form-view-subs'] },
  { pattern: '/enquiries/marketing', anyOf: ['enq-view', 'enq-form-share'] },
  { pattern: '/enquiries/facebook', anyOf: ['enq-fb-configure'] },
  { pattern: '/enquiries/whatsapp', anyOf: ['enq-wa-configure', 'enq-wa-view-msgs', 'enq-wa-send'] },
  { pattern: '/enquiries/tour', anyOf: ['tour-appt-view', 'tour-appt-add', 'tour-appt-edit'] },
  { pattern: '/enquiries', anyOf: ['enq-view', 'enq-add-update', 'enq-delete'] },
  { pattern: '/tasks', anyOf: ['enq-view', 'enq-add-update'] },

  { pattern: '/calendar/student-schedule', anyOf: ['cal-ss-view', 'cal-ss-edit', 'cal-ss-create', 'cal-ss-delete'] },
  { pattern: '/calendar/staff-schedule', anyOf: ['cal-view', 'cal-edit'] },
  { pattern: '/calendar/staff-holidays', anyOf: ['cal-view'] },
  { pattern: '/calendar/birthday-calendar', anyOf: ['cal-view'] },
  { pattern: '/calendar/meal-planner', anyOf: ['cal-view'] },
  { pattern: '/calendar', anyOf: ['cal-view', 'cal-create', 'cal-edit', 'cal-ss-view'] },

  {
    pattern: '/progress-tracking/observations',
    anyOf: ['as-view-obs', 'as-add-obs', 'as-edit-obs', 'as-delete-obs', 'as-view-obs-report'],
  },
  {
    pattern: '/progress-tracking/learning-journey',
    anyOf: ['as-view-journey', 'as-create-journey', 'as-delete-journey', 'as-share-journey'],
  },
  {
    pattern: '/progress-tracking/lesson-plan',
    anyOf: ['les-plan-view', 'les-plan-edit'],
  },
  {
    pattern: '/progress-tracking',
    anyOf: ['as-view', 'as-view-reports', 'as-view-journey', 'les-plan-view', 'as-view-obs'],
  },

  { pattern: '/learning-assessment/lessons', anyOf: ['les-view', 'les-add-update', 'les-delete', 'les-share'] },
  {
    pattern: '/learning-assessment/curriculum-document',
    anyOf: ['les-curr-view', 'les-curr-download', 'les-curr-add'],
  },
  { pattern: '/learning-assessment/manage', anyOf: ['as-manage-page', 'as-framework', 'as-tmpl-create', 'as-tmpl-edit'] },
  {
    pattern: '/learning-assessment',
    anyOf: ['as-view', 'as-create', 'as-delete', 'as-share', 'as-manage-page'],
  },

  { pattern: '/program', anyOf: ['prog-view', 'prog-add-update', 'prog-assign', 'prog-export', 'prog-reports'] },

  { pattern: '/forms/admission-process', anyOf: ['form-stu-view-page', 'form-stu-add-update'] },
  {
    pattern: '/forms',
    anyOf: ['form-stu-view-page', 'form-stf-view-page', 'form-stu-add-update', 'form-stf-add-update'],
  },

  { pattern: '/tools/id-cards', anyOf: ['tools-id-cards'] },
  { pattern: '/tools/certificates', anyOf: ['tools-certificates'] },
  { pattern: '/tools', anyOf: ['tools-id-cards', 'tools-certificates'] },

  {
    pattern: '/reports',
    anyOf: ['rep-stu-att', 'rep-activity', 'rep-enquiry', 'rep-student', 'rep-staff-att', 'rep-billing'],
  },

  { pattern: '/help', anyOf: [] },
  { pattern: '/language', anyOf: [] },
  { pattern: '/profile', anyOf: [] },
  { pattern: '/notifications', anyOf: [] },
];

/** Settings section query → permission (ANY). */
export const SETTINGS_SECTION_PERMISSIONS: Record<string, string[]> = {
  'access-control': ['cm-ac-settings'],
  roles: ['cm-ac-settings'],
  programs: ['cm-ac-settings', 'prog-view'],
  'activity-posts': ['cm-ac-settings', 'pc-post-view'],
  attendance: ['cm-ac-settings', 'sa-record', 'sta-record'],
  billing: ['cm-ac-settings', 'bill-view-module'],
  'bus-tracking': ['safe-bus-view', 'safe-bus-edit', 'cm-ac-settings'],
  cctv: ['safe-cctv', 'cm-ac-settings'],
  forms: ['cm-ac-settings', 'form-stu-view-page', 'form-stf-view-page'],
  lesson: ['cm-ac-settings', 'les-view'],
  'school-details': ['cm-ac-settings'],
  'staff-leave-management': ['cm-ac-settings', 'stl-view'],
  'vaccine-library': ['cm-ac-settings'],
  'email-templates': ['cm-ac-email-templates', 'cm-ac-settings'],
  'other-settings': ['cm-ac-settings'],
};

export function matchRouteRule(
  pathname: string,
  searchParams?: URLSearchParams | null,
): RoutePermissionRule | null {
  const path = pathname.replace(/\/$/, '') || '/';

  if (path === '/settings' || path.startsWith('/settings')) {
    const section = searchParams?.get('section') ?? 'programs';
    const anyOf = SETTINGS_SECTION_PERMISSIONS[section] ?? ['cm-ac-settings'];
    return { pattern: '/settings', anyOf };
  }

  for (const rule of ROUTE_PERMISSION_RULES) {
    const p = rule.pattern.replace(/\/$/, '') || '/';
    if (rule.exact) {
      if (path === p) return rule;
      continue;
    }
    if (path === p || path.startsWith(`${p}/`)) return rule;
  }
  return null;
}

export function pathAllows(
  pathname: string,
  permissions: Iterable<string>,
  searchParams?: URLSearchParams | null,
): boolean {
  const rule = matchRouteRule(pathname, searchParams);
  if (!rule) return true; // unknown authenticated routes — allow, refine later
  if (!rule.anyOf || rule.anyOf.length === 0) return true;
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  return rule.anyOf.some((id) => set.has(id));
}
