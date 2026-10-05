import type { Center, CenterStats, Organization } from '@/types/organization';

/** Demo organization with multiple centers (UI + local mocks). */
export const DEMO_ORGANIZATION: Organization = {
  id: 'org-panacea',
  name: 'Panacea Childcare Group',
  centers: [
    {
      id: 'ctr-hams',
      name: 'Hams Kids Home | Daycare',
      shortName: 'Hams Kids',
      code: 'HAMS',
      city: 'Hyderabad',
      status: 'active',
    },
    {
      id: 'ctr-sunshine',
      name: 'Sunshine Early Learning',
      shortName: 'Sunshine',
      code: 'SUN',
      city: 'Bengaluru',
      status: 'active',
    },
    {
      id: 'ctr-rainbow',
      name: 'Rainbow Kids Academy',
      shortName: 'Rainbow',
      code: 'RBN',
      city: 'Chennai',
      status: 'active',
    },
  ],
};

export const DEFAULT_CENTER_ID = DEMO_ORGANIZATION.centers[0]!.id;

export const CENTER_STATS: CenterStats[] = [
  {
    centerId: 'ctr-hams',
    students: 42,
    staff: 18,
    rooms: 6,
    attendanceIn: 28,
    attendancePending: 8,
    enquiriesOpen: 5,
    formsLive: 3,
  },
  {
    centerId: 'ctr-sunshine',
    students: 36,
    staff: 14,
    rooms: 5,
    attendanceIn: 22,
    attendancePending: 6,
    enquiriesOpen: 3,
    formsLive: 2,
  },
  {
    centerId: 'ctr-rainbow',
    students: 51,
    staff: 21,
    rooms: 7,
    attendanceIn: 34,
    attendancePending: 9,
    enquiriesOpen: 7,
    formsLive: 4,
  },
];

export function getOrganization(): Organization {
  return DEMO_ORGANIZATION;
}

export function getCenters(): Center[] {
  return DEMO_ORGANIZATION.centers;
}

export function getCenterById(id: string): Center | undefined {
  return DEMO_ORGANIZATION.centers.find((c) => c.id === id);
}

export function getCenterName(id: string): string {
  return getCenterById(id)?.shortName ?? getCenterById(id)?.name ?? id;
}

export function getStatsForCenter(centerId: string): CenterStats | undefined {
  return CENTER_STATS.find((s) => s.centerId === centerId);
}

export function getOrgRollupStats() {
  return CENTER_STATS.reduce(
    (acc, s) => ({
      students: acc.students + s.students,
      staff: acc.staff + s.staff,
      rooms: acc.rooms + s.rooms,
      attendanceIn: acc.attendanceIn + s.attendanceIn,
      attendancePending: acc.attendancePending + s.attendancePending,
      enquiriesOpen: acc.enquiriesOpen + s.enquiriesOpen,
      formsLive: acc.formsLive + s.formsLive,
      centers: acc.centers + 1,
    }),
    {
      students: 0,
      staff: 0,
      rooms: 0,
      attendanceIn: 0,
      attendancePending: 0,
      enquiriesOpen: 0,
      formsLive: 0,
      centers: 0,
    },
  );
}

/** Deterministic center assignment for seeding / migration. */
export function assignCenterIdByIndex(index: number, centerIds: string[] = DEMO_ORGANIZATION.centers.map((c) => c.id)): string {
  return centerIds[index % centerIds.length] ?? DEFAULT_CENTER_ID;
}
