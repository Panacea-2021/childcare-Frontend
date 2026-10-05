import type {
  ChecklistItemDef,
  ChecklistItemEntry,
  DailyReportFilterState,
  ReportStatus,
  RoomDailyReport,
} from '@/types/dailyReport';
import { roomChecklistColumns, unionChecklistColumns } from '@/lib/mock/mockDailyReports';

export { roomChecklistColumns, unionChecklistColumns };

export function enabledChecklist(checklist: ChecklistItemDef[]): ChecklistItemDef[] {
  return [...checklist].filter((c) => c.enabled).sort((a, b) => a.order - b.order);
}

export function getEntry(
  report: RoomDailyReport,
  itemId: string,
): ChecklistItemEntry | undefined {
  return report.items.find((i) => i.itemId === itemId);
}

export function roomHasColumn(report: RoomDailyReport, itemId: string, base: ChecklistItemDef[]) {
  return roomChecklistColumns(base, report).some((c) => c.id === itemId);
}

export function statusLabel(status: ReportStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'completed':
      return 'Completed';
    case 'partially_completed':
      return 'Partially Completed';
    case 'sent':
      return 'Sent';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

export function statusClass(status: ReportStatus): string {
  return `dr-status dr-status-${status}`;
}

export function filterReports(
  reports: RoomDailyReport[],
  filters: DailyReportFilterState,
): RoomDailyReport[] {
  const q = filters.search.trim().toLowerCase();
  return reports.filter((r) => {
    if (filters.room !== 'all' && r.room !== filters.room) return false;
    if (q && !r.room.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function computeStats(reports: RoomDailyReport[]) {
  return {
    totalRooms: reports.length,
    completed: reports.filter((r) => r.status === 'completed' || r.status === 'sent').length,
    pending: reports.filter((r) => r.status === 'pending' || r.status === 'draft').length,
    sent: reports.filter((r) => r.status === 'sent').length,
    attendance: reports.reduce((sum, r) => sum + r.presentCount, 0),
    incidents: reports.filter((r) => r.hasIncident).length,
  };
}

export function nowTimeLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
