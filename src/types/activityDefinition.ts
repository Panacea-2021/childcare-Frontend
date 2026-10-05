import type { ActivityCategoryName } from '@/types/activity';

export type ActivityFieldType =
  | 'Text'
  | 'Number'
  | 'Dropdown'
  | 'Yes/No'
  | 'Date'
  | 'Multi Select'
  | 'Time';

export type ActivityCustomField = {
  id: string;
  name: string;
  type: ActivityFieldType;
  mandatory: boolean;
  enableAi: boolean;
  /** Comma-separated for Dropdown / Multi Select */
  values?: string;
};

export type ActivityEnableFlags = {
  fileUpload: boolean;
  mediaUpload: boolean;
  draftMode: boolean;
  comments: boolean;
  noApproval: boolean;
};

export type ActivityDefinition = {
  id: string;
  name: string;
  /** Lucide icon name OR emoji */
  icon: string;
  color: string;
  bgColor: string;
  category: ActivityCategoryName;
  description?: string;
  deletable: boolean;
  active: boolean;
  notifyParents: boolean;
  staffOnly: boolean;
  enable: ActivityEnableFlags;
  tags?: string[];
  fields: ActivityCustomField[];
  custom?: boolean;
  imageUrl?: string;
};

export type ActivityGeneralSettings = {
  checkedInOnly: boolean;
  disablePhotoDownload: boolean;
  disableVideoDownload: boolean;
  allCheckedInIgnoreRoom: boolean;
  ccEmail: string;
};

export const ACTIVITY_FIELD_TYPES: ActivityFieldType[] = [
  'Number',
  'Text',
  'Yes/No',
  'Dropdown',
  'Date',
  'Multi Select',
  'Time',
];

export const ACTIVITY_COLOR_PRESETS = [
  { id: 'indigo', label: 'Indigo', hex: '#5D5FEF', bg: '#E8F2FF' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6', bg: '#DBEAFE' },
  { id: 'teal', label: 'Teal', hex: '#0D9488', bg: '#CCFBF1' },
  { id: 'green', label: 'Green', hex: '#22C55E', bg: '#DCFCE7' },
  { id: 'orange', label: 'Orange', hex: '#F59E0B', bg: '#FEF3C7' },
  { id: 'pink', label: 'Pink', hex: '#EC4899', bg: '#FCE7F3' },
  { id: 'purple', label: 'Purple', hex: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'red', label: 'Red', hex: '#EF4444', bg: '#FEE2E2' },
  { id: 'yellow', label: 'Yellow', hex: '#CA8A04', bg: '#FEF9C3' },
] as const;

export function parseFieldValues(values?: string): string[] {
  if (!values?.trim()) return [];
  return values
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function defaultEnableFlags(
  partial?: Partial<ActivityEnableFlags>,
): ActivityEnableFlags {
  return {
    fileUpload: false,
    mediaUpload: false,
    draftMode: false,
    comments: false,
    noApproval: false,
    ...partial,
  };
}
