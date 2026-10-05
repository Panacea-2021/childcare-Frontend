'use client';

import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText } from 'lucide-react';
import type { ReportExportFormat } from '@/components/reports/shared/generatedReport';
import '@/components/reports/shared/report-format.css';

type Props = {
  value: ReportExportFormat;
  onChange: (next: ReportExportFormat) => void;
  /** Formats that cannot be selected (e.g. PDF when multiple students). */
  disabledFormats?: ReportExportFormat[];
  /** Optional helper shown under the control. */
  helperText?: string;
};

const OPTIONS: {
  id: ReportExportFormat;
  label: string;
  hint: string;
  icon: typeof FileText;
}[] = [
  { id: 'pdf', label: 'PDF', hint: 'Printable document', icon: FileText },
  { id: 'excel', label: 'EXCEL', hint: 'Spreadsheet export', icon: FileSpreadsheet },
];

export function ReportFormatSelector({
  value,
  onChange,
  disabledFormats = [],
  helperText,
}: Props) {
  return (
    <div className="asr-field rf-format">
      <label className="ui-label">Select Format</label>
      <div className="rf-format-grid" role="radiogroup" aria-label="Select Format">
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const disabled = disabledFormats.includes(opt.id);
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled}
              disabled={disabled}
              className={`rf-format-card${selected ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}
              onClick={() => {
                if (!disabled) onChange(opt.id);
              }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <span className={`rf-format-radio${selected ? ' is-on' : ''}`} aria-hidden />
              <span className="rf-format-icon" aria-hidden>
                <Icon size={20} />
              </span>
              <span className="rf-format-text">
                <strong>{opt.label}</strong>
                <span>{opt.hint}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      {helperText ? <p className="rf-format-helper">{helperText}</p> : null}
    </div>
  );
}
