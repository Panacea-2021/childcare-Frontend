export const PARENT_LANGUAGES = [
  'English',
  'English (UK)',
  'Arabic',
  'Bulgarian',
  'Dutch',
  'French',
  'German',
  'Greek',
  'Haitian Creole',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Latvian',
  'Portuguese',
  'Spanish',
  'Tamil',
  'Telugu',
] as const;

export type ParentLanguage = (typeof PARENT_LANGUAGES)[number];

export const DEFAULT_PARENT_LANGUAGE: ParentLanguage = 'English (UK)';

export const PARENT_LOCALE_STORAGE_KEY = 'panacea.parentSupport.language';

export type ParentMessageKey =
  | 'nav.timeline'
  | 'nav.lessons'
  | 'nav.messages'
  | 'nav.schoolCalendar'
  | 'nav.studentInvoices'
  | 'nav.profile'
  | 'nav.resourceCenter'
  | 'nav.support'
  | 'support.needSupport'
  | 'support.emailUsOn'
  | 'support.version'
  | 'support.changeLanguage'
  | 'support.raiseTicket'
  | 'support.confirmTitle'
  | 'support.confirmBody'
  | 'support.ok'
  | 'support.ticketTitle'
  | 'support.describeIssue'
  | 'support.cancel'
  | 'support.submit'
  | 'support.toastSuccess'
  | 'support.noLanguages'
  | 'support.searchLanguage'
  | 'shell.openMenu'
  | 'shell.closeMenu'
  | 'shell.expandMenu'
  | 'shell.collapseMenu'
  | 'shell.parentPortal';

export type ParentMessages = Record<ParentMessageKey, string>;

export const NAV_KEY_BY_MODULE_ID: Record<string, ParentMessageKey> = {
  timeline: 'nav.timeline',
  lessons: 'nav.lessons',
  messages: 'nav.messages',
  'school-calendar': 'nav.schoolCalendar',
  'student-invoices': 'nav.studentInvoices',
  profile: 'nav.profile',
  'resource-center': 'nav.resourceCenter',
  support: 'nav.support',
};

export function isParentLanguage(value: string): value is ParentLanguage {
  return (PARENT_LANGUAGES as readonly string[]).includes(value);
}
