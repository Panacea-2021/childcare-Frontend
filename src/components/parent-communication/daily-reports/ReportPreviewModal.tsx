'use client';

import { Printer, Download } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ChecklistItemDef, RoomDailyReport } from '@/types/dailyReport';
import { formatDateLabel, getEntry, roomChecklistColumns, statusLabel } from './utils';

type Props = {
  open: boolean;
  report: RoomDailyReport | null;
  checklist: ChecklistItemDef[];
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
};

export function ReportPreviewModal({
  open,
  report,
  checklist,
  onClose,
  onDownload,
  onPrint,
}: Props) {
  const columns = report ? roomChecklistColumns(checklist, report) : [];

  return (
    <Modal
      open={open && Boolean(report)}
      title="Report Preview"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onPrint}>
            <Printer size={16} />
            Print Report
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onDownload}>
            <Download size={16} />
            Download PDF
          </button>
        </>
      }
    >
      {report ? (
        <div className="dr-print-sheet" id="dr-print-root">
          <div className="dr-print-header">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="dr-print-logo">ABC</div>
              <div>
                <strong style={{ fontSize: '1.15rem' }}>ABC Preschool</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Classroom Daily Report
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
              <div>{formatDateLabel(report.date)}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{statusLabel(report.status)}</div>
            </div>
          </div>

          <div className="ui-grid-2" style={{ marginBottom: 8 }}>
            <div>
              <div className="dr-student-meta">Room</div>
              <strong>{report.room}</strong>
            </div>
            <div>
              <div className="dr-student-meta">Attendance</div>
              <strong>
                {report.presentCount}/{report.studentCount}
              </strong>
            </div>
          </div>

          <table className="dr-print-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Status</th>
                <th>Time</th>
                <th>By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => {
                const entry = getEntry(report, col.id);
                return (
                  <tr key={col.id}>
                    <td>{col.name}</td>
                    <td>{entry?.completed ? 'Completed' : 'Pending'}</td>
                    <td>{entry?.completedAt || '—'}</td>
                    <td>{entry?.completedBy || '—'}</td>
                    <td>{entry?.remarks || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {report.overallNotes ? (
            <div>
              <strong>Remarks</strong>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
                {report.overallNotes}
              </p>
            </div>
          ) : null}

          <div className="dr-print-footer">
            <div>
              <div className="dr-sign-line">Teacher Signature</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              ABC Preschool · Caring every day
              <br />
              contact@abcpreschool.example
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
