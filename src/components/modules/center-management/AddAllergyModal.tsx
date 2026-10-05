'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { AllergyRecord, AllergySeverity } from '@/lib/center-management/types';
import { ALLERGY_CATEGORIES, ALLERGY_SEVERITIES } from '@/lib/center-management/studentsStore';
import { AppSelect } from './ui';

type Props = {
  open: boolean;
  initial?: AllergyRecord | null;
  onClose: () => void;
  onSave: (allergy: Omit<AllergyRecord, 'id'> & { id?: string }) => void;
};

export function AddAllergyModal({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(ALLERGY_CATEGORIES[0]);
  const [severity, setSeverity] = useState<AllergySeverity>('Mild');
  const [symptoms, setSymptoms] = useState('');
  const [parentNotes, setParentNotes] = useState('');
  const [emergencyPlan, setEmergencyPlan] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setCategory(initial?.category ?? ALLERGY_CATEGORIES[0]);
    setSeverity(initial?.severity ?? 'Mild');
    setSymptoms(initial?.symptoms ?? '');
    setParentNotes(initial?.parentNotes ?? '');
    setEmergencyPlan(initial?.emergencyPlan ?? '');
  }, [open, initial]);

  return (
    <Modal
      open={open}
      title={initial ? 'Edit Allergy' : 'Add New Allergy'}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              if (!name.trim()) return;
              onSave({
                id: initial?.id,
                name: name.trim(),
                category,
                severity,
                symptoms: symptoms.trim(),
                parentNotes: parentNotes.trim(),
                emergencyPlan: emergencyPlan.trim(),
              });
            }}
          >
            OK
          </button>
        </>
      }
    >
      <div className="cm-modal-form">
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Allergy Name <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter allergy name"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">
              Category <span className="req">*</span>
            </label>
            <AppSelect
              value={category}
              onChange={setCategory}
              options={ALLERGY_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Severity Level <span className="req">*</span>
            </label>
            <AppSelect
              value={severity}
              onChange={(v) => setSeverity(v as AllergySeverity)}
              options={ALLERGY_SEVERITIES.map((s) => ({ value: s, label: s }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Symptoms</label>
            <input
              className="ui-input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter symptoms"
            />
          </div>
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">Parent Notes</label>
            <textarea
              className="ui-textarea"
              rows={3}
              value={parentNotes}
              onChange={(e) => setParentNotes(e.target.value)}
              placeholder="Enter additional notes"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Emergency Action Plan</label>
            <textarea
              className="ui-textarea"
              rows={3}
              value={emergencyPlan}
              onChange={(e) => setEmergencyPlan(e.target.value)}
              placeholder="Enter emergency instructions"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
