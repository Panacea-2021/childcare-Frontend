'use client';

import { useEffect, useMemo, useState } from 'react';
import '@/components/ui/module.css';
import './dashboard.css';

import { DASHBOARD_DATA } from '@/data/dashboard';
import type { AttendanceScope, DashboardBundle, KpiPanelId } from '@/data/dashboard.types';
import { applyCenterManagementDashboard } from '@/lib/center-management/dashboardFromCenter';
import { useCenterScope } from '@/components/organization/CenterScopeContext';
import { buildAllCentersDashboard } from '@/lib/organization/allCentersDashboard';
import { OrgCentersStrip } from '@/components/organization/OrgCentersStrip';
import {
  buildDashboardActivitySummary,
  buildDashboardRecentActivities,
  countTodayPostedActivities,
  subscribeActivityPosts,
} from '@/lib/parent-communication/activitiesPostsStore';

import { ActivitySummaryWidget } from './dashboard/ActivitySummaryWidget';
import { AttendanceOverview } from './dashboard/AttendanceOverview';
import { BillingWidget } from './dashboard/BillingWidget';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { EnquiriesWidget } from './dashboard/EnquiriesWidget';
import {
  DatesFeedWidget,
  FeedWidgets,
  QuickActionsWidget,
  RecentActivityWidget,
  TodaySummaryWidget,
  WeeklyAttendanceWidget,
} from './dashboard/ExtraWidgets';
import { InstallationsWidget } from './dashboard/InstallationsWidget';
import { KpiDetailPanel } from './dashboard/KpiDetailPanel';
import { KpiStatsRow } from './dashboard/KpiStatsRow';
import { ParentCommunicationWidget } from './dashboard/ParentCommunicationWidget';
import { UpcomingEventsWidget } from './dashboard/UpcomingEventsWidget';
import { useDashboardBoot } from './dashboard/useDashboardBoot';
import { usePermissions } from '@/components/auth/AuthorizationProvider';
import { PermissionGate } from '@/components/auth/PermissionGate';

function toInputDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function DashboardHome() {
  const ready = useDashboardBoot(320);
  const { ready: authReady, loading: authLoading, hasAnyPermission } = usePermissions();
  const { isAllCenters, scopeLabel } = useCenterScope();
  const [scope, setScope] = useState<AttendanceScope>('center');
  const [dateValue, setDateValue] = useState(() => toInputDate(new Date()));
  const [activeKpi, setActiveKpi] = useState<KpiPanelId | null>('rooms');
  const [activityTick, setActivityTick] = useState(0);
  const [centerReady, setCenterReady] = useState(false);

  useEffect(() => {
    const bump = () => setActivityTick((n) => n + 1);
    bump();
    return subscribeActivityPosts(bump);
  }, []);

  useEffect(() => {
    setCenterReady(true);
  }, []);

  const data = useMemo(() => {
    const base = isAllCenters ? buildAllCentersDashboard() : DASHBOARD_DATA;
    const live = buildDashboardActivitySummary(dateValue);
    const recentLive = buildDashboardRecentActivities(8);
    const todayPosts = countTodayPostedActivities(dateValue);

    const merged: DashboardBundle = {
      ...base,
      activity: {
        incidents: base.activity.incidents + live.incidents,
        photos: base.activity.photos + live.photos,
        videos: base.activity.videos + live.videos,
        announcements: base.activity.announcements + live.announcements,
        approvalPending: base.activity.approvalPending + live.approvalPending,
      },
      recentActivities: recentLive.length > 0 ? recentLive : base.recentActivities,
      todaySummary: {
        ...base.todaySummary,
        posts: base.todaySummary.posts + todayPosts,
      },
    };

    if (centerReady) {
      return applyCenterManagementDashboard(merged);
    }
    return merged;
    // activityTick forces refresh when posts are published
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllCenters, dateValue, activityTick, centerReady]);

  const attendance = data.attendance[scope];

  const kpis = useMemo(() => {
    const staffN = Number(data.kpis.find((k) => k.id === 'staff')?.animateNumber ?? 0);
    const studentN = Number(data.kpis.find((k) => k.id === 'students')?.animateNumber ?? 0);
    const ratio = staffN === 0 ? '—' : `${(studentN / staffN).toFixed(1)}:1`;
    return data.kpis.map((kpi) => (kpi.id === 'ratio' ? { ...kpi, value: ratio } : kpi));
  }, [data.kpis]);

  const onSelectKpi = (id: KpiPanelId) => {
    setActiveKpi((prev) => (prev === id ? null : id));
  };

  const showAttendance = hasAnyPermission(['sa-record', 'sa-update', 'sta-record', 'sta-update']);
  const showParentComm = hasAnyPermission([
    'pc-post-view',
    'pc-notes-view',
    'pc-concern-view',
    'pc-nl-create',
  ]);
  const showEnquiries = hasAnyPermission(['enq-view', 'enq-add-update']);
  const showBilling = hasAnyPermission(['bill-view-dashboard', 'bill-view-module', 'rep-billing']);
  const showActivity = hasAnyPermission(['pc-post-view', 'as-view-obs', 'as-view']);
  const showCalendar = hasAnyPermission(['cal-view', 'cal-ss-view']);

  if (!ready || !authReady || authLoading) {
    return (
      <div className="mod-page">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="mod-page dash-page">
      <div className="dash-ambient" aria-hidden />

      <DashboardHeader
        dateValue={dateValue}
        onDateChange={setDateValue}
        displayLabel={formatDisplayDate(dateValue)}
        title={isAllCenters ? 'All Centers Dashboard' : `${scopeLabel} Dashboard`}
        eyebrow={isAllCenters ? 'Organization Overview' : 'Center Dashboard'}
      />

      {isAllCenters ? <OrgCentersStrip /> : null}

      <PermissionGate
        anyOf={['cm-students-view-page', 'cm-staff-view', 'sa-record', 'sta-record', 'bill-view-dashboard']}
      >
        <KpiStatsRow items={kpis} animate activeId={activeKpi} onSelect={onSelectKpi} />
        <KpiDetailPanel active={activeKpi} data={data} onClose={() => setActiveKpi(null)} />
      </PermissionGate>

      {(showAttendance || showActivity) && (
        <div className="dash-widgetGrid">
          {showAttendance ? <TodaySummaryWidget data={data} /> : null}
          <PermissionGate anyOf={['sa-record', 'pc-post-add', 'enq-add-update', 'bill-record-payment']}>
            <QuickActionsWidget data={data} />
          </PermissionGate>
          {showAttendance ? <WeeklyAttendanceWidget data={data} /> : null}
        </div>
      )}

      {showAttendance ? (
        <AttendanceOverview scope={scope} onScopeChange={setScope} data={attendance} />
      ) : null}

      {(showActivity || showCalendar || showParentComm) && (
        <div className="dash-widgetGrid">
          {showActivity ? <ActivitySummaryWidget data={data.activity} /> : null}
          {showCalendar ? <UpcomingEventsWidget data={data} /> : null}
          {showParentComm ? (
            <ParentCommunicationWidget data={data.parentCommunication} />
          ) : null}
        </div>
      )}

      {(showActivity || showEnquiries) && (
        <div className="dash-widgetGrid dash-widgetGridBottom">
          {showActivity ? <RecentActivityWidget data={data} /> : null}
          {showEnquiries ? <EnquiriesWidget data={data.enquiries} /> : null}
        </div>
      )}

      {showBilling ? (
        <div className="dash-widgetGrid dash-widgetGridBottom">
          <BillingWidget data={data.billing} />
          <PermissionGate permission="cm-ac-install-report">
            <InstallationsWidget data={data.installations} />
          </PermissionGate>
        </div>
      ) : (
        <PermissionGate permission="cm-ac-install-report">
          <div className="dash-widgetGrid dash-widgetGridBottom">
            <InstallationsWidget data={data.installations} />
          </div>
        </PermissionGate>
      )}

      <PermissionGate anyOf={['pc-post-view', 'cal-view', 'enq-view']}>
        <FeedWidgets data={data} />
        <DatesFeedWidget data={data} />
      </PermissionGate>
    </div>
  );
}
