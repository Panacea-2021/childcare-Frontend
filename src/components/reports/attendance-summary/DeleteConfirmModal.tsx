'use client';

import { Modal } from '@/components/ui/Modal';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

type Props = {
  report: GeneratedExcelReport | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({ report, onClose, onConfirm }: Props) {
  if (!report) return null;

  return (
    <Modal
      open={!!report}
      title="Delete Report"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{report.name}</strong>?
        This action cannot be undone in this session.
      </p>
    </Modal>
  );
}
