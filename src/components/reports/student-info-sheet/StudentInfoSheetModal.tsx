'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FilterByRadios } from '@/components/reports/attendance-summary/FilterByRadios';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StudentCombobox } from '@/components/reports/attendance-summary/StudentCombobox';
import { ReportFormatSelector } from '@/components/reports/shared/ReportFormatSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import { InfoSheetFieldsSelector } from './InfoSheetFieldsSelector';
import {
  createStudentInfoSheetReport,
  defaultStudentInfoSheetForm,
  type StudentInfoSheetFormValues,
} from './studentInfoSheetUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'student' | 'fields', string>>;

export function StudentInfoSheetModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StudentInfoSheetFormValues>(defaultStudentInfoSheetForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentInfoSheetForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (values.filterBy === 'student' && !values.studentId) {
      next.student = 'Please select a student.';
    }
    if (!values.selectedFields.length) {
      next.fields = 'Select at least one field to display.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStudentInfoSheetReport(values);
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
      title="Student Information Sheet"
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
          <strong>Generating Student Information Sheet...</strong>
          <span>
            Preparing your {values.format === 'pdf' ? 'PDF' : 'Excel'} export with the selected fields.
          </span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <FilterByRadios
            value={values.filterBy}
            onChange={(filterBy) =>
              setValues((v) => ({
                ...v,
                filterBy,
                rooms: filterBy === 'classroom' ? v.rooms : [],
                studentId: filterBy === 'student' ? v.studentId : null,
              }))
            }
          />

          {values.filterBy === 'classroom' ? (
            <RoomMultiSelect
              value={values.rooms}
              placeholder="Select classroom"
              onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
            />
          ) : (
            <StudentCombobox
              value={values.studentId}
              error={errors.student}
              onChange={(studentId) =>
                setValues((v) => {
                  if (studentId) setErrors((e) => ({ ...e, student: undefined }));
                  return { ...v, studentId };
                })
              }
            />
          )}

          <ReportFormatSelector
            value={values.format}
            onChange={(format) => setValues((v) => ({ ...v, format }))}
          />

          <InfoSheetFieldsSelector
            selected={values.selectedFields}
            error={errors.fields}
            onChange={(selectedFields) => {
              setValues((v) => ({ ...v, selectedFields }));
              if (selectedFields.length) setErrors((e) => ({ ...e, fields: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}
