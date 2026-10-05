import { CLASSROOMS, CURRENT_USER } from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type RoomCapacityColumnMode = 'all' | 'custom';

export type RoomCapacityColumnId =
  | 'centerName'
  | 'roomName'
  | 'minimumAge'
  | 'maximumAge'
  | 'capacity'
  | 'updatedBy'
  | 'updatedOn';

export const ROOM_CAPACITY_COLUMNS: { id: RoomCapacityColumnId; label: string }[] = [
  { id: 'centerName', label: 'Center Name' },
  { id: 'roomName', label: 'Room Name' },
  { id: 'minimumAge', label: 'Minimum Age' },
  { id: 'maximumAge', label: 'Maximum Age' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'updatedBy', label: 'Updated By' },
  { id: 'updatedOn', label: 'Updated On' },
];

export type RoomCapacityFormValues = {
  columnMode: RoomCapacityColumnMode;
  selectedColumns: RoomCapacityColumnId[];
};

const AGE_BANDS = [
  { min: '0 months', max: '12 months', capacity: 12 },
  { min: '1 year', max: '2 years', capacity: 16 },
  { min: '2 years', max: '3 years', capacity: 18 },
  { min: '3 years', max: '4 years', capacity: 20 },
  { min: '4 years', max: '5 years', capacity: 22 },
];

export function defaultRoomCapacityForm(): RoomCapacityFormValues {
  return {
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumnDefs(values: RoomCapacityFormValues) {
  if (values.columnMode === 'all') return ROOM_CAPACITY_COLUMNS;
  return ROOM_CAPACITY_COLUMNS.filter((c) => values.selectedColumns.includes(c.id));
}

export function buildRoomCapacityRows(
  values: RoomCapacityFormValues,
): Record<string, string>[] {
  const defs = activeColumnDefs(values);
  return CLASSROOMS.map((room, i) => {
    const band = AGE_BANDS[i % AGE_BANDS.length];
    const full: Record<RoomCapacityColumnId, string> = {
      centerName: 'Panacea Little Stars',
      roomName: room,
      minimumAge: band.min,
      maximumAge: band.max,
      capacity: String(band.capacity),
      updatedBy: i % 2 === 0 ? 'Malika Thimisetty' : 'Priya Nair',
      updatedOn: `${String(10 + (i % 18)).padStart(2, '0')}/07/2026`,
    };
    const row: Record<string, string> = {};
    defs.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createRoomCapacityReport(
  values: RoomCapacityFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const defs = activeColumnDefs(values);
  const columns = defs.map((c) => c.label);
  const rows = buildRoomCapacityRows(values);
  const now = new Date();

  return {
    id: `room-capacity-${now.getTime()}`,
    kind: 'room-capacity',
    name: `Room_Capacity_Report_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: '',
    endDate: '',
    filterBy: 'classroom',
    selectedLabel: 'All rooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
