export {
  DEFAULT_PARENT_LANGUAGE,
  isParentLanguage,
  NAV_KEY_BY_MODULE_ID,
  PARENT_LANGUAGES,
  PARENT_LOCALE_STORAGE_KEY,
} from './types';
export type { ParentLanguage, ParentMessageKey, ParentMessages } from './types';
export { getParentMessages, translateParent } from './translations';
export { ParentLocaleProvider, useParentLocale } from './ParentLocaleContext';
