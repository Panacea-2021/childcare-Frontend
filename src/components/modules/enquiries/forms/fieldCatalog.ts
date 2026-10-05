import type { FieldType, FormField } from './types';

export type PaletteItem = {
  type: FieldType;
  label: string;
  icon: string;
};

export type PaletteSection = {
  id: string;
  title: string;
  items: PaletteItem[];
};

export const FIELD_PALETTE: PaletteSection[] = [
  {
    id: 'basic',
    title: 'Basic Fields',
    items: [
      { type: 'text', label: 'Text Input', icon: 'type' },
      { type: 'textarea', label: 'Textarea', icon: 'align-left' },
      { type: 'number', label: 'Number', icon: 'hash' },
      { type: 'email', label: 'Email', icon: 'mail' },
      { type: 'phone', label: 'Phone', icon: 'phone' },
      { type: 'password', label: 'Password', icon: 'lock' },
      { type: 'date', label: 'Date', icon: 'calendar' },
      { type: 'time', label: 'Time', icon: 'clock' },
      { type: 'dropdown', label: 'Dropdown', icon: 'list' },
      { type: 'radio', label: 'Radio', icon: 'circle-dot' },
      { type: 'checkbox', label: 'Checkbox', icon: 'check-square' },
      { type: 'switch', label: 'Switch', icon: 'toggle-left' },
      { type: 'rating', label: 'Rating', icon: 'star' },
      { type: 'slider', label: 'Slider', icon: 'sliders' },
      { type: 'upload', label: 'Upload', icon: 'upload' },
      { type: 'image-upload', label: 'Image Upload', icon: 'image' },
      { type: 'signature', label: 'Signature', icon: 'pen-tool' },
      { type: 'address', label: 'Address', icon: 'map-pin' },
      { type: 'country', label: 'Country', icon: 'globe' },
      { type: 'state', label: 'State', icon: 'map' },
      { type: 'city', label: 'City', icon: 'building' },
    ],
  },
  {
    id: 'layout',
    title: 'Layout & Structure',
    items: [
      { type: 'divider', label: 'Section Divider', icon: 'minus' },
      { type: 'heading', label: 'Heading', icon: 'heading' },
      { type: 'paragraph', label: 'Paragraph', icon: 'pilcrow' },
      { type: 'spacer', label: 'Spacer', icon: 'move-vertical' },
      { type: 'columns', label: 'Columns', icon: 'columns' },
      { type: 'multi-step', label: 'Multi Step', icon: 'layers' },
      { type: 'progress', label: 'Progress Bar', icon: 'loader' },
      { type: 'terms', label: 'Terms Checkbox', icon: 'shield-check' },
      { type: 'hidden', label: 'Hidden Field', icon: 'eye-off' },
    ],
  },
];

const CHOICE_DEFAULTS = ['Option 1', 'Option 2', 'Option 3'];

export function createField(type: FieldType, labelOverride?: string): FormField {
  const fromPalette = FIELD_PALETTE.flatMap((s) => s.items).find((i) => i.type === type);
  const label = labelOverride ?? fromPalette?.label ?? 'Field';
  const base: FormField = {
    id: `fld-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label,
    placeholder: type === 'heading' || type === 'paragraph' || type === 'divider' ? undefined : `Enter ${label.toLowerCase()}`,
    required: false,
    width: 'full',
    size: 'md',
    visibility: 'visible',
    helpText: '',
    defaultValue: '',
    validation: '',
    conditionalLogic: '',
  };

  if (['dropdown', 'radio', 'checkbox'].includes(type)) {
    base.options = [...CHOICE_DEFAULTS];
  }
  if (type === 'rating') {
    base.min = 1;
    base.max = 5;
  }
  if (type === 'slider') {
    base.min = 0;
    base.max = 100;
    base.defaultValue = '50';
  }
  if (type === 'terms') {
    base.label = 'I agree to the terms and conditions';
    base.required = true;
  }
  if (type === 'heading') {
    base.label = 'Section Heading';
  }
  if (type === 'paragraph') {
    base.label = 'Add supporting instructions for respondents.';
  }
  if (type === 'hidden') {
    base.visibility = 'hidden';
    base.defaultValue = '';
  }

  return base;
}

export function isLayoutField(type: FieldType) {
  return ['divider', 'heading', 'paragraph', 'spacer', 'columns', 'multi-step', 'progress', 'hidden'].includes(type);
}
