'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { loadForms } from '../formsStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; category: string; formIds: string[]; formNames: string[] }) => void;
};

const CATEGORIES = ['Admissions', 'Operations'];

export function AddStepModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [forms, setForms] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formQ, setFormQ] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategory('');
    setCatOpen(false);
    setSelected([]);
    setFormOpen(false);
    setFormQ('');
    setForms(loadForms().map((f) => ({ id: f.id, name: f.name })));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filteredForms = useMemo(
    () => forms.filter((f) => f.name.toLowerCase().includes(formQ.toLowerCase())),
    [forms, formQ],
  );

  if (!open) return null;

  const canSave = Boolean(name.trim());

  return (
    <div className="ap-backdrop" role="presentation" onClick={onClose}>
      <div className="ap-modal" role="dialog" aria-modal="true" aria-label="Add a step" onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal-head">
          <h2>Add a step</h2>
          <button type="button" className="ap-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="ap-modal-body">
          <label className="ap-field">
            <span>
              <em>*</em> Step Name
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus />
          </label>

          <div className="ap-field">
            <span>Select Category</span>
            <div className="ap-select">
              <button type="button" className="ap-select-trigger" onClick={() => setCatOpen((v) => !v)}>
                <span className={!category ? 'is-ph' : undefined}>{category || 'Please select'}</span>
                <Search size={14} />
              </button>
              {catOpen ? (
                <div className="ap-select-panel">
                  <ul>
                    {CATEGORIES.map((c) => (
                      <li key={c}>
                        <button
                          type="button"
                          className={category === c ? 'is-active' : undefined}
                          onClick={() => {
                            setCategory(c);
                            setCatOpen(false);
                          }}
                        >
                          {c}
                          {category === c ? <Check size={14} /> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {category ? (
            <div className="ap-field">
              <span>Application</span>
              <div className="ap-select">
                <button type="button" className="ap-select-trigger ap-multi-trigger" onClick={() => setFormOpen((v) => !v)}>
                  <span className="ap-chips">
                    {selected.length === 0 ? (
                      <em className="is-ph">Please select</em>
                    ) : (
                      selected.map((id) => {
                        const f = forms.find((x) => x.id === id);
                        return (
                          <span key={id} className="ap-chip">
                            {f?.name ?? id}
                            <button
                              type="button"
                              aria-label="Remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected((prev) => prev.filter((x) => x !== id));
                              }}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })
                    )}
                  </span>
                  <Search size={14} />
                </button>
                {formOpen ? (
                  <div className="ap-select-panel">
                    <input placeholder="Search" value={formQ} onChange={(e) => setFormQ(e.target.value)} autoFocus />
                    <ul>
                      {filteredForms.map((f) => (
                        <li key={f.id}>
                          <button
                            type="button"
                            className={selected.includes(f.id) ? 'is-active' : undefined}
                            onClick={() =>
                              setSelected((prev) =>
                                prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id],
                              )
                            }
                          >
                            {f.name}
                            {selected.includes(f.id) ? <Check size={14} /> : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="ap-modal-foot">
          <button type="button" className="ap-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ap-btn primary"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave({
                name: name.trim(),
                category,
                formIds: selected,
                formNames: selected.map((id) => forms.find((f) => f.id === id)?.name ?? id),
              });
            }}
          >
            Save &amp; Complete
          </button>
        </div>
      </div>
    </div>
  );
}
