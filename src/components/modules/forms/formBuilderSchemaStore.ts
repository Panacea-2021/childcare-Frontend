import type { CanvasField } from './builderFieldData';
import { DEFAULT_FORM_STYLES, type FormStyleSettings } from './FormStylesSidebar';

export type FormBuilderSchema = {
  fields: CanvasField[];
  styles: FormStyleSettings;
  updatedAt: string;
};

const MAP_KEY = 'panacea.forms.builder.v1';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readMap(): Record<string, FormBuilderSchema> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, FormBuilderSchema>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, FormBuilderSchema>) {
  if (!canUseStorage()) return;
  localStorage.setItem(MAP_KEY, JSON.stringify(map));
}

/** Demo fields so shared/blank forms look like the builder Preview even before a schema is saved. */
export function demoFormFields(formName = 'Form'): CanvasField[] {
  const stamp = Date.now();
  return [
    {
      uid: `demo-text-${stamp}`,
      sourceId: 'text',
      label: 'Text',
      kind: 'text',
    },
    {
      uid: `demo-date-${stamp}`,
      sourceId: 'date',
      label: 'Date',
      kind: 'date',
    },
    {
      uid: `demo-phone-${stamp}`,
      sourceId: 'phone',
      label: 'Phone Number',
      kind: 'phone',
    },
    {
      uid: `demo-radio-${stamp}`,
      sourceId: 'radio',
      label: 'Single Select Radio',
      kind: 'radio',
      options: ['Option 1', 'Option 2'],
    },
  ];
}

export function saveFormBuilderSchema(
  formId: string,
  fields: CanvasField[],
  styles: FormStyleSettings,
) {
  const map = readMap();
  map[formId] = {
    fields,
    styles,
    updatedAt: new Date().toISOString(),
  };
  writeMap(map);
}

export function getFormBuilderSchema(formId: string): FormBuilderSchema | null {
  const map = readMap();
  return map[formId] ?? null;
}

export function loadFormBuilderSchema(
  formId: string,
  opts?: { seedDemoIfEmpty?: boolean; formName?: string },
): FormBuilderSchema {
  const existing = getFormBuilderSchema(formId);
  if (existing?.fields?.length) {
    return {
      fields: existing.fields,
      styles: { ...DEFAULT_FORM_STYLES, ...existing.styles },
      updatedAt: existing.updatedAt,
    };
  }
  if (opts?.seedDemoIfEmpty !== false) {
    return {
      fields: demoFormFields(opts?.formName),
      styles: existing?.styles
        ? { ...DEFAULT_FORM_STYLES, ...existing.styles }
        : { ...DEFAULT_FORM_STYLES },
      updatedAt: existing?.updatedAt ?? new Date().toISOString(),
    };
  }
  return {
    fields: existing?.fields ?? [],
    styles: existing?.styles
      ? { ...DEFAULT_FORM_STYLES, ...existing.styles }
      : { ...DEFAULT_FORM_STYLES },
    updatedAt: existing?.updatedAt ?? new Date().toISOString(),
  };
}
