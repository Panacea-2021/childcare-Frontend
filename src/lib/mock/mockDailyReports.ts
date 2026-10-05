import type {
  ChecklistItemDef,
  ChecklistItemEntry,
  ReportStatus,
  RoomDailyReport,
} from '@/types/dailyReport';

import { liveArray } from '@/lib/center-management/liveList';
import {
  countStudentsInRoom,
  loadActiveCenterRooms,
} from '@/lib/center-management/programCatalog';

export const DAILY_REPORT_ROOMS = liveArray(() =>
  loadActiveCenterRooms().map((room) => ({
    id: room.id,
    name: room.name,
    studentCount: countStudentsInRoom(room.id),
  })),
);

export const TODAY_DATE = '2026-08-02';

export const DEFAULT_CHECKLIST: ChecklistItemDef[] = [
  { id: 'cl-check-in', name: 'Check In', enabled: true, order: 0, isSystem: true, key: 'check_in' },
  { id: 'cl-breakfast', name: 'Breakfast', enabled: true, order: 1, isSystem: true, key: 'breakfast' },
  { id: 'cl-lunch', name: 'Lunch', enabled: true, order: 2, isSystem: true, key: 'lunch' },
  {
    id: 'cl-evening-snack',
    name: 'Evening Snack',
    enabled: true,
    order: 3,
    isSystem: true,
    key: 'evening_snack',
  },
  {
    id: 'cl-medication',
    name: 'Medication',
    enabled: true,
    order: 4,
    isSystem: true,
    key: 'medication',
  },
  { id: 'cl-potty', name: 'Potty', enabled: true, order: 5, isSystem: true, key: 'potty' },
  { id: 'cl-nap', name: 'Nap', enabled: true, order: 6, isSystem: true, key: 'nap' },
  {
    id: 'cl-indoor',
    name: 'Indoor Activity',
    enabled: true,
    order: 7,
    isSystem: true,
    key: 'indoor_activity',
  },
  { id: 'cl-incident', name: 'Incident', enabled: true, order: 8, isSystem: true, key: 'incident' },
  {
    id: 'cl-check-out',
    name: 'Check Out',
    enabled: true,
    order: 9,
    isSystem: true,
    key: 'check_out',
  },
  {
    id: 'cl-water',
    name: 'Water Intake',
    enabled: false,
    order: 10,
    isSystem: true,
    key: 'water_intake',
  },
  {
    id: 'cl-outdoor',
    name: 'Outdoor Play',
    enabled: false,
    order: 11,
    isSystem: true,
    key: 'outdoor_play',
  },
  {
    id: 'cl-story',
    name: 'Story Time',
    enabled: false,
    order: 12,
    isSystem: true,
    key: 'story_time',
  },
];

export const ADDABLE_CHECKLIST_PRESETS = [
  'Running',
  'Outdoor Play',
  'Music',
  'Dance',
  'Swimming',
  'Homework',
  'Special Activity',
  'Story Circle',
] as const;

const STAFF = ['Ms. Ananya', 'Ms. Kavya', 'Mr. Rahul', 'Ms. Fatima', 'Ms. Leena'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function computeStatus(percent: number, sent: boolean): ReportStatus {
  if (sent) return 'sent';
  if (percent === 0) return 'pending';
  if (percent >= 100) return 'completed';
  if (percent < 40) return 'draft';
  return 'partially_completed';
}

function completionOf(items: ChecklistItemEntry[]): number {
  const relevant = items.filter((i) => i.itemId !== 'cl-incident');
  if (relevant.length === 0) return 0;
  return Math.round((relevant.filter((i) => i.completed).length / relevant.length) * 100);
}

export function createEmptyItems(defs: ChecklistItemDef[]): ChecklistItemEntry[] {
  return defs
    .filter((c) => c.enabled)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ itemId: c.id, completed: false }));
}

export function roomChecklistColumns(
  base: ChecklistItemDef[],
  report: RoomDailyReport,
): ChecklistItemDef[] {
  const enabledBase = base.filter((c) => c.enabled);
  const extras = report.extraItems.filter((c) => c.enabled);
  const map = new Map<string, ChecklistItemDef>();
  [...enabledBase, ...extras]
    .sort((a, b) => a.order - b.order)
    .forEach((c) => map.set(c.id, c));
  return Array.from(map.values());
}

export function unionChecklistColumns(
  base: ChecklistItemDef[],
  reports: RoomDailyReport[],
): ChecklistItemDef[] {
  const map = new Map<string, ChecklistItemDef>();
  base
    .filter((c) => c.enabled)
    .forEach((c) => map.set(c.id, c));
  reports.forEach((r) => {
    r.extraItems
      .filter((c) => c.enabled)
      .forEach((c) => {
        if (!map.has(c.id)) map.set(c.id, c);
      });
  });
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

export function recalculateReport(
  report: RoomDailyReport,
  baseChecklist: ChecklistItemDef[],
): RoomDailyReport {
  const cols = roomChecklistColumns(baseChecklist, report);
  const ids = new Set(cols.map((c) => c.id));
  const byId = new Map(report.items.map((i) => [i.itemId, i]));
  const items = cols.map((c) => byId.get(c.id) ?? { itemId: c.id, completed: false });
  const filtered = items.filter((i) => ids.has(i.itemId));
  const percent = completionOf(filtered);
  const hasIncident = filtered.some(
    (i) => i.itemId === 'cl-incident' && i.completed && i.incident,
  );
  const wasSent = report.status === 'sent';

  return {
    ...report,
    items: filtered,
    completionPercent: percent,
    hasIncident,
    status: wasSent ? 'sent' : computeStatus(percent, false),
  };
}

function buildItems(enabledIds: string[], seed: number, forceIncident: boolean): ChecklistItemEntry[] {
  return enabledIds.map((id, idx) => {
    const isIncident = id === 'cl-incident';
    const completed = isIncident
      ? forceIncident
      : idx < 4 + (seed % 4) || (seed + idx) % 3 === 0;
    const hour = 8 + (idx % 8);
    const minute = (seed * 7 + idx * 11) % 60;
    const entry: ChecklistItemEntry = {
      itemId: id,
      completed,
      completedAt: completed
        ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        : undefined,
      completedBy: completed ? pick(STAFF, seed + idx) : undefined,
      remarks: completed
        ? pick(
            ['Completed as planned.', 'Went smoothly.', 'Children enjoyed this.', ''],
            seed + idx,
          ) || undefined
        : undefined,
    };
    if (isIncident && forceIncident) {
      entry.incident = {
        type: 'Minor Injury',
        description: 'Minor scratch during outdoor play. First aid applied.',
        severity: 'low',
        notifyParent: true,
      };
      entry.remarks = entry.incident.description;
    }
    return entry;
  });
}

function buildReports(): RoomDailyReport[] {
  const enabledIds = DEFAULT_CHECKLIST.filter((c) => c.enabled).map((c) => c.id);

  return DAILY_REPORT_ROOMS.map((room, index) => {
    const forceIncident = index === 1 || index === 4;
    const items = buildItems(enabledIds, index + 2, forceIncident);
    const percent = completionOf(items);
    const sent = index % 3 === 0 && percent >= 70;
    const present = room.studentCount - (index % 3);

    return {
      id: `room-dr-${room.id}`,
      room: room.name,
      date: TODAY_DATE,
      studentCount: room.studentCount,
      presentCount: present,
      items,
      extraItems: [],
      overallNotes:
        index % 2 === 0
          ? `${room.name} had an engaging day with smooth transitions and happy children.`
          : undefined,
      status: computeStatus(percent, sent),
      completionPercent: percent,
      notifyParent: sent,
      hasIncident: forceIncident,
    };
  });
}

export const MOCK_ROOM_DAILY_REPORTS: RoomDailyReport[] = buildReports();

/** @deprecated use MOCK_ROOM_DAILY_REPORTS */
export const MOCK_DAILY_REPORTS = MOCK_ROOM_DAILY_REPORTS;
