'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Hash, Info, Percent } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import { type DiscountDef, upsertDiscount } from '@/lib/billing-accounting/invoiceStore';
import '@/components/modules/center-management/students.css';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './create-discount-modal.css';

type Props = {
  open: boolean;
  edit?: DiscountDef | null;
  onClose: () => void;
  onCreated: (d: DiscountDef) => void;
};

const SOURCE_FIELDS = [
  { value: 'Parent is staff', label: 'Parent is staff' },
  { value: 'Sibling enrolled', label: 'Sibling enrolled' },
  { value: 'Program = Full Day', label: 'Program = Full Day' },
  { value: 'Age under 2 years', label: 'Age under 2 years' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function genItemCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export function CreateDiscountModal({ open, edit, onClose, onCreated }: Props) {
  const [name, setName] = useState('Special Offer');
  const [mode, setMode] = useState<'fixed' | 'dynamic'>('fixed');
  const [value, setValue] = useState('10.00');
  const [unit, setUnit] = useState<'percent' | 'amount'>('percent');
  const [itemCode, setItemCode] = useState('');
  const [sourceField, setSourceField] = useState('');
  const [kind, setKind] = useState<'standard' | 'conditional'>('standard');
  const [condMode, setCondMode] = useState<'applications' | 'date'>('applications');
  const [valueOfX, setValueOfX] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (edit) {
      setName(edit.name);
      setMode(edit.mode ?? 'fixed');
      setValue(String(edit.value));
      setUnit(edit.unit);
      setItemCode(edit.itemCode || genItemCode());
      setSourceField(edit.sourceField || '');
      setKind(edit.kind);
      setCondMode(edit.conditionalMode ?? 'applications');
      setValueOfX(edit.valueOfX || '');
    } else {
      setName('Special Offer');
      setMode('fixed');
      setValue('10.00');
      setUnit('percent');
      setItemCode(genItemCode());
      setSourceField('');
      setKind('standard');
      setCondMode('applications');
      setValueOfX('');
    }
    setError('');
  }, [open, edit]);

  const canSubmit = useMemo(() => {
    if (!name.trim() || !itemCode.trim()) return false;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return false;
    if (mode === 'dynamic' && !sourceField.trim()) return false;
    if (kind === 'conditional' && !valueOfX.trim()) return false;
    return true;
  }, [name, itemCode, value, mode, sourceField, kind, valueOfX]);

  const handleClose = () => onClose();

  const submit = () => {
    if (!canSubmit) {
      setError('Please fill all required fields.');
      return;
    }
    const row: DiscountDef = {
      id: edit?.id || `disc-${Date.now()}`,
      name: name.trim(),
      value: Number(value),
      unit,
      kind,
      mode,
      itemCode: itemCode.trim().toUpperCase(),
      sourceField: mode === 'dynamic' ? sourceField.trim() : undefined,
      redemptions: edit?.redemptions ?? 0,
      conditionalMode: kind === 'conditional' ? condMode : undefined,
      valueOfX: kind === 'conditional' ? valueOfX.trim() : undefined,
    };
    upsertDiscount(row);
    onCreated(row);
    handleClose();
  };

  return (
    <Modal
      open={open}
      title={edit ? 'Edit Discount' : 'Create Discount'}
      wide
      onClose={handleClose}
      icon={<Percent size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={submit}
            disabled={!canSubmit}
          >
            OK
          </button>
        </>
      }
    >
      <motion.div
        className="cdm-root"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease }}
      >
        <div className="ui-field">
          <label className="ui-label">
            Name <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter discount name"
            autoFocus
          />
        </div>

        <div className="ui-field">
          <label className="ui-label">
            Discount Mode <span className="req">*</span>
          </label>
          <div className="cdm-seg" role="group" aria-label="Discount mode">
            <motion.span
              className="cdm-seg-pill"
              layout
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              style={{ left: mode === 'fixed' ? 4 : 'calc(50% + 2px)' }}
              aria-hidden
            />
            <button
              type="button"
              className={mode === 'fixed' ? 'is-active' : ''}
              onClick={() => setMode('fixed')}
            >
              Fixed
            </button>
            <button
              type="button"
              className={mode === 'dynamic' ? 'is-active' : ''}
              onClick={() => setMode('dynamic')}
            >
              Dynamic
            </button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={mode}
              className="cdm-hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
            >
              {mode === 'fixed'
                ? 'Configure an exact value or percentage'
                : 'Discount value changes automatically based on student profile fields'}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'fixed' ? (
            <motion.div
              key="fixed-fields"
              className="cdm-row-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="ui-field">
                <label className="ui-label">
                  {unit === 'percent' ? 'Percentage' : 'Amount'} <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Please enter discount value"
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  Type <span className="req">*</span>
                </label>
                <div className="cdm-seg cdm-seg-compact" role="group" aria-label="Value type">
                  <motion.span
                    className="cdm-seg-pill"
                    layout
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    style={{ left: unit === 'percent' ? 4 : 'calc(50% + 2px)' }}
                    aria-hidden
                  />
                  <button
                    type="button"
                    className={unit === 'percent' ? 'is-active' : ''}
                    onClick={() => setUnit('percent')}
                    aria-label="Percentage"
                  >
                    <Percent size={15} />
                  </button>
                  <button
                    type="button"
                    className={unit === 'amount' ? 'is-active' : ''}
                    onClick={() => setUnit('amount')}
                    aria-label="Flat amount"
                  >
                    <Hash size={15} />
                  </button>
                </div>
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  Item Code <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                  placeholder="Please enter item code"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dynamic-fields"
              className="cdm-dynamic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="ui-field">
                <label className="ui-label">
                  Source Field for Discount Value <span className="req">*</span>
                </label>
                <AppSelect
                  value={sourceField}
                  onChange={setSourceField}
                  placeholder="Source Field for Discount Value"
                  options={SOURCE_FIELDS}
                />
              </div>
              <div className="cdm-row-3">
                <div className="ui-field">
                  <label className="ui-label">
                    Default value <span className="req">*</span>
                  </label>
                  <input
                    className="ui-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Please enter discount value"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">
                    Type <span className="req">*</span>
                  </label>
                  <div className="cdm-seg cdm-seg-compact" role="group" aria-label="Value type">
                    <motion.span
                      className="cdm-seg-pill"
                      layout
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      style={{ left: unit === 'percent' ? 4 : 'calc(50% + 2px)' }}
                      aria-hidden
                    />
                    <button
                      type="button"
                      className={unit === 'percent' ? 'is-active' : ''}
                      onClick={() => setUnit('percent')}
                    >
                      <Percent size={15} />
                    </button>
                    <button
                      type="button"
                      className={unit === 'amount' ? 'is-active' : ''}
                      onClick={() => setUnit('amount')}
                    >
                      <Hash size={15} />
                    </button>
                  </div>
                </div>
                <div className="ui-field">
                  <label className="ui-label">
                    Item Code <span className="req">*</span>
                  </label>
                  <input
                    className="ui-input"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                    placeholder="Please enter item code"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="ui-field">
          <label className="ui-label">
            Discount Type <span className="req">*</span>
          </label>
          <div className="cdm-radios" role="radiogroup" aria-label="Discount type">
            <label className={`cdm-radio${kind === 'standard' ? ' is-on' : ''}`}>
              <input
                type="radio"
                name="discount-kind"
                checked={kind === 'standard'}
                onChange={() => setKind('standard')}
              />
              <span className="cdm-radio-dot" aria-hidden />
              <span>Standard</span>
            </label>
            <label className={`cdm-radio${kind === 'conditional' ? ' is-on' : ''}`}>
              <input
                type="radio"
                name="discount-kind"
                checked={kind === 'conditional'}
                onChange={() => setKind('conditional')}
              />
              <span className="cdm-radio-dot" aria-hidden />
              <span>Conditional</span>
            </label>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {kind === 'conditional' ? (
            <motion.div
              key="conditional-block"
              className="cdm-conditional"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease }}
            >
              <div className="cdm-conditional-inner">
                <div className="cdm-radios is-stacked" role="radiogroup" aria-label="Expiry rule">
                  <label className={`cdm-radio${condMode === 'applications' ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="cond-mode"
                      checked={condMode === 'applications'}
                      onChange={() => {
                        setCondMode('applications');
                        setValueOfX('');
                      }}
                    />
                    <span className="cdm-radio-dot" aria-hidden />
                    <span>Discount expires after &apos;X&apos; fixed applications</span>
                  </label>
                  <label className={`cdm-radio${condMode === 'date' ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="cond-mode"
                      checked={condMode === 'date'}
                      onChange={() => {
                        setCondMode('date');
                        setValueOfX('');
                      }}
                    />
                    <span className="cdm-radio-dot" aria-hidden />
                    <span>Discount expires after a specific date &apos;X&apos;</span>
                  </label>
                </div>

                <div className="ui-field" style={{ marginTop: 12 }}>
                  <label className="ui-label">
                    Value of X <span className="req">*</span>
                  </label>
                  <AnimatePresence mode="wait" initial={false}>
                    {condMode === 'date' ? (
                      <motion.div
                        key="date"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="cdm-date-wrap"
                      >
                        <DayDatePicker
                          value={valueOfX || new Date().toISOString().slice(0, 10)}
                          onChange={setValueOfX}
                        />
                        <CalendarDays size={16} className="cdm-date-ico" aria-hidden />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="apps"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                      >
                        <input
                          className="ui-input"
                          type="number"
                          min={1}
                          placeholder="Enter Number"
                          value={valueOfX}
                          onChange={(e) => setValueOfX(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="cdm-info">
                  <span className="cdm-info-ico" aria-hidden>
                    <Info size={14} />
                  </span>
                  <p>
                    Conditional discounts with time or usage limits, if part of a fee plan, will only
                    be applied if it&apos;s still valid at the time of invoicing.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p className="ui-error-text" role="alert">
            {error}
          </p>
        ) : null}
      </motion.div>
    </Modal>
  );
}

/** Create catalog item modal */
export function CreateItemModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (item: { id: string; name: string; description: string; unitPrice: number }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);

  const close = () => {
    setName('');
    setDescription('');
    setShowDescription(false);
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreated({
      id: `ci-${Date.now()}`,
      name: name.trim(),
      description: showDescription ? description.trim() : '',
      unitPrice: 0,
    });
    close();
  };

  return (
    <Modal
      open={open}
      title="Create new item"
      onClose={close}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={close}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={!name.trim()}>
            OK
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label">Item Name</label>
        <input
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fee(M0PK)"
        />
      </div>
      {showDescription ? (
        <div className="ui-field">
          <label className="ui-label">Description</label>
          <textarea
            className="ui-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for parents"
            rows={4}
          />
        </div>
      ) : (
        <button type="button" className="bi-link-btn" onClick={() => setShowDescription(true)}>
          + Add description
        </button>
      )}
    </Modal>
  );
}
