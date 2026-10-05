import type { BoardCard, EditableLesson, LessonDetail } from '@/types/progressBoard';

export const DEVELOPMENT_AREA_TREE = [
  {
    id: 'art',
    name: 'Art',
    groups: [
      { id: 'art-history', name: 'Art History' },
      { id: 'drawing-elements', name: 'Drawing and Elements of Art' },
      { id: 'media', name: 'Media' },
      { id: 'handwork', name: 'Handwork' },
    ],
  },
  {
    id: 'practical-life',
    name: 'Practical Life',
    groups: [
      { id: 'care-self', name: 'Care of Self' },
      { id: 'care-env', name: 'Care of Environment' },
    ],
  },
] as const;

export const LESSON_SET_OPTIONS = [
  'Elementary (6-12)',
  'Elementary (6-9)',
  'Elementary (9-12)',
  'Primary (3-6)',
  'Toddler (1.5-3)',
];

export const AGE_BAND_OPTIONS = ['1.5-3', '3-6', '6-9', '6-12', '9-12'];

export const LABEL_OPTIONS = ['Select label', 'Core', 'Enrichment', 'Assessment', 'Optional'];

function buildDescription(whatIsIt: string, why: string[], atHome: string[]) {
  return [
    'What is it?',
    `• ${whatIsIt}`,
    '',
    'Why do we do it?',
    ...why.map((w) => `• ${w}`),
    '',
    'Supporting interest at home:',
    ...atHome.map((w) => `• ${w}`),
  ].join('\n');
}

const GRADATION_ID = 'les-ten-steps-of-gradation-from-black-to-white-elementary-6-12-323';

const GRADATION_EDITABLE: EditableLesson = {
  id: GRADATION_ID,
  title: 'Ten Steps of Gradation from Black to White',
  updatedLabel: 'Updated Jul 2, 2026 by API',
  lessonSets: ['Elementary (6-12)'],
  roomId: '',
  ageBands: ['6-12'],
  description: buildDescription(
    "Using a soft artist's pencil, the child practices creating ten gradual shades of gray from black to white on a strip of paper.",
    [
      'Experiment with weight and pressure of the pencil',
      'Builds fine motor control for writing and drawing',
      'Prepares the hand and eye for shading and composition',
    ],
    [
      'Visit a museum or gallery and notice light and shadow in artworks',
      'Provide sketch paper and soft pencils for free shading practice',
    ],
  ),
  durationMin: '',
  youtubeUrl: '',
  developmentAreas: ['Art'],
  groups: ['Drawing and Elements of Art'],
  label: '',
};

export const BOARD_LESSON_DETAILS: Record<string, LessonDetail> = {
  [GRADATION_ID]: editableToDetail(GRADATION_EDITABLE),
};

export const DEFAULT_BOARD_CARDS: BoardCard[] = [
  {
    id: 'bc-nara-gradation',
    studentId: 'st-nara',
    lessonId: GRADATION_ID,
    lessonTitle: 'Ten Steps of Gradation from Black to White',
    ageBand: 'Elementary (6-12)',
    category: 'Art',
    group: 'Drawing and Elements of Art',
    stage: 'introduced',
    note: 'ffff',
    author: 'Malika Thimisetty',
    updatedLabel: 'Updated Jul 2, 2026 by API',
    date: '2026-08-03',
    hiddenFromParents: true,
  },
];

const CARDS_KEY = 'panacea.progressBoard.v1';
const LESSONS_KEY = 'panacea.progressBoard.lessons.v1';

export function editableToDetail(lesson: EditableLesson): LessonDetail {
  const lines = lesson.description.split('\n').map((l) => l.trim());
  const bullets = lines.filter((l) => l.startsWith('•')).map((l) => l.replace(/^•\s*/, ''));
  return {
    id: lesson.id,
    title: lesson.title,
    updatedLabel: lesson.updatedLabel,
    category: lesson.developmentAreas[0] ?? 'General',
    lessonSet: lesson.lessonSets[0] ?? '',
    ages: lesson.ageBands[0] ?? '',
    group: lesson.groups[0] ?? '',
    whatIsIt: bullets[0] ?? '',
    why: bullets.slice(1, 4),
    atHome: bullets.slice(4),
    roomId: lesson.roomId,
    durationMin: lesson.durationMin,
    youtubeUrl: lesson.youtubeUrl,
    label: lesson.label,
    description: lesson.description,
    developmentAreas: lesson.developmentAreas,
    groups: lesson.groups,
    lessonSets: lesson.lessonSets,
    ageBands: lesson.ageBands,
  };
}

export function detailToEditable(detail: LessonDetail): EditableLesson {
  return {
    id: detail.id,
    title: detail.title,
    updatedLabel: detail.updatedLabel,
    lessonSets: detail.lessonSets?.length
      ? detail.lessonSets
      : detail.lessonSet
        ? [detail.lessonSet]
        : [],
    roomId: detail.roomId ?? '',
    ageBands: detail.ageBands?.length
      ? detail.ageBands
      : detail.ages
        ? [detail.ages]
        : [],
    description:
      detail.description ??
      buildDescription(detail.whatIsIt, detail.why, detail.atHome),
    durationMin: detail.durationMin ?? '',
    youtubeUrl: detail.youtubeUrl ?? '',
    developmentAreas: detail.developmentAreas?.length
      ? detail.developmentAreas
      : detail.category
        ? [detail.category]
        : [],
    groups: detail.groups?.length ? detail.groups : detail.group ? [detail.group] : [],
    label: detail.label ?? '',
  };
}

export function loadBoardCards(): BoardCard[] {
  if (typeof window === 'undefined') return DEFAULT_BOARD_CARDS;
  try {
    const raw = window.localStorage.getItem(CARDS_KEY);
    if (!raw) return DEFAULT_BOARD_CARDS;
    const parsed = JSON.parse(raw) as BoardCard[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BOARD_CARDS;
    return parsed;
  } catch {
    return DEFAULT_BOARD_CARDS;
  }
}

export function saveBoardCards(cards: BoardCard[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

function loadLessonMap(): Record<string, EditableLesson> {
  if (typeof window === 'undefined') return { [GRADATION_ID]: GRADATION_EDITABLE };
  try {
    const raw = window.localStorage.getItem(LESSONS_KEY);
    if (!raw) return { [GRADATION_ID]: GRADATION_EDITABLE };
    const parsed = JSON.parse(raw) as Record<string, EditableLesson>;
    return { [GRADATION_ID]: GRADATION_EDITABLE, ...parsed };
  } catch {
    return { [GRADATION_ID]: GRADATION_EDITABLE };
  }
}

export function loadEditableLesson(lessonId: string): EditableLesson | null {
  const map = loadLessonMap();
  if (map[lessonId]) return map[lessonId]!;
  const fallback = BOARD_LESSON_DETAILS[lessonId];
  if (fallback) return detailToEditable(fallback);
  return null;
}

export function saveEditableLesson(lesson: EditableLesson): EditableLesson {
  const saved: EditableLesson = {
    ...lesson,
    updatedLabel: `Updated ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`,
  };
  if (typeof window === 'undefined') return saved;
  const map = loadLessonMap();
  map[lesson.id] = saved;
  window.localStorage.setItem(LESSONS_KEY, JSON.stringify(map));
  return saved;
}

export function resolveLessonDetail(card: BoardCard): LessonDetail {
  const edited = loadEditableLesson(card.lessonId);
  if (edited) return editableToDetail(edited);
  const known = BOARD_LESSON_DETAILS[card.lessonId];
  if (known) return known;
  return {
    id: card.lessonId,
    title: card.lessonTitle,
    updatedLabel: card.updatedLabel,
    category: card.category || 'General',
    lessonSet: card.ageBand,
    ages: card.ageBand.replace(/^[^(]*\(|\)$/g, '') || card.ageBand,
    group: card.group || 'General',
    whatIsIt: 'Lesson details will appear here once the curriculum content is linked.',
    why: ['Supports classroom progress tracking for this lesson'],
    atHome: ['Ask your teacher for home extensions related to this lesson'],
  };
}

export function ensureEditableFromCard(card: BoardCard): EditableLesson {
  const existing = loadEditableLesson(card.lessonId);
  if (existing) return existing;
  const created: EditableLesson = {
    id: card.lessonId,
    title: card.lessonTitle,
    updatedLabel: card.updatedLabel,
    lessonSets: card.ageBand ? [card.ageBand] : [],
    roomId: '',
    ageBands: [],
    description: buildDescription(
      'Lesson details will appear here once the curriculum content is linked.',
      ['Supports classroom progress tracking for this lesson'],
      ['Ask your teacher for home extensions related to this lesson'],
    ),
    durationMin: '',
    youtubeUrl: '',
    developmentAreas: card.category ? [card.category] : [],
    groups: card.group ? [card.group] : [],
    label: '',
  };
  saveEditableLesson(created);
  return created;
}
