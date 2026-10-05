import type {
  LessonSetOption,
  ProgressCategory,
  ProgressStatus,
  ProgressStudent,
} from '@/types/progressTracking';
import {
  DEFAULT_LESSON_SET_MAPPINGS,
  lessonSetFilterOptions,
} from '@/lib/mock/mockLessonSetMapping';

import { liveArray } from '@/lib/center-management/liveList';
import { loadActiveCenterRooms, loadEnrolledCenterStudents } from '@/lib/center-management/programCatalog';
import { initials, roomName } from '@/lib/center-management/studentsStore';

const PROGRESS_TONES: ProgressStudent['tone'][] = [
  'rose',
  'violet',
  'amber',
  'sky',
  'mint',
  'lavender',
  'coral',
];

export const PROGRESS_STUDENTS: ProgressStudent[] = liveArray(() =>
  loadEnrolledCenterStudents().map((student, index) => ({
    id: student.id,
    name: student.name,
    shortName: student.preferredName || student.name.split(/\s+/)[0] || student.name,
    initials: initials(student.name),
    tone: PROGRESS_TONES[index % PROGRESS_TONES.length],
    room: roomName(student.roomIds[0] || ''),
  })),
);

/** Driven by Lesson Set Mapping defaults (same ids as LSM rows). */
export const LESSON_SETS: LessonSetOption[] = lessonSetFilterOptions(DEFAULT_LESSON_SET_MAPPINGS);

export const PROGRESS_ROOMS = liveArray(() => [
  { id: 'all', name: 'All Classrooms' },
  ...loadActiveCenterRooms().map((r) => ({ id: r.id, name: r.name })),
]);

function cell(
  a: ProgressStatus,
  b: ProgressStatus,
  c: ProgressStatus,
  d: ProgressStatus = 'none',
): Record<string, ProgressStatus> {
  return { 'st-alex': a, 'st-nara': b, 'st-new': c, 'st-mia': d };
}

/**
 * Grid lessons use real LESSON_CATALOG ids + titles so Add Record / Observations resolve.
 * ageBand stays short (`3-6` / `6-12`) for Grid age filters; LSM matches via ageBandMatchesSet.
 */
export const PROGRESS_CATEGORIES: ProgressCategory[] = [
  {
    id: 'art',
    name: 'Art',
    displayCount: 22,
    subcategories: [
      {
        id: 'art-history',
        name: 'Art History',
        lessons: [
          {
            id: '-OwY4Fa-OQiQCcuKs3tA',
            title: 'Story of the Created Image',
            ageBand: '6-12',
            statuses: cell('none', 'none', 'none', 'introduced'),
          },
        ],
      },
      {
        id: 'art-making',
        name: 'Art Making',
        lessons: [
          {
            id: '-OwY4EMCkVNmCDRi7A58',
            title: 'Experiments with Color',
            ageBand: '3-6',
            statuses: cell('mastered', 'practiced', 'introduced', 'planned'),
          },
          {
            id: '-OwY4FawmkhYpOqZ2hn9',
            title: 'Collage',
            ageBand: '3-6',
            statuses: cell('practiced', 'introduced', 'none', 'none'),
          },
          {
            id: '-OwY4FpzUFi5z0A_3Hnc',
            title: 'Clay',
            ageBand: '3-6',
            statuses: cell('introduced', 'planned', 'none', 'none'),
          },
        ],
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    displayCount: 162,
    subcategories: [
      {
        id: 'bio-living',
        name: 'Living World',
        lessons: [
          {
            id: '-OwY4FM8lfNe2UzUsOFc',
            title: 'Parts of a Plant',
            ageBand: '3-6',
            statuses: cell('mastered', 'practiced', 'introduced', 'practiced'),
          },
          {
            id: '-OwY4FpNvp0wPedhO2pC',
            title: 'Germinating Seeds',
            ageBand: '3-6',
            statuses: cell('practiced', 'introduced', 'none', 'planned'),
          },
          {
            id: '-OwY4FfXHmxgH2kzM-Ox',
            title: 'Leaf Cabinet',
            ageBand: '6-12',
            statuses: cell('introduced', 'planned', 'none', 'none'),
          },
        ],
      },
    ],
  },
  {
    id: 'botany',
    name: 'Botany',
    displayCount: 124,
    subcategories: [
      {
        id: 'bot-plants',
        name: 'Plant Study',
        lessons: [
          {
            id: '-OwY4E3tG4J_Aw1NCuIq',
            title: 'External Leaf',
            ageBand: '3-6',
            statuses: cell('practiced', 'introduced', 'planned', 'none'),
          },
          {
            id: '-OwY4E4aOouGEEfxAjqa',
            title: 'External Seed',
            ageBand: '3-6',
            statuses: cell('mastered', 'practiced', 'introduced', 'introduced'),
          },
          {
            id: '-OwY4E1xFCjOhbzff0M9',
            title: 'Analysis of Leaf',
            ageBand: '6-12',
            statuses: cell('introduced', 'planned', 'none', 'none'),
          },
        ],
      },
    ],
  },
  {
    id: 'food-prep',
    name: 'Food Preparation',
    displayCount: 4,
    subcategories: [
      {
        id: 'food-basics',
        name: 'Practical Life',
        lessons: [
          {
            id: '-OwY4FoiXtiHQjcTLsNY',
            title: 'Hand Washing at the Sink',
            ageBand: '3-6',
            statuses: cell('mastered', 'mastered', 'practiced', 'practiced'),
          },
          {
            id: '-OwY4FrO76vZKjWC16h7',
            title: 'Cleanup',
            ageBand: '3-6',
            statuses: cell('practiced', 'introduced', 'planned', 'none'),
          },
          {
            id: '-OwY4FbABErxKVTzLq43',
            title: 'Pouring Water',
            ageBand: '3-6',
            statuses: cell('mastered', 'practiced', 'introduced', 'planned'),
          },
        ],
      },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    displayCount: 445,
    subcategories: [
      {
        id: 'geo-world',
        name: 'World Knowledge',
        lessons: [
          {
            id: '-OwY4FnVkSq3v5g--glj',
            title: 'Land and Water Forms',
            ageBand: '3-6',
            statuses: cell('practiced', 'introduced', 'none', 'planned'),
          },
          {
            id: '-OwY4Fn1UiC_7ZjT6otI',
            title: 'Map of the Continents',
            ageBand: '3-6',
            statuses: cell('introduced', 'planned', 'none', 'none'),
          },
        ],
      },
    ],
  },
];

export const STATUS_META: Record<
  ProgressStatus,
  { code: string; label: string; className: string }
> = {
  planned: { code: 'P', label: 'Planned', className: 'is-planned' },
  introduced: { code: 'I', label: 'Introduced', className: 'is-introduced' },
  practiced: { code: 'Pr', label: 'Practiced', className: 'is-practiced' },
  mastered: { code: 'M', label: 'Mastered', className: 'is-mastered' },
  none: { code: '+', label: 'Not started', className: 'is-none' },
};

export function flattenLessons(categories: ProgressCategory[] = PROGRESS_CATEGORIES) {
  return categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.lessons.map((lesson) => ({
        ...lesson,
        categoryId: cat.id,
        categoryName: cat.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
      })),
    ),
  );
}
