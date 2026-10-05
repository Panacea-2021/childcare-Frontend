import { generateFromKnowledge } from './aiKnowledge';
import type { FormField, StudentForm, StudentTemplate } from './types';

function fromPack(
  kind: Parameters<typeof generateFromKnowledge>[0],
  meta: Omit<StudentTemplate, 'fields' | 'title' | 'description' | 'category'> & {
    title?: string;
    description?: string;
    category?: StudentTemplate['category'];
  },
): StudentTemplate {
  const pack = generateFromKnowledge(kind, meta.id);
  return {
    id: meta.id,
    title: meta.title ?? pack.title,
    description: meta.description ?? pack.description,
    category: meta.category ?? (pack.category as StudentTemplate['category']),
    updatedAt: meta.updatedAt,
    favorite: meta.favorite,
    builtIn: meta.builtIn,
    thumbnailHue: meta.thumbnailHue,
    fields: pack.fields,
  };
}

export const BUILT_IN_TEMPLATES: StudentTemplate[] = [
  fromPack('event-rsvp', {
    id: 'tpl-rsvp',
    updatedAt: '2026-07-12',
    favorite: true,
    builtIn: true,
    thumbnailHue: 32,
    category: 'Events',
  }),
  fromPack('parent-feedback', {
    id: 'tpl-feedback',
    updatedAt: '2026-07-18',
    favorite: false,
    builtIn: true,
    thumbnailHue: 265,
    category: 'Feedback',
  }),
  fromPack('volunteer', {
    id: 'tpl-volunteer',
    updatedAt: '2026-06-30',
    favorite: true,
    builtIn: true,
    thumbnailHue: 168,
    category: 'Operations',
  }),
  fromPack('attendance', {
    id: 'tpl-attendance',
    updatedAt: '2026-07-22',
    favorite: false,
    builtIn: true,
    thumbnailHue: 212,
    category: 'Attendance',
  }),
  fromPack('incident', {
    id: 'tpl-incident',
    updatedAt: '2026-07-05',
    favorite: false,
    builtIn: true,
    thumbnailHue: 12,
    category: 'Operations',
  }),
  fromPack('document-request', {
    id: 'tpl-document',
    updatedAt: '2026-07-28',
    favorite: false,
    builtIn: true,
    thumbnailHue: 240,
    category: 'Documents',
  }),
  fromPack('admission', {
    id: 'tpl-admission',
    updatedAt: '2026-08-01',
    favorite: true,
    builtIn: true,
    thumbnailHue: 250,
    category: 'Documents',
  }),
];

export const ADMISSION_AI_FIELDS: FormField[] = generateFromKnowledge('admission', 'admission-seed').fields;

export const SEED_FORMS: StudentForm[] = [
  {
    id: 'sf-demo-1',
    title: 'Event RSVP Form',
    description: 'Official RSVP for school events and celebrations.',
    status: 'published',
    fields: BUILT_IN_TEMPLATES[0].fields.map((f, i) => ({ ...f, id: `demo1-${i}` })),
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-20T14:30:00.000Z',
    source: 'template',
    category: 'Events',
    favorite: false,
  },
  {
    id: 'sf-demo-2',
    title: 'Student Admission Form',
    description: 'Complete official admission application for new enrollments.',
    status: 'draft',
    fields: BUILT_IN_TEMPLATES.find((t) => t.id === 'tpl-admission')!.fields.map((f, i) => ({
      ...f,
      id: `demo2-${i}`,
    })),
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-08-02T11:15:00.000Z',
    source: 'ai',
    category: 'Documents',
    favorite: true,
  },
];

export function todayIso() {
  return new Date().toISOString();
}

export function formatDateLabel(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
