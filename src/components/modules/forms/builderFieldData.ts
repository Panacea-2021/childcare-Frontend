export type BuilderFieldKind =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'phone'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'table'
  | 'rating'
  | 'emoji'
  | 'section'
  | 'pagebreak'
  | 'signature'
  | 'upload'
  | 'attachment'
  | 'fee'
  | 'consent'
  | 'instruction'
  | 'system';

export type PaletteItem = {
  id: string;
  label: string;
  kind: BuilderFieldKind;
  icon: string;
};

export type PaletteGroup = {
  id: string;
  title: string;
  items: PaletteItem[];
};

export type SystemGroup = {
  id: string;
  title: string;
  fields: Array<{ id: string; label: string }>;
};

export type CanvasField = {
  uid: string;
  sourceId: string;
  label: string;
  kind: BuilderFieldKind;
  system?: boolean;
  required?: boolean;
  disabled?: boolean;
  options?: string[];
  minRows?: number;
  maxRows?: number;
  columns?: string[];
  paymentMode?: 'online' | 'offline' | 'both';
  feeLabel?: string;
  bodyText?: string;
};

export const NEW_FIELD_GROUPS: PaletteGroup[] = [
  {
    id: 'input',
    title: 'Input Fields',
    items: [
      { id: 'text', label: 'Text', kind: 'text', icon: 'text' },
      { id: 'number', label: 'Number', kind: 'number', icon: 'number' },
      { id: 'date', label: 'Date', kind: 'date', icon: 'date' },
      { id: 'time', label: 'Time', kind: 'time', icon: 'time' },
      { id: 'phone', label: 'Phone Number', kind: 'phone', icon: 'phone' },
    ],
  },
  {
    id: 'choices',
    title: 'Choices',
    items: [
      { id: 'radio', label: 'Single Select Radio', kind: 'radio', icon: 'radio' },
      { id: 'checkbox', label: 'Multi select', kind: 'checkbox', icon: 'checkbox' },
      { id: 'dropdown', label: 'Single Select Dropdown', kind: 'dropdown', icon: 'dropdown' },
      { id: 'table', label: 'Table', kind: 'table', icon: 'table' },
      { id: 'rating', label: 'Rating (1-5)', kind: 'rating', icon: 'rating' },
      { id: 'emoji', label: 'Emoji Rating', kind: 'emoji', icon: 'emoji' },
    ],
  },
  {
    id: 'page',
    title: 'Page Elements',
    items: [
      { id: 'section', label: 'Section', kind: 'section', icon: 'section' },
      { id: 'pagebreak', label: 'Page Break', kind: 'pagebreak', icon: 'pagebreak' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    items: [
      { id: 'signature', label: 'Digital Signature', kind: 'signature', icon: 'signature' },
      { id: 'upload', label: 'File Upload', kind: 'upload', icon: 'upload' },
      { id: 'attachment', label: 'File Attachment', kind: 'attachment', icon: 'attachment' },
      { id: 'fee', label: 'Enable Fee', kind: 'fee', icon: 'fee' },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    items: [
      { id: 'consent', label: 'Consent', kind: 'consent', icon: 'consent' },
      { id: 'instruction', label: 'Instruction', kind: 'instruction', icon: 'instruction' },
    ],
  },
];

export const SYSTEM_FIELD_GROUPS: SystemGroup[] = [
  {
    id: 'student',
    title: 'Student Information',
    fields: [
      { id: 'sys-name', label: 'Name' },
      { id: 'sys-gender', label: 'Gender' },
      { id: 'sys-birthday', label: 'Birthday' },
      { id: 'sys-address', label: 'Address' },
      { id: 'sys-preferred', label: 'Preferred Name' },
      { id: 'sys-blood', label: 'Blood Group' },
      { id: 'sys-meds', label: 'Medication' },
      { id: 'sys-allergies', label: 'Allergies' },
      { id: 'sys-emergency', label: 'Emergency Contact' },
      { id: 'sys-pickup', label: 'Authorized Pickup' },
    ],
  },
  {
    id: 'mother',
    title: 'Mother Information',
    fields: [
      { id: 'sys-mother-name', label: 'Name' },
      { id: 'sys-mother-email', label: 'Email' },
      { id: 'sys-mother-phone', label: 'Phone Number' },
    ],
  },
  {
    id: 'father',
    title: 'Father Information',
    fields: [
      { id: 'sys-father-name', label: 'Name' },
      { id: 'sys-father-email', label: 'Email' },
      { id: 'sys-father-phone', label: 'Phone Number' },
    ],
  },
];

export function estimateMinutes(fields: CanvasField[]) {
  if (!fields.length) return 0;
  const weights: Partial<Record<BuilderFieldKind, number>> = {
    text: 0.4,
    number: 0.3,
    date: 0.3,
    time: 0.3,
    phone: 0.3,
    radio: 0.4,
    checkbox: 0.5,
    dropdown: 0.4,
    table: 1.2,
    rating: 0.3,
    emoji: 0.3,
    section: 0.1,
    pagebreak: 0.1,
    signature: 0.8,
    upload: 0.7,
    attachment: 0.5,
    fee: 0.4,
    consent: 0.5,
    instruction: 0.2,
    system: 0.4,
  };
  const total = fields.reduce((sum, f) => sum + (weights[f.kind] ?? 0.4), 0);
  return Math.max(1, Math.round(total));
}
