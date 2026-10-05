'use client';

import { useEffect, useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  generateItemCode,
  type FeeComponent,
  type FeeComponentCategory,
  upsertFeeComponent,
} from '@/lib/billing-accounting/feeComponentsStore';

type Props = {
  open: boolean;
  edit?: FeeComponent | null;
  onClose: () => void;
  onSaved: (row: FeeComponent) => void;
};

const CATEGORY_OPTIONS = [
  { value: 'One Time', label: 'One Time' },
  { value: 'Recurring', label: 'Recurring' },
];

export function FeeComponentModal({ open, edit, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [category, setCategory] = useState<FeeComponentCategory | ''>('');
  const [itemCode, setItemCode] = useState('');
  const [refundable, setRefundable] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (edit) {
      setName(edit.name);
      setDescription(edit.description || '');
      setUnitPrice(String(edit.unitPrice));
      setCategory(edit.category);
      setItemCode(edit.itemCode);
      setRefundable(edit.refundable);
    } else {
      setName('');
      setDescription('');
      setUnitPrice('');
      setCategory('');
      setItemCode(generateItemCode());
      setRefundable(false);
    }
    setError('');
  }, [open, edit]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!category) return false;
    if (!itemCode.trim()) return false;
    const n = Number(unitPrice);
    return Number.isFinite(n) && n >= 0;
  }, [name, category, itemCode, unitPrice]);

  const handleClose = () => {
    onClose();
  };

  const submit = () => {
    if (!canSubmit || !category) {
      setError('Please fill all required fields.');
      return;
    }
    const row = upsertFeeComponent({
      id: edit?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      unitPrice: Number(unitPrice),
      category,
      itemCode: itemCode.trim().toUpperCase(),
      refundable,
      plansUsed: edit?.plansUsed,
    });
    onSaved(row);
    handleClose();
  };

  return (
    <Modal
      open={open}
      title={edit ? 'Edit Fee Component' : 'Create Fee Component'}
      onClose={handleClose}
      icon={<Layers size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={handleClose}>
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
      <div className="fp-modal-stack">
        <div className="ui-field">
          <label className="ui-label">
            Name <span className="req">*</span>
          </label>
          <input
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter description"
            autoFocus
          />
        </div>

        <div className="ui-field">
          <label className="ui-label">Description</label>
          <textarea
            className="ui-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please enter description"
          />
        </div>

        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Unit Price <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              type="number"
              min={0}
              step="1"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Please enter value"
            />
          </div>

          <div className="ui-field">
            <label className="ui-label">
              Category <span className="req">*</span>
            </label>
            <AppSelect
              value={category}
              onChange={(v) => setCategory(v as FeeComponentCategory)}
              placeholder="Select Category"
              options={CATEGORY_OPTIONS}
            />
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

        <label className="fp-refund-check">
          <input
            type="checkbox"
            checked={refundable}
            onChange={(e) => setRefundable(e.target.checked)}
          />
          Refundable
        </label>

        {error ? <p className="ui-error-text">{error}</p> : null}
      </div>
    </Modal>
  );
}
