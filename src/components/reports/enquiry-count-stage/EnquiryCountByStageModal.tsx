'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  createEnquiryCountStageReport,
  defaultEnquiryCountStageForm,
  type EnquiryCountStageFormValues,
} from './enquiryCountStageUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './enquiry-count-stage.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range', string>>;

export function EnquiryCountByStageModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<EnquiryCountStageFormValues>(defaultEnquiryCountStageForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultEnquiryCountStageForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Enquiry creation date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createEnquiryCountStageReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const onFormKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    if (target.closest('button, a, [role="button"]')) return;
    e.preventDefault();
    handleGenerate();
  };

  const icon = useMemo(() => <BarChart3 size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      lg
      iconClose
      open={open}
      title="Enquiry Count By Stage"
      subtitle="Generate a stage-wise summary of enquiries for the selected reporting period."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter
          generating={generating}
          onCancel={onClose}
          onGenerate={handleGenerate}
          generatingLabel="Generating Report..."
        />
      }
    >
      <div className="ecs-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading ecs-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Report...</strong>
              <span>Preparing your stage-wise enquiry summary for the selected period.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="ecs-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="ecs-card" variants={reportItemVariants}>
                <header className="ecs-card-head">
                  <div>
                    <h3>Report Configuration</h3>
                    <p>Choose the enquiry creation period for generating the stage-wise report.</p>
                  </div>
                  <span className="ecs-req-pill" aria-hidden>
                    Required
                  </span>
                </header>

                <DateRangeField
                  label="Enquiry Creation Date"
                  startAriaLabel="Enquiry creation start date"
                  endAriaLabel="Enquiry creation end date"
                  startDate={values.startDate}
                  endDate={values.endDate}
                  error={errors.range}
                  onChange={({ startDate, endDate }) => {
                    setValues({ startDate, endDate });
                    if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
                  }}
                />
              </motion.section>

              <motion.aside
                className="ecs-info"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="ecs-info-icon" aria-hidden>
                  <TrendingUp size={18} strokeWidth={2.1} />
                </span>
                <p>
                  This report summarizes the number of enquiries across different enquiry stages
                  during the selected date range.
                </p>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
