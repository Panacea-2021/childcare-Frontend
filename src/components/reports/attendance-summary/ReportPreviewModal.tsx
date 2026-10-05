'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';

type Props = {
  report: GeneratedExcelReport | null;
  onClose: () => void;
};

const PAGE_SIZE = 10;

export function ReportPreviewModal({ report, onClose }: Props) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!report) return [] as Record<string, string>[];
    const query = q.trim().toLowerCase();
    if (!query) return report.rows;
    return report.rows.filter((row) =>
      Object.values(row).some((cell) => cell.toLowerCase().includes(query)),
    );
  }, [report, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (!report) return null;

  const isPdf = report.format === 'pdf' || /\.pdf$/i.test(report.name);
  const downloadLabel = isPdf ? 'Download PDF' : 'Download Excel';

  return (
    <Modal
      wide
      open={!!report}
      title={`Preview · ${report.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => downloadGeneratedReport(report)}
          >
            {downloadLabel}
          </button>
        </>
      }
    >
      <div className="asr-preview-tools">
        <label className="asr-search" style={{ flex: 1 }}>
          <Search size={16} aria-hidden />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search rows…"
            aria-label="Search preview rows"
          />
        </label>
        <span className="rp-badge">{filtered.length} records</span>
        {isPdf ? <span className="rp-badge">PDF preview</span> : null}
      </div>

      <div className="asr-preview-scroll" role="region" aria-label="Report preview table">
        <table className="ui-table">
          <thead>
            <tr>
              {report.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={`${safePage}-${i}`}>
                {report.columns.map((col) => {
                  const cell = row[col] ?? '—';
                  const isImageCol = col === 'Uploaded Image';
                  const showThumb =
                    isImageCol && /^https?:\/\//i.test(cell);

                  return (
                    <td key={col}>
                      {showThumb ? (
                        <img
                          src={cell}
                          alt="Uploaded note attachment"
                          width={40}
                          height={40}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid var(--border)',
                            background: 'var(--color-accent-soft)',
                            display: 'block',
                          }}
                        />
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!slice.length ? (
              <tr>
                <td colSpan={report.columns.length || 1} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No rows match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="asr-pager" style={{ marginTop: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Page {safePage + 1} of {pageCount}
        </span>
        <div className="asr-pager-btns">
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </Modal>
  );
}
