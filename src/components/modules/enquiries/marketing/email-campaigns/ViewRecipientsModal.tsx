'use client';

import { Modal } from '@/components/ui/Modal';
import { MOCK_RECIPIENT_PREVIEW } from './mockData';

type Props = {
  open: boolean;
  count: number;
  onClose: () => void;
};

export function ViewRecipientsModal({ open, count, onClose }: Props) {
  return (
    <Modal
      open={open}
      title="Matching Recipients"
      wide
      onClose={onClose}
      footer={
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Close
        </button>
      }
    >
      <p className="ec-muted" style={{ marginTop: 0, marginBottom: '0.85rem' }}>
        Showing a sample of {Math.min(count, MOCK_RECIPIENT_PREVIEW.length)} contacts (
        {count.toLocaleString()} total). Child details are not shown.
      </p>
      <div className="ec-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Parent / Contact</th>
              <th>Email</th>
              <th>Relation</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECIPIENT_PREVIEW.slice(0, Math.min(count, MOCK_RECIPIENT_PREVIEW.length)).map(
              (r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.relation}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
