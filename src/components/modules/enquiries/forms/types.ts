export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'password'
  | 'date'
  | 'time'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'rating'
  | 'slider'
  | 'upload'
  | 'image-upload'
  | 'signature'
  | 'address'
  | 'country'
  | 'state'
  | 'city'
  | 'divider'
  | 'heading'
  | 'paragraph'
  | 'spacer'
  | 'columns'
  | 'multi-step'
  | 'progress'
  | 'terms'
  | 'hidden';

export type FieldWidth = 'full' | 'half' | 'third';
export type FieldSize = 'sm' | 'md' | 'lg';

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  defaultValue?: string;
  width?: FieldWidth;
  size?: FieldSize;
  options?: string[];
  validation?: string;
  visibility?: 'visible' | 'hidden';
  conditionalLogic?: string;
  min?: number;
  max?: number;
};

export type FormStatus = 'draft' | 'published';

export type StudentForm = {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  source: 'scratch' | 'pdf' | 'ai' | 'template';
  category: string;
  favorite?: boolean;
  isTemplate?: boolean;
  pdfName?: string;
};

export type TemplateCategory =
  | 'All'
  | 'Events'
  | 'Feedback'
  | 'Operations'
  | 'Documents'
  | 'Attendance';

export type StudentTemplate = {
  id: string;
  title: string;
  description: string;
  category: Exclude<TemplateCategory, 'All'>;
  updatedAt: string;
  favorite?: boolean;
  builtIn?: boolean;
  fields: FormField[];
  thumbnailHue: number;
};

export type PdfOverlayFieldType =
  | 'text'
  | 'checkbox'
  | 'signature'
  | 'date'
  | 'dropdown'
  | 'initials'
  | 'email'
  | 'phone'
  | 'name';

export type PdfOverlayField = {
  id: string;
  type: PdfOverlayFieldType;
  label: string;
  required?: boolean;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
};

export type BuilderView = 'desktop' | 'tablet' | 'mobile';

export type CreateMode = 'scratch' | 'pdf' | 'ai';
