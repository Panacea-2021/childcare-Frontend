import type { AppModule, AppModuleChild } from '@/lib/modules';
import { hasAnyPermission } from './authorization';

/** Nav item permission: ANY of these shows the item. Empty = always visible when authenticated. */
export type NavPermissionMeta = {
  requiredAny?: string[];
};

const CHILD_PERMISSIONS: Record<string, string[]> = {
  students: ['cm-students-view-page', 'cm-stu-view'],
  staff: ['cm-staff-view'],
  rooms: ['cm-rooms-create', 'cm-rooms-delete', 'cm-rooms-rename'],
  groups: ['cm-groups-create', 'cm-groups-delete'],
  labels: ['cm-ac-settings'],
  'email-templates': ['cm-ac-email-templates', 'cm-ac-settings'],

  'program-list': ['prog-view', 'prog-add-update'],
  'program-dashboard': ['prog-view', 'prog-reports'],
  'program-movement': ['prog-assign', 'prog-add-update'],

  'student-attendance': ['sa-record', 'sa-update', 'sl-view'],
  'staff-attendance': ['sta-record', 'sta-update', 'stl-view'],
  'student-staff-ratio': ['sa-record', 'sa-update', 'sta-record', 'sta-update'],
  'attendance-forecast': ['sa-record', 'rep-stu-att'],

  activities: ['pc-post-view', 'pc-post-add', 'pc-post-announce'],
  'daily-reports': ['pc-post-view', 'pc-notes-view'],
  notes: ['pc-notes-view'],
  concerns: ['pc-concern-view'],
  newsletters: ['pc-nl-create', 'pc-nl-share', 'pc-nl-templates'],
  'resource-center': ['cm-ac-resource-view', 'cm-ac-resource-add'],

  'parent-messages': ['msg-parent-send', 'msg-parent-shared', 'msg-parent-read-all'],
  'staff-messages': ['msg-staff-send'],
  'staff-announcement': ['msg-staff-announce'],

  'billing-dashboard': ['bill-view-dashboard', 'bill-view-module'],
  'billing-invoices': ['bill-inv-create', 'bill-inv-edit', 'bill-inv-delete', 'bill-view-module'],
  'billing-student-balances': ['bill-view-module', 'bill-view-dashboard'],
  'billing-payments': ['bill-record-payment', 'bill-pay-update'],
  'billing-fee-plan': ['bill-fp-view', 'bill-fp-create-update'],
  'billing-fee-reminders': ['bill-send-reminders'],

  'enquiry-dashboard': ['enq-view'],
  'enquiries-list': ['enq-view', 'enq-add-update'],
  'enquiry-tasks': ['enq-view'],
  'enquiry-forms': ['enq-form-view-page', 'enq-form-add-update'],
  'enquiry-automations': ['enq-view'],
  'enquiry-email-campaigns': ['enq-view'],
  'enquiry-facebook': ['enq-fb-configure'],
  'enquiry-whatsapp': ['enq-wa-configure', 'enq-wa-view-msgs', 'enq-wa-send'],

  'staff-schedule': ['cal-view'],
  'student-schedule': ['cal-ss-view'],
  'staff-holidays': ['cal-view'],
  'birthday-calendar': ['cal-view'],
  'school-calendar': ['cal-view'],
  'meal-planner': ['cal-view'],

  'progress-grid': ['as-view', 'as-view-reports'],
  'student-progress': ['as-view'],
  'lesson-plan': ['les-plan-view', 'les-plan-edit'],
  'lesson-set-mapping': ['les-view', 'les-plan-view'],
  'progress-boards': ['as-view'],
  observations: ['as-view-obs', 'as-add-obs'],
  'learning-journey': ['as-view-journey', 'as-create-journey'],

  lessons: ['les-view'],
  assessments: ['as-view', 'as-create'],
  'curriculum-document': ['les-curr-view'],
  manage: ['as-manage-page', 'as-framework'],

  'all-forms': ['form-stu-view-page', 'form-stf-view-page'],
  'admission-process': ['form-stu-view-page'],

  'id-cards': ['tools-id-cards'],
  certificates: ['tools-certificates'],

  'settings-programs': ['cm-ac-settings', 'prog-view'],
  'settings-access-control': ['cm-ac-settings'],
  'settings-activity-posts': ['cm-ac-settings'],
  'settings-attendance': ['cm-ac-settings'],
  'settings-billing': ['cm-ac-settings', 'bill-view-module'],
  'settings-bus-tracking': ['safe-bus-view', 'safe-bus-edit', 'cm-ac-settings'],
  'settings-cctv': ['safe-cctv', 'cm-ac-settings'],
  'settings-forms': ['cm-ac-settings'],
  'settings-lesson': ['cm-ac-settings', 'les-view'],
  'settings-roles': ['cm-ac-settings'],
  'settings-school-details': ['cm-ac-settings'],
  'settings-staff-leave': ['cm-ac-settings', 'stl-view'],
  'settings-vaccine-library': ['cm-ac-settings'],
  'settings-email-templates': ['cm-ac-email-templates', 'cm-ac-settings'],
  'settings-other': ['cm-ac-settings'],

  'help-product-guide': [],
  'help-support': [],
};

const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: [],
  reports: ['rep-stu-att', 'rep-activity', 'rep-enquiry', 'rep-student', 'rep-staff-att', 'rep-billing'],
  language: [],
  profile: [],
  notifications: [],
  help: [],
};

function childAllowed(child: AppModuleChild, permissions: Iterable<string>): boolean {
  const req = CHILD_PERMISSIONS[child.id];
  if (!req || req.length === 0) return true;
  return hasAnyPermission(permissions, req);
}

function moduleAllowed(mod: AppModule, permissions: Iterable<string>): boolean {
  const req = MODULE_PERMISSIONS[mod.id];
  if (req) {
    if (req.length === 0) return true;
    return hasAnyPermission(permissions, req);
  }
  return true;
}

/** Filter APP_MODULES by effective permissions. Hides empty parents. */
export function filterModulesByPermissions(
  modules: AppModule[],
  permissions: Iterable<string>,
): AppModule[] {
  const result: AppModule[] = [];

  for (const mod of modules) {
    if (mod.children?.length) {
      const children = mod.children.filter((c) => childAllowed(c, permissions));
      if (children.length === 0) continue;
      result.push({ ...mod, children });
      continue;
    }

    if (!moduleAllowed(mod, permissions)) continue;
    result.push(mod);
  }

  return result;
}

export function getChildRequiredAny(childId: string): string[] | undefined {
  return CHILD_PERMISSIONS[childId];
}
