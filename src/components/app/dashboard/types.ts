export type {
  ActivityItem,
  AttendanceCounts,
  AttendanceScope,
  AttendanceSnapshot,
  DashboardBundle,
  DashboardKpi,
  KpiPanelId,
  RoomRecord,
  StaffRecord,
  StudentRecord,
} from '@/data/dashboard.types';

import type { DashboardBundle } from '@/data/dashboard.types';

export type ActivitySummary = DashboardBundle['activity'];
export type ParentCommunicationSummary = DashboardBundle['parentCommunication'];
export type EnquiriesSummary = DashboardBundle['enquiries'];
export type BillingSummary = DashboardBundle['billing'];
export type InstallationsSummary = DashboardBundle['installations'];

/** @deprecated use DASHBOARD_DATA from @/data/dashboard */
export { DASHBOARD_DATA as DASHBOARD_MOCK } from '@/data/dashboard';
