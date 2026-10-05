'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StatusMultiSelect } from '@/components/reports/attendance-summary/StatusMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  ALL_IMMUNIZATIONS_VALUE,
  IMMUNIZATIONS,
  createImmunizationReport,
  defaultImmunizationForm,
  type ImmunizationFormValues,
} from './immunizationUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './immunization.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'immunizations' | 'statuses' | 'days', string>>;

export function ImmunizationModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<ImmunizationFormValues>(defaultImmunizationForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultImmunizationForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const immunizationOptions = useMemo(
    () => [
      { value: ALL_IMMUNIZATIONS_VALUE, label: 'All Immunizations' },
      ...IMMUNIZATIONS.map((name) => ({ value: name, label: name })),
    ],
    [],
  );

  const onImmunizationsChange = (next: string[]) => {
    let selected = next;
    const addedAll = next.includes(ALL_IMMUNIZATIONS_VALUE) && !values.immunizations.includes(ALL_IMMUNIZATIONS_VALUE);
    const hadAll = values.immunizations.includes(ALL_IMMUNIZATIONS_VALUE);
    const addedOther = next.some((v) => v !== ALL_IMMUNIZATIONS_VALUE && !values.immunizations.includes(v));

    if (addedAll) {
      selected = [ALL_IMMUNIZATIONS_VALUE];
    } else if (hadAll && addedOther) {
      selected = next.filter((v) => v !== ALL_IMMUNIZATIONS_VALUE);
    } else if (next.includes(ALL_IMMUNIZATIONS_VALUE) && next.length > 1) {
      selected = next.filter((v) => v !== ALL_IMMUNIZATIONS_VALUE);
    }

    setValues((v) => ({ ...v, immunizations: selected }));
    if (selected.length) setErrors((e) => ({ ...e, immunizations: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!values.immunizations.length) {
      next.immunizations = 'Select at least one immunization.';
    }
    if (!values.statuses.length) {
      next.statuses = 'Select at least one student status.';
    }
    if (values.pastDueEnabled) {
      const n = Number(values.dueWithinDays);
      if (!values.dueWithinDays.trim() || !Number.isInteger(n) || n <= 0) {
        next.days = 'Enter a positive whole number of days.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createImmunizationReport(values);
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
      title="Immunization Report"
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
          <strong>Generating Immunization Report...</strong>
          <span>Preparing your Excel export with the selected filters.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <AsrDropdown
            multiple
            label={
              <>
                Immunizations <span className="asr-req">*</span>
              </>
            }
            ariaLabel="Immunizations"
            placeholder="Select immunizations"
            searchPlaceholder="Search immunizations…"
            value={values.immunizations}
            error={errors.immunizations}
            onChange={onImmunizationsChange}
            options={immunizationOptions}
          />

          <div className="asr-field imm-due">
            <label className="ui-label">Past Due / Due By</label>
            <label className={`imm-due-check${values.pastDueEnabled ? ' is-on' : ''}`}>
              <span className={`asr-dd-checkbox${values.pastDueEnabled ? ' is-on' : ''}`} aria-hidden>
                {values.pastDueEnabled ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <input
                type="checkbox"
                checked={values.pastDueEnabled}
                onChange={(e) => {
                  const pastDueEnabled = e.target.checked;
                  setValues((v) => ({
                    ...v,
                    pastDueEnabled,
                    dueWithinDays: pastDueEnabled ? v.dueWithinDays || '30' : '',
                  }));
                  if (!pastDueEnabled) setErrors((err) => ({ ...err, days: undefined }));
                }}
              />
              Past due / due by
            </label>
            <div className="imm-due-row">
              <input
                className="ui-input"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="Number of days"
                disabled={!values.pastDueEnabled}
                value={values.dueWithinDays}
                onChange={(e) => {
                  setValues((v) => ({ ...v, dueWithinDays: e.target.value }));
                  if (e.target.value) setErrors((err) => ({ ...err, days: undefined }));
                }}
                aria-label="Number of days"
              />
              <span className="imm-due-suffix">days</span>
            </div>
            {errors.days ? <p className="asr-error">{errors.days}</p> : null}
          </div>

          <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />

          <StatusMultiSelect
            value={values.statuses}
            error={errors.statuses}
            onChange={(statuses) => {
              setValues((v) => ({ ...v, statuses }));
              if (statuses.length) setErrors((e) => ({ ...e, statuses: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}
