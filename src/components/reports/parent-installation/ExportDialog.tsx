'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ExportFormat, ExportOptions, ExportScope } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
};

const DEFAULT: ExportOptions = {
  scope: 'filtered',
  format: 'excel',
  includeParentEmails: true,
  includeInstalledDate: true,
  includeInvitationStatus: true,
};

export function ExportDialog({ open, onClose, onExport }: Props) {
  const reduce = useReducedMotion();
  const [options, setOptions] = useState<ExportOptions>(DEFAULT);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOptions(DEFAULT);
    setExporting(false);
  }, [open]);

  const setScope = (scope: ExportScope) => setOptions((o) => ({ ...o, scope }));
  const setFormat = (format: ExportFormat) => setOptions((o) => ({ ...o, format }));

  const submit = () => {
    setExporting(true);
    window.setTimeout(() => {
      onExport(options);
      setExporting(false);
    }, 550);
  };

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
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={submit}
            disabled={exporting}
            whileHover={reduce || exporting ? undefined : { y: -1 }}
          >
            {exporting ? (
              <>
                <Loader2 size={15} className="pai-spin" style={{ marginRight: 8 }} />
                Exporting…
              </>
            ) : (
              'Export'
            )}
          </motion.button>
        </>
      }
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                  name="pai-export-scope"
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
            <label className="pai-check-anim">
              <input
                type="checkbox"
                checked={options.includeParentEmails}
                onChange={(e) => setOptions((o) => ({ ...o, includeParentEmails: e.target.checked }))}
              />
              Include Parent Emails
            </label>
            <label className="pai-check-anim">
              <input
                type="checkbox"
                checked={options.includeInstalledDate}
                onChange={(e) => setOptions((o) => ({ ...o, includeInstalledDate: e.target.checked }))}
              />
              Include Installed Date
            </label>
            <label className="pai-check-anim">
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
                  name="pai-export-format"
                  checked={options.format === fmt}
                  onChange={() => setFormat(fmt)}
                />
                <span>{fmt.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
