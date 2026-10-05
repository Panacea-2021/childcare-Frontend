export type SourceStatus = 'Active' | 'Inactive';

export type SubSource = {
  id: string;
  name: string;
};

export type EnquirySource = {
  id: string;
  name: string;
  status: SourceStatus;
  subSources: SubSource[];
  createdAt: string;
  updatedAt: string;
};

/** Lucide icon keys supported by stage management UI. */
export type StageIconKey =
  | 'archive'
  | 'heart'
  | 'clock'
  | 'check'
  | 'userx'
  | 'calendar'
  | 'file'
  | 'phone'
  | 'flag'
  | 'star'
  | 'sparkles'
  | 'mapPin';

export type EnquiryStageConfig = {
  id: string;
  name: string;
  color: string;
  icon: StageIconKey;
  description: string;
  active: boolean;
  /** System stages (Admitted, Lost) cannot be deleted or disabled. */
  isSystem: boolean;
  /** Display order (0-based). */
  order: number;
  /** Dummy enquiry count for UI. */
  enquiryCount: number;
};

export type LostReason = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
};

export type StageColorSwatch = {
  name: string;
  value: string;
};

export const IMPORT_COLUMNS = [
  'Student Name',
  'Gender',
  'Lead Status',
  'Source',
  'Sub Source',
  'Preferred Name',
  'Emergency Contact Name',
  'Emergency Contact Number',
  'Emergency Contact Country Code',
  'School',
  'Address',
  'Assigned To',
  'Program',
  'Expected Start Date',
  'Additional Note',
  'Created Date',
  'Birth Date',
  'Parent 1 Name',
  'Parent 2 Name',
  'Parent 1 Phone',
  'Parent 2 Phone',
  'Parent 1 Email',
  'Parent 2 Email',
  'Parent 1 Company',
  'Parent 2 Company',
  'Parent 1 Country Code',
  'Parent 2 Country Code',
  'Student Sub Parent',
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

export type ImportRowStatus = 'Valid' | 'Warning' | 'Invalid';

export type ParsedImportRow = {
  id: string;
  rowNum: number;
  data: Record<ImportColumn, string>;
  status: ImportRowStatus;
  errors: string[];
  warnings: string[];
};

export type ImportValidationSummary = {
  total: number;
  valid: number;
  warnings: number;
  invalid: number;
  missingColumns: string[];
  extraColumns: string[];
  duplicates: number;
};
