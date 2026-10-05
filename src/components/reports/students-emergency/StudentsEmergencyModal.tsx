'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportFormatSelector } from '@/components/reports/shared/ReportFormatSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  DEFAULT_EMERGENCY_COLUMNS,
  EMERGENCY_COLUMNS,
  createStudentsEmergencyReport,
  defaultStudentsEmergencyForm,
  type EmergencyColumnId,
  type StudentsEmergencyFormValues,
} from './studentsEmergencyUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'columns', string>>;

export function StudentsEmergencyModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StudentsEmergencyFormValues>(defaultStudentsEmergencyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentsEmergencyForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (values.columnMode === 'custom' && !values.selectedColumns.length) {
      next.columns = 'Select at least one column, or switch to All Columns.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStudentsEmergencyReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      open={open}
      title="Students Emergency Contacts"
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={generating}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 size={16} className="asr-spin" style={{ marginRight: 8 }} />
                Generating…
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </>
      }
    >
      {generating ? (
        <div className="asr-loading">
          <Loader2 size={32} className="asr-spin" />
          <strong>Generating Students Emergency Contacts Report...</strong>
          <span>
            Preparing your {values.format === 'pdf' ? 'PDF' : 'Excel'} export with the selected rooms and columns.
          </span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={EMERGENCY_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={10}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as StudentsEmergencyFormValues['columnMode'],
                selectedColumns:
                  columnMode === 'all'
                    ? []
                    : v.selectedColumns.length
                      ? v.selectedColumns
                      : [...DEFAULT_EMERGENCY_COLUMNS],
              }))
            }
            onSelectedChange={(selectedColumns) =>
              setValues((v) => ({ ...v, selectedColumns: selectedColumns as EmergencyColumnId[] }))
            }
          />

          <ReportFormatSelector
            value={values.format}
            onChange={(format) => setValues((v) => ({ ...v, format }))}
          />
        </motion.div>
      )}
    </Modal>
  );
}
