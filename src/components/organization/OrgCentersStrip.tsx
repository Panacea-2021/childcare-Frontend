'use client';

import { Building2 } from 'lucide-react';
import { CENTER_STATS, getCenterById } from '@/lib/organization/centers';
import { useCenterScope } from './CenterScopeContext';
import './org-dashboard.css';

/** Compact center jump strip shown above the full All Centers dashboard. */
export function OrgCentersStrip() {
  const { setActiveScope } = useCenterScope();

  return (
    <section className="org-strip" aria-label="Centers quick open">
      <div className="org-strip-head">
        <h2>Centers</h2>
        <span>Open a center to work in its day-to-day modules</span>
      </div>
      <div className="org-strip-grid">
        {CENTER_STATS.map((stat) => {
          const center = getCenterById(stat.centerId);
          if (!center) return null;
          return (
            <button
              key={stat.centerId}
              type="button"
              className="org-strip-card"
              onClick={() => setActiveScope(center.id)}
            >
              <span className="org-strip-icon" aria-hidden>
                <Building2 size={16} />
              </span>
              <span className="org-strip-copy">
                <strong>{center.shortName}</strong>
                <small>
                  {stat.students} students · {stat.staff} staff · {center.city}
                </small>
              </span>
              <span className="org-strip-open">Open</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
