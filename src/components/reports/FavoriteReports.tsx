'use client';

import { memo } from 'react';
import type { ReportDefinition } from './data/reportCatalog';
import { REPORT_CATEGORIES } from './data/reportCatalog';
import { SectionHeader } from './SectionHeader';
import { ReportCard } from './ReportCard';
import { EmptyFavorites } from './EmptyFavorites';
import { Star } from 'lucide-react';

type Props = {
  reports: ReportDefinition[];
  isFavorite: (id: string) => boolean;
  generatingId?: string | null;
  onToggleFavorite: (id: string) => void;
  onGenerate: (report: ReportDefinition) => void;
};

function FavoriteReportsBase({
  reports,
  isFavorite,
  generatingId,
  onToggleFavorite,
  onGenerate,
}: Props) {
  const meta = REPORT_CATEGORIES.find((c) => c.id === 'favorites')!;

  return (
    <section className="rp-section" id="rp-cat-favorites">
      <SectionHeader
        title={meta.label}
        description={meta.description}
        count={reports.length}
        icon={Star}
      />
      {!reports.length ? (
        <EmptyFavorites />
      ) : (
        <div className="rp-cards">
          {reports.map((report, i) => (
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
      )}
    </section>
  );
}

export const FavoriteReports = memo(FavoriteReportsBase);
