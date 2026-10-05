export type ParentModule = {
  id: string;
  label: string;
  href: string;
};

/** Parent Portal sidebar modules — order is intentional. */
export const PARENT_MODULES: ParentModule[] = [
  { id: 'timeline', label: 'Timeline', href: '/parent/timeline' },
  { id: 'lessons', label: 'Lessons', href: '/parent/lessons' },
  { id: 'messages', label: 'Messages', href: '/parent/messages' },
  { id: 'school-calendar', label: 'School Calendar', href: '/parent/calendar' },
  { id: 'student-invoices', label: 'Student Invoices', href: '/parent/invoices' },
  { id: 'profile', label: 'Profile', href: '/parent/profile' },
  { id: 'resource-center', label: 'Resource Center', href: '/parent/resources' },
  { id: 'support', label: 'Support', href: '/parent/support' },
];

export const PARENT_PORTAL_HOME = '/parent/timeline';
