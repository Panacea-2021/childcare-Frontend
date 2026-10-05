'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  createEnquirySourceReport,
  defaultEnquirySourceForm,
  type EnquirySourceFormValues,
} from './enquirySourceUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './enquiry-source.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range', string>>;

export function EnquirySourceReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<EnquirySourceFormValues>(defaultEnquirySourceForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultEnquirySourceForm());
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
      const report = createEnquirySourceReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <BarChart3 size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      wide
      iconClose
      open={open}
      title="Enquiry Source Report"
      subtitle="Generate a report showing enquiry sources within a selected date range."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter generating={generating} onCancel={onClose} onGenerate={handleGenerate} />
      }
    >
      <div className="esr-report">
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading esr-loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <Loader2 size={32} className="asr-spin" />
              <strong>Generating Enquiry Source Report...</strong>
              <span>Summarizing enquiries by source for the selected period.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="esr-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="enq-card esr-period-card" variants={reportItemVariants}>
                <div className="enq-card-head">
                  <div>
                    <h3>Report Period</h3>
                    <p>Select the enquiry creation date range for this report.</p>
                  </div>
                  <span className="esr-req-pill" aria-hidden>
                    Required
                  </span>
                </div>

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
                className="esr-info-banner"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="esr-info-icon" aria-hidden>
                  <Info size={18} />
                </span>
                <p>
                  This report summarizes enquiries grouped by their source during the selected
                  period.
                </p>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
