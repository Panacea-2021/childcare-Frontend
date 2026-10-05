'use client';

import { BUILT_IN_TEMPLATES, SEED_FORMS, todayIso } from './mockData';
import type { FormField, StudentForm, StudentTemplate } from './types';

const FORMS_KEY = 'panacea.enquiry.studentForms.v3';
const TEMPLATES_KEY = 'panacea.enquiry.studentTemplates.v3';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return JSON.parse(JSON.stringify(fallback)) as T;
    }
    return JSON.parse(raw) as T;
  } catch {
    return JSON.parse(JSON.stringify(fallback)) as T;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function cloneFields(fields: FormField[]): FormField[] {
  const stamp = Date.now();
  return fields.map((f, i) => ({
    ...f,
    id: `fld-${stamp}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    options: f.options ? [...f.options] : undefined,
  }));
}

function hydrateFormFields(form: StudentForm): StudentForm {
  if (form.fields?.length) return form;
  const title = (form.title || '').toLowerCase();
  const match = BUILT_IN_TEMPLATES.find(
    (t) => t.title.toLowerCase() === title || title.includes(t.title.toLowerCase().replace(' form', '').trim()),
  );
  if (!match?.fields?.length) return { ...form, fields: form.fields ?? [] };
  return {
    ...form,
    fields: cloneFields(match.fields),
    description: form.description || match.description,
    category: form.category || match.category,
  };
}

export function loadStudentForms(): StudentForm[] {
  const raw = read(FORMS_KEY, SEED_FORMS);
  const list = raw.map(hydrateFormFields);
  const needsSave = list.some((f, i) => (raw[i]?.fields?.length ?? 0) === 0 && f.fields.length > 0);
  if (needsSave) write(FORMS_KEY, list);
  return list;
}

export function saveStudentForms(forms: StudentForm[]) {
  write(FORMS_KEY, forms);
}

export function upsertStudentForm(form: StudentForm) {
  const list = loadStudentForms();
  const idx = list.findIndex((f) => f.id === form.id);
  const next = idx >= 0 ? list.map((f, i) => (i === idx ? form : f)) : [form, ...list];
  saveStudentForms(next);
  return next;
}

export function getStudentForm(id: string) {
  const found = loadStudentForms().find((f) => f.id === id) ?? null;
  return found ? hydrateFormFields(found) : null;
}

export function deleteStudentForm(id: string) {
  const next = loadStudentForms().filter((f) => f.id !== id);
  saveStudentForms(next);
  return next;
}

export function duplicateStudentForm(id: string) {
  const src = getStudentForm(id);
  if (!src) return loadStudentForms();
  const stamp = Date.now();
  const clone: StudentForm = {
    ...src,
    id: `sf-${stamp}`,
    title: `${src.title} (Copy)`,
    status: 'draft',
    favorite: false,
    createdAt: todayIso(),
    updatedAt: todayIso(),
    fields: src.fields.map((f, i) => ({
      ...f,
      id: `fld-${stamp}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      options: f.options ? [...f.options] : undefined,
    })),
  };
  return upsertStudentForm(clone);
}

export function loadTemplates(): StudentTemplate[] {
  const custom = read<StudentTemplate[]>(TEMPLATES_KEY, []);
  const builtIns = BUILT_IN_TEMPLATES.map((t) => {
    const override = custom.find((c) => c.id === t.id);
    const baseFields = override?.fields?.length ? override.fields : t.fields;
    return {
      ...t,
      ...override,
      builtIn: true as const,
      fields: baseFields.map((f, i) => ({
        ...f,
        id: f.id || `tpl-${t.id}-${i}`,
        options: f.options ? [...f.options] : undefined,
      })),
    };
  });
  const mine = custom
    .filter((c) => !c.builtIn && !BUILT_IN_TEMPLATES.some((b) => b.id === c.id))
    .map((c) => ({
      ...c,
      fields: (c.fields ?? []).map((f, i) => ({
        ...f,
        id: f.id || `my-${c.id}-${i}`,
        options: f.options ? [...f.options] : undefined,
      })),
    }));
  return [...mine, ...builtIns];
}

export function saveTemplateFromForm(form: StudentForm): StudentTemplate {
  const custom = read<StudentTemplate[]>(TEMPLATES_KEY, []);
  const tpl: StudentTemplate = {
    id: `my-tpl-${Date.now()}`,
    title: form.title,
    description: form.description || 'Saved from form builder',
    category: (form.category as StudentTemplate['category']) || 'Operations',
    updatedAt: todayIso().slice(0, 10),
    favorite: false,
    builtIn: false,
    thumbnailHue: 220 + (custom.length % 5) * 20,
    fields: cloneFields(form.fields),
  };
  write(TEMPLATES_KEY, [tpl, ...custom]);
  return tpl;
}

export function toggleTemplateFavorite(id: string) {
  const all = loadTemplates();
  const target = all.find((t) => t.id === id);
  if (!target) return loadTemplates();
  const custom = read<StudentTemplate[]>(TEMPLATES_KEY, []);
  const nextFav = !target.favorite;
  const existing = custom.findIndex((c) => c.id === id);
  const patch: StudentTemplate = { ...target, favorite: nextFav };
  if (existing >= 0) custom[existing] = patch;
  else custom.unshift(patch);
  write(TEMPLATES_KEY, custom);
  return loadTemplates();
}

export function duplicateTemplate(id: string) {
  const all = loadTemplates();
  const src = all.find((t) => t.id === id);
  if (!src) return all;
  const custom = read<StudentTemplate[]>(TEMPLATES_KEY, []);
  const stamp = Date.now();
  const clone: StudentTemplate = {
    ...src,
    id: `my-tpl-${stamp}`,
    title: `${src.title} (Copy)`,
    builtIn: false,
    favorite: false,
    updatedAt: todayIso().slice(0, 10),
    fields: cloneFields(src.fields),
  };
  write(TEMPLATES_KEY, [clone, ...custom]);
  return loadTemplates();
}

export function createBlankForm(partial?: Partial<StudentForm>): StudentForm {
  return {
    id: partial?.id ?? `sf-${Date.now()}`,
    title: partial?.title ?? 'Untitled Student Form',
    description: partial?.description ?? '',
    status: 'draft',
    fields: partial?.fields ? cloneFields(partial.fields) : [],
    createdAt: todayIso(),
    updatedAt: todayIso(),
    source: partial?.source ?? 'scratch',
    category: partial?.category ?? 'Operations',
    favorite: false,
    pdfName: partial?.pdfName,
  };
}
