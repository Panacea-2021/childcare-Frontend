import type { CenterScope } from '@/types/organization';
import { DEFAULT_CENTER_ID } from './centers';

type WithCenter = { centerId?: string };

/** Filter records by active center scope. Untagged records belong to the default center. */
export function filterByCenterScope<T extends WithCenter>(items: T[], scope: CenterScope): T[] {
  if (scope === 'all') return items;
  return items.filter((item) => (item.centerId ?? DEFAULT_CENTER_ID) === scope);
}

export function resolveCenterId(centerId: string | undefined): string {
  return centerId ?? DEFAULT_CENTER_ID;
}
