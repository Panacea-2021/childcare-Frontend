'use client';

import { useRouter } from 'next/navigation';
import {
  Building2,
  ClipboardList,
  DoorOpen,
  MessageSquareWarning,
  Users,
  UserRound,
} from 'lucide-react';
import { CENTER_STATS, getCenterById, getOrgRollupStats } from '@/lib/organization/centers';
import { useCenterScope } from './CenterScopeContext';
import './org-dashboard.css';

export function OrgDashboard() {
  const router = useRouter();
  const { organization, setActiveScope } = useCenterScope();
  const rollup = getOrgRollupStats();

  const cards = [
    { label: 'Centers', value: rollup.centers, icon: Building2 },
    { label: 'Students', value: rollup.students, icon: UserRound },
    { label: 'Staff', value: rollup.staff, icon: Users },
    { label: 'Rooms', value: rollup.rooms, icon: DoorOpen },
    { label: 'Open enquiries', value: rollup.enquiriesOpen, icon: MessageSquareWarning },
    { label: 'Live forms', value: rollup.formsLive, icon: ClipboardList },
  ];

  return (
    <div className="mod-page org-dash">
      <div className="org-dash-head">
        <div>
          <p className="org-dash-eyebrow">Organization Overview</p>
          <h1>{organization.name}</h1>
          <p className="org-dash-sub">
            View rollup metrics across all centers, then open a center to work in its day-to-day
            modules.
          </p>
        </div>
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={() => router.push('/center-management/students')}
        >
          Browse students
        </button>
      </div>

      <section className="org-kpi-grid" aria-label="Organization KPIs">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="org-kpi-card">
              <div className="org-kpi-top">
                <span>{card.label}</span>
                <span className="org-kpi-icon" aria-hidden>
                  <Icon size={18} />
                </span>
              </div>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="org-centers-card" aria-label="Centers">
        <div className="org-centers-head">
          <h2>Centers</h2>
          <span>
            Showing {CENTER_STATS.length} of {CENTER_STATS.length} Results
          </span>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Center</th>
                <th>City</th>
                <th>Students</th>
                <th>Staff</th>
                <th>Rooms</th>
                <th>In today</th>
                <th>Pending</th>
                <th>Enquiries</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {CENTER_STATS.map((stat) => {
                const center = getCenterById(stat.centerId);
                if (!center) return null;
                return (
                  <tr key={stat.centerId}>
                    <td>
                      <button
                        type="button"
                        className="org-center-link"
                        onClick={() => {
                          setActiveScope(center.id);
                          router.push('/dashboard');
                        }}
                      >
                        {center.name}
                      </button>
                    </td>
                    <td>{center.city}</td>
                    <td>{stat.students}</td>
                    <td>{stat.staff}</td>
                    <td>{stat.rooms}</td>
                    <td>{stat.attendanceIn}</td>
                    <td>{stat.attendancePending}</td>
                    <td>{stat.enquiriesOpen}</td>
                    <td>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline org-open-btn"
                        onClick={() => {
                          setActiveScope(center.id);
                          router.push('/dashboard');
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
