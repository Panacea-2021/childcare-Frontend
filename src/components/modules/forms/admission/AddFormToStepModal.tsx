'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { loadForms } from '../formsStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { formId: string; formName: string }) => void;
  excludeIds?: string[];
};

export function AddFormToStepModal({ open, onClose, onSave, excludeIds = [] }: Props) {
  const [forms, setForms] = useState<Array<{ id: string; name: string }>>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setSelected(null);
    setForms(
      loadForms()
        .filter((f) => !excludeIds.includes(f.id))
        .map((f) => ({ id: f.id, name: f.name })),
    );
  }, [open, excludeIds]);

  const filtered = useMemo(
    () => forms.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())),
    [forms, q],
  );

  if (!open) return null;

  return (
    <div className="ap-backdrop" role="presentation" onClick={onClose}>
      <div className="ap-modal" role="dialog" aria-modal="true" aria-label="Add Form" onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal-head">
          <h2>Add Form</h2>
          <button type="button" className="ap-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="ap-modal-body">
          <div className="ap-field">
            <span>Select form</span>
            <label className="ap-search-box">
              <Search size={14} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search forms" autoFocus />
            </label>
            <ul className="ap-form-list">
              {filtered.length === 0 ? (
                <li className="ap-empty-li">No forms found</li>
              ) : (
                filtered.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      className={selected === f.id ? 'is-active' : undefined}
                      onClick={() => setSelected(f.id)}
                    >
                      {f.name}
                      {selected === f.id ? <Check size={14} /> : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="ap-modal-foot">
          <button type="button" className="ap-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ap-btn primary"
            disabled={!selected}
            onClick={() => {
              const f = forms.find((x) => x.id === selected);
              if (!f) return;
              onSave({ formId: f.id, formName: f.name });
            }}
          >
            Save &amp; Complete
          </button>
        </div>
      </div>
    </div>
  );
}
