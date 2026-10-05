'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { EnquiriesSummary } from './types';
import { Reveal } from './Reveal';

type Props = {
  data: EnquiriesSummary;
};

export function EnquiriesWidget({ data }: Props) {
  const [period, setPeriod] = useState(data.periodLabel);
  const hasData = data.chart.some((c) => c.value > 0);

  const path = useMemo(() => {
    if (!hasData) return '';
    const max = Math.max(...data.chart.map((c) => c.value), 1);
    const w = 560;
    const h = 180;
    const step = w / Math.max(data.chart.length - 1, 1);
    return data.chart
      .map((p, i) => {
        const x = i * step;
        const y = h - (p.value / max) * (h - 16) - 8;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data.chart, hasData]);

  const areaPath = hasData ? `${path} L 560 180 L 0 180 Z` : '';

  return (
    <Reveal as="article" className="dash-widget" delayMs={60}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            👥
          </span>
          Enquiries &amp; Admissions
        </h3>
        <Link href="/enquiries" className="dash-viewAll">
          View All
        </Link>
      </div>

      <div className="dash-enquiryKpis">
        <div className="dash-enquiryKpi dash-enquiryBlue">
          <strong>{data.newEnquiries}</strong>
          <span>New Enquiries</span>
        </div>
        <div className="dash-enquiryKpi dash-enquiryYellow">
          <strong>{data.totalAdmissions}</strong>
          <span>Total Admissions</span>
        </div>
        <div className="dash-enquiryKpi dash-enquiryRed">
          <strong>{data.followupOverdue}</strong>
          <span>Followup Overdue</span>
        </div>
      </div>

      <div className="dash-chartBlock">
        <div className="dash-chartHead">
          <p>Enquiries by Source to Conversion</p>
          <label className="dash-periodSelect">
            <span className="sr-only">Chart period</span>
            <select
              className="ui-select dash-periodChip"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              aria-label="Enquiry chart period"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </label>
        </div>

        <div className="dash-lineChart" role="img" aria-label="Enquiries by source to conversion chart">
          <div className="dash-yAxis" aria-hidden>
            {['1.0', '0.8', '0.6', '0.4', '0.2', '0.0'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="dash-plot">
            <div className="dash-plotGrid" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="dash-plotLine" />
              ))}
            </div>
            {hasData ? (
              <svg className="dash-svgChart" viewBox="0 0 560 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path className="dash-areaPath" d={areaPath} fill="url(#dashAreaGrad)" />
                <path className="dash-linePath" d={path} fill="none" />
              </svg>
            ) : (
              <div className="dash-chartEmptyHint">
                <span>No conversions yet — axes ready for live enquiry data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
