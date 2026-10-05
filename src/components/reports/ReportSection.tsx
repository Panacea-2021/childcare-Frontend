'use client';

import { memo } from 'react';
import type { ReportCategory, ReportDefinition } from './data/reportCatalog';
import { groupReportsBySection } from './data/reportCatalog';
import { REPORT_ICONS } from './reportIcons';
import { SectionHeader } from './SectionHeader';
import { ReportCard } from './ReportCard';

type Props = {
  category: ReportCategory;
  reports: ReportDefinition[];
  isFavorite: (id: string) => boolean;
  generatingId?: string | null;
  onToggleFavorite: (id: string) => void;
  onGenerate: (report: ReportDefinition) => void;
};

function ReportSectionBase({
  category,
  reports,
  isFavorite,
  generatingId,
  onToggleFavorite,
  onGenerate,
}: Props) {
  if (!reports.length) return null;

  const Icon = REPORT_ICONS[category.icon];
  const sections = groupReportsBySection(reports);

  return (
    <section className="rp-section" id={`rp-cat-${category.id}`}>
      <SectionHeader
        title={category.label}
        description={category.description}
        count={reports.length}
        icon={Icon}
      />

      {sections.map((section) => (
        <div key={section.title ?? 'default'}>
          {section.title ? (
            <h3 className="rp-subsection-title">
              {section.title}
              <span>{section.reports.length}</span>
            </h3>
          ) : null}
          <div className="rp-cards" style={{ marginTop: section.title ? 12 : 0 }}>
            {section.reports.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                favorite={isFavorite(report.id)}
                generating={generatingId === report.id}
                onToggleFavorite={onToggleFavorite}
                onGenerate={onGenerate}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export const ReportSection = memo(ReportSectionBase);
