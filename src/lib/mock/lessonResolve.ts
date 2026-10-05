import { LESSON_CATALOG } from '@/lib/mock/lessonCatalog';
import { flattenLessons } from '@/lib/mock/mockProgressTracking';

/**
 * Resolve a Progress Grid / observation lesson id to a LESSON_CATALOG id.
 * Accepts catalog ids directly, or grid mock ids via title / alias map.
 */
const GRID_ALIASES: Record<string, string> = {
  'art-hist-1': '-OwY4Fa-OQiQCcuKs3tA', // Story of the Created Image
  'art-1': '-OwY4EMCkVNmCDRi7A58', // Experiments with Color
  'art-2': '-OwY4FawmkhYpOqZ2hn9', // Collage
  'art-3': '-OwY4FpzUFi5z0A_3Hnc', // Clay
  'bio-1': '-OwY4FM8lfNe2UzUsOFc', // Parts of a Plant
  'bio-2': '-OwY4FpNvp0wPedhO2pC', // Germinating Seeds (nearest living-world seed)
  'bio-3': '-OwY4FpNvp0wPedhO2pC',
  'bot-1': '-OwY4FfXHmxgH2kzM-Ox', // Leaf Cabinet
  'bot-2': '-OwY4FpNvp0wPedhO2pC', // Germinating Seeds
  'bot-3': '-OwY4FM8lfNe2UzUsOFc', // Parts of a Plant
  'food-1': '-OwY4FoiXtiHQjcTLsNY', // Hand Washing at the Sink
  'food-2': '-OwY4FrO76vZKjWC16h7', // Cleanup
  'food-3': '-OwY4FbABErxKVTzLq43', // Pouring Water
  'food-4': '-OwY4FrO76vZKjWC16h7', // Cleanup
  'geo-1': '-OwY4FnVkSq3v5g--glj', // Land and Water Forms
  'geo-2': '-OwY4Fn1UiC_7ZjT6otI', // Map of the Continents
  'geo-3': '-OwY4Fn1UiC_7ZjT6otI',
};

export function resolveCatalogLessonId(presetLessonId: string | null | undefined): string | null {
  if (!presetLessonId) return null;

  if (LESSON_CATALOG.some((l) => l.id === presetLessonId)) return presetLessonId;

  const aliased = GRID_ALIASES[presetLessonId];
  if (aliased && LESSON_CATALOG.some((l) => l.id === aliased)) return aliased;

  const grid = flattenLessons().find((l) => l.id === presetLessonId);
  if (!grid) return null;

  const exact = LESSON_CATALOG.find(
    (l) => l.title.toLowerCase() === grid.title.toLowerCase(),
  );
  if (exact) return exact.id;

  const fuzzy = LESSON_CATALOG.find(
    (l) =>
      l.title.toLowerCase().includes(grid.title.toLowerCase()) ||
      grid.title.toLowerCase().includes(l.title.toLowerCase()),
  );
  return fuzzy?.id ?? null;
}

/** Title for any catalog or legacy grid lesson id. */
export function resolveLessonTitle(lessonId: string): string {
  const catalog = LESSON_CATALOG.find((l) => l.id === lessonId);
  if (catalog) return catalog.title;

  const viaAlias = GRID_ALIASES[lessonId];
  if (viaAlias) {
    const aliased = LESSON_CATALOG.find((l) => l.id === viaAlias);
    if (aliased) return aliased.title;
  }

  const grid = flattenLessons().find((l) => l.id === lessonId);
  return grid?.title ?? 'Lesson';
}
