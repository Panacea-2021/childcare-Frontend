'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Percent } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  formatTaxRate,
  generateTaxItemCode,
  type TaxRate,
  upsertTaxRate,
} from '@/lib/billing-accounting/taxRatesStore';
import './tax-rate-modal.css';

type Props = {
  open: boolean;
  edit?: TaxRate | null;
  onClose: () => void;
  onSaved: (row: TaxRate) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const fieldMotion = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3, ease },
});

export function TaxRateModal({ open, edit, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (edit) {
      setName(edit.name);
      setRate(String(edit.rate));
      setItemCode(edit.itemCode);
    } else {
      setName('');
      setRate('');
      setItemCode(generateTaxItemCode());
    }
    setError('');
  }, [open, edit]);

  const rateNum = Number(rate);
  const rateValid = Number.isFinite(rateNum) && rateNum >= 0 && rateNum <= 100;

  const canSubmit = useMemo(() => {
    return Boolean(name.trim() && itemCode.trim() && rateValid);
  }, [name, itemCode, rateValid]);

  const previewName = name.trim() || 'Tax name';
  const previewRate = rateValid ? formatTaxRate(rateNum) : '— %';

  const submit = () => {
    if (!canSubmit) {
      setError('Please fill all required fields with a valid tax rate (0–100).');
      return;
    }
    const row = upsertTaxRate({
      id: edit?.id,
      name: name.trim(),
      rate: rateNum,
      itemCode: itemCode.trim(),
    });
    onSaved(row);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={edit ? 'Edit Tax Rate' : 'Create Tax Rate'}
      onClose={onClose}
      icon={<Percent size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!canSubmit}
            onClick={submit}
          >
            OK
          </button>
        </>
      }
    >
      <motion.div
        className="trm-root"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canSubmit) {
            e.preventDefault();
            submit();
          }
        }}
      >
        <motion.div className="trm-preview" {...fieldMotion(0.02)}>
          <div className="trm-preview-meta">
            <span>Preview</span>
            <strong>{previewName}</strong>
          </div>
          <div className="trm-preview-rate" aria-live="polite">
            {previewRate}
          </div>
        </motion.div>

        <motion.div className="ui-field" {...fieldMotion(0.06)}>
          <label className="ui-label">
            Name <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter tax name"
            autoFocus
          />
        </motion.div>

        <motion.div className="ui-field" {...fieldMotion(0.1)}>
          <label className="ui-label">
            Tax rate (%) <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Please enter tax rate"
          />
          <p className="trm-hint">Enter a percentage between 0 and 100 (e.g. 18 for GST).</p>
        </motion.div>

        <motion.div className="ui-field" {...fieldMotion(0.14)}>
          <label className="ui-label">
            Item Code <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            placeholder="Please enter item code"
          />
        </motion.div>

        {error ? (
          <motion.p
            className="ui-error-text"
            role="alert"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        ) : null}
      </motion.div>
    </Modal>
  );
}
