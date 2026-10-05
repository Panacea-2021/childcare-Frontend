'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ExportFormat, ExportOptions, ExportScope } from './types';

type Props = {
  open: boolean;
  initialFormat?: ExportFormat;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
};

export function ExportDialog({ open, initialFormat = 'excel', onClose, onExport }: Props) {
  const [options, setOptions] = useState<ExportOptions>({
    scope: 'filtered',
    format: initialFormat,
    includeStaffEmail: true,
    includeInstalledDate: true,
    includeInvitationStatus: true,
  });

  useEffect(() => {
    if (!open) return;
    setOptions({
      scope: 'filtered',
      format: initialFormat,
      includeStaffEmail: true,
      includeInstalledDate: true,
      includeInvitationStatus: true,
    });
  }, [open, initialFormat]);

  const setScope = (scope: ExportScope) => setOptions((o) => ({ ...o, scope }));
  const setFormat = (format: ExportFormat) => setOptions((o) => ({ ...o, format }));

  const title =
    options.format === 'csv'
      ? 'Export CSV'
      : options.format === 'pdf'
        ? 'Export PDF'
        : 'Export Excel';

  return (
    <Modal
      open={open}
      title={title}
      subtitle="Choose scope, columns and download format."
      icon={<Download size={18} />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => onExport(options)}>
            Export
          </button>
        </>
      }
    >
      <div className="ui-field">
        <span className="ui-label">Export Scope</span>
        <div className="pai-radio-stack" role="radiogroup" aria-label="Export scope">
          {(
            [
              ['current_page', 'Export Current Page'],
              ['filtered', 'Export Filtered Data'],
              ['entire', 'Export Entire Report'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="pai-radio-row">
              <input
                type="radio"
                name="sai-export-scope"
                checked={options.scope === value}
                onChange={() => setScope(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ui-field">
        <span className="ui-label">Include Columns</span>
        <div className="pai-check-grid">
          <label>
            <input
              type="checkbox"
              checked={options.includeStaffEmail}
              onChange={(e) => setOptions((o) => ({ ...o, includeStaffEmail: e.target.checked }))}
            />
            Include Staff Email
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.includeInstalledDate}
              onChange={(e) => setOptions((o) => ({ ...o, includeInstalledDate: e.target.checked }))}
            />
            Include Installed Date
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.includeInvitationStatus}
              onChange={(e) =>
                setOptions((o) => ({ ...o, includeInvitationStatus: e.target.checked }))
              }
            />
            Include Invitation Status
          </label>
        </div>
      </div>

      <div className="ui-field">
        <span className="ui-label">Download Format</span>
        <div className="pai-segment" role="radiogroup" aria-label="Download format">
          {(['excel', 'csv', 'pdf'] as ExportFormat[]).map((fmt) => (
            <label key={fmt} className={`pai-segment-opt${options.format === fmt ? ' is-on' : ''}`}>
              <input
                type="radio"
                name="sai-export-format"
                checked={options.format === fmt}
                onChange={() => setFormat(fmt)}
              />
              <span>{fmt.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}
