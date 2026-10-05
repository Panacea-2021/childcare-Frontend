'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  PROGRAMS_REPORT_LAST_GENERATED,
  createProgramsReport,
  defaultProgramsReportForm,
  type ProgramsReportFormValues,
} from './programsReportUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

export function ProgramsReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<ProgramsReportFormValues>(defaultProgramsReportForm);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultProgramsReportForm());
    setGenerating(false);
  }, [open]);

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createProgramsReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const report = createProgramsReport(
      defaultProgramsReportForm(),
      PROGRAMS_REPORT_LAST_GENERATED.by,
    );
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <ListOrdered size={18} />, []);

  return (
    <Modal
      open={open}
      title="Programs Report"
      subtitle="Configure your report before generating."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter
          generating={generating}
          onCancel={onClose}
          onGenerate={handleGenerate}
        />
      }
    >
      {generating ? (
        <div className="asr-loading" role="status" aria-live="polite">
          <Loader2 size={32} className="asr-spin" aria-hidden />
          <strong>Generating Programs Report...</strong>
          <span>Preparing your CSV export for the selected classrooms.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={reportItemVariants}>
            <LastGeneratedCard
              onDownload={handleLastDownload}
              dateLabel={PROGRAMS_REPORT_LAST_GENERATED.dateLabel}
              timeLabel={PROGRAMS_REPORT_LAST_GENERATED.timeLabel}
              by={PROGRAMS_REPORT_LAST_GENERATED.by}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <RoomMultiSelect
              value={values.rooms}
              placeholder="Leave blank to select all rooms"
              onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}
