'use client';

import { useEffect, useRef, useState } from 'react';
import { Syringe } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsVaccineLibrarySection.module.css';

type Dose = {
  id: string;
  years: number;
  months: number;
  weeks: number;
  proofMandatory: boolean;
};

type Vaccine = {
  id: string;
  name: string;
  instructions: string;
  mandatory: boolean;
  doses: Dose[];
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

type DoseForm = {
  id: string;
  years: string;
  months: string;
  weeks: string;
  proofMandatory: boolean;
};

function doseId() {
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyDose(): DoseForm {
  return { id: doseId(), years: '0', months: '0', weeks: '0', proofMandatory: false };
}

function formatDoseLabel(dose: Dose): string {
  const parts: string[] = [];
  if (dose.years > 0) parts.push(`${dose.years} yr`);
  if (dose.months > 0) parts.push(`${dose.months} mo`);
  if (dose.weeks > 0) parts.push(`${dose.weeks} wk`);
  if (parts.length === 0) return '0 wk';
  return parts.join(' ');
}

function toDoseForm(d: Dose): DoseForm {
  return {
    id: d.id,
    years: String(d.years),
    months: String(d.months),
    weeks: String(d.weeks),
    proofMandatory: d.proofMandatory,
  };
}

function parseDose(d: DoseForm): Dose {
  return {
    id: d.id,
    years: Math.max(0, Number(d.years) || 0),
    months: Math.max(0, Number(d.months) || 0),
    weeks: Math.max(0, Number(d.weeks) || 0),
    proofMandatory: d.proofMandatory,
  };
}

const SEED: Vaccine[] = [
  {
    id: 'v-boostrix',
    name: 'Boostrix',
    instructions: 'It protect against Tetanus, diphtheria and whooping cough (pertussis).',
    mandatory: false,
    doses: [
      { id: 'd1', years: 0, months: 0, weeks: 3, proofMandatory: false },
      { id: 'd2', years: 11, months: 0, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 12, months: 0, weeks: 0, proofMandatory: false },
      { id: 'd4', years: 45, months: 0, weeks: 0, proofMandatory: false },
      { id: 'd5', years: 65, months: 0, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-rotarix',
    name: 'Rotarix® (oral)',
    instructions: 'Protects against rotavirus gastroenteritis.',
    mandatory: false,
    doses: [
      { id: 'd1', years: 0, months: 0, weeks: 6, proofMandatory: false },
      { id: 'd2', years: 0, months: 3, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-infanrix-hexa',
    name: 'Infanrix® hexa',
    instructions: 'Combined vaccine for diphtheria, tetanus, pertussis, hepatitis B, polio and Hib.',
    mandatory: true,
    doses: [
      { id: 'd1', years: 0, months: 0, weeks: 6, proofMandatory: false },
      { id: 'd2', years: 0, months: 3, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 0, months: 6, weeks: 0, proofMandatory: true },
    ],
  },
  {
    id: 'v-prevenar',
    name: 'Prevenar 13®',
    instructions: 'Protects against pneumococcal disease.',
    mandatory: false,
    doses: [
      { id: 'd1', years: 0, months: 0, weeks: 6, proofMandatory: false },
      { id: 'd2', years: 0, months: 5, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 0, months: 12, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-bexsero',
    name: 'Bexsero®',
    instructions: 'Protects against meningococcal group B disease.',
    mandatory: false,
    doses: [
      { id: 'd1', years: 0, months: 3, weeks: 0, proofMandatory: false },
      { id: 'd2', years: 0, months: 5, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 0, months: 12, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-priorix',
    name: 'Priorix®',
    instructions: 'Protects against measles, mumps and rubella.',
    mandatory: true,
    doses: [
      { id: 'd1', years: 0, months: 12, weeks: 0, proofMandatory: true },
      { id: 'd2', years: 0, months: 15, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 4, months: 0, weeks: 0, proofMandatory: false },
      { id: 'd4', years: 11, months: 0, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-varivax',
    name: 'Varivax®',
    instructions: 'Protects against chickenpox (varicella).',
    mandatory: true,
    doses: [
      { id: 'd1', years: 0, months: 12, weeks: 0, proofMandatory: false },
      { id: 'd2', years: 4, months: 0, weeks: 0, proofMandatory: false },
    ],
  },
  {
    id: 'v-infanrix-ipv',
    name: 'Infanrix® IPV',
    instructions: 'Protects against diphtheria, tetanus, pertussis and polio.',
    mandatory: false,
    doses: [
      { id: 'd1', years: 0, months: 0, weeks: 6, proofMandatory: false },
      { id: 'd2', years: 0, months: 3, weeks: 0, proofMandatory: false },
      { id: 'd3', years: 0, months: 5, weeks: 0, proofMandatory: false },
      { id: 'd4', years: 4, months: 0, weeks: 0, proofMandatory: false },
    ],
  },
];

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l4 4V20.5H7V3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.5 12h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsVaccineLibrarySection() {
  const [vaccines, setVaccines] = useState<Vaccine[]>(SEED);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formMandatory, setFormMandatory] = useState(false);
  const [formDoses, setFormDoses] = useState<DoseForm[]>([emptyDose()]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Vaccine | null>(null);

  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [instructionsVaccine, setInstructionsVaccine] = useState<Vaccine | null>(null);

  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const openAdd = () => {
    setMenuId(null);
    setEditingId(null);
    setFormName('');
    setFormInstructions('');
    setFormMandatory(false);
    setFormDoses([emptyDose()]);
    setModalOpen(true);
  };

  const openEdit = (v: Vaccine) => {
    setMenuId(null);
    setEditingId(v.id);
    setFormName(v.name);
    setFormInstructions(v.instructions);
    setFormMandatory(v.mandatory);
    setFormDoses(v.doses.length ? v.doses.map(toDoseForm) : [emptyDose()]);
    setModalOpen(true);
  };

  const openDelete = (v: Vaccine) => {
    setMenuId(null);
    setDeleting(v);
    setDeleteOpen(true);
  };

  const openInstructions = (v: Vaccine) => {
    setInstructionsVaccine(v);
    setInstructionsOpen(true);
  };

  const updateDose = (id: string, patch: Partial<DoseForm>) => {
    setFormDoses((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDose = (id: string) => {
    setFormDoses((list) => (list.length <= 1 ? list : list.filter((d) => d.id !== id)));
  };

  const addDose = () => {
    setFormDoses((list) => [...list, emptyDose()]);
  };

  const saveVaccine = () => {
    if (!formName.trim()) {
      setToast({ type: 'err', message: 'Vaccine name is required' });
      return;
    }
    const name = formName.trim();
    if (vaccines.some((v) => v.id !== editingId && v.name.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Vaccine already exists' });
      return;
    }
    const next: Vaccine = {
      id: editingId ?? `v-${Date.now()}`,
      name,
      instructions: formInstructions.trim(),
      mandatory: formMandatory,
      doses: formDoses.map(parseDose),
    };
    setVaccines((list) => {
      if (editingId) return list.map((v) => (v.id === editingId ? next : v));
      return [next, ...list];
    });
    setModalOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setVaccines((list) => list.filter((v) => v.id !== deleting.id));
    setDeleteOpen(false);
    setDeleting(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const isEditing = Boolean(editingId);

  return (
    <SettingsSectionShell
      title="Vaccine Library"
      description="Maintain vaccines, dose schedules, and instructions."
      icon={<Syringe />}
      actions={
        <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
          + Add Vaccine
        </button>
      }
    >
    <div className={styles.root}>
      <section className={styles.card}>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Dose 1</th>
                <th>Dose 2</th>
                <th>Dose 3</th>
                <th>Dose 4</th>
                <th>Dose 5</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {vaccines.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.empty}>No vaccines yet. Click + Add Vaccine to create one.</div>
                  </td>
                </tr>
              ) : (
                vaccines.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className={styles.vaccineCell}>
                        <span className={styles.vaccineName}>{v.name}</span>
                        <button
                          type="button"
                          className={styles.instructionsBtn}
                          onClick={() => openInstructions(v)}
                        >
                          <DocIcon />
                          Instructions
                        </button>
                        {v.mandatory ? <span className={styles.mandatory}>Mandatory</span> : null}
                      </div>
                    </td>
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const dose = v.doses[idx];
                      return (
                        <td key={idx} className={styles.doseCell}>
                          {dose ? (
                            <div className={styles.doseStack}>
                              <span className={styles.doseBadge}>{formatDoseLabel(dose)}</span>
                              {dose.proofMandatory ? (
                                <span className={styles.proof}>• Proof Mandatory</span>
                              ) : null}
                            </div>
                          ) : (
                            <span className={styles.dash}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className={styles.actionsCell}>
                      <div ref={menuId === v.id ? menuRef : undefined}>
                        <button
                          type="button"
                          className={styles.menuBtn}
                          aria-label={`Actions for ${v.name}`}
                          aria-expanded={menuId === v.id}
                          onClick={() => setMenuId((id) => (id === v.id ? null : v.id))}
                        >
                          ⋮
                        </button>
                        {menuId === v.id ? (
                          <div className={styles.menu} role="menu">
                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => openEdit(v)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <path d="M13 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              </svg>
                              Edit Vaccine
                            </button>
                            <button
                              type="button"
                              className={`${styles.menuItem} ${styles.menuDanger}`}
                              role="menuitem"
                              onClick={() => openDelete(v)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Delete Vaccine
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={isEditing ? 'Edit Vaccine' : 'Add Vaccine'}
        onClose={() => setModalOpen(false)}
        wide
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveVaccine}>
              Save Vaccine
            </button>
          </>
        }
      >
        <div className={styles.modalStack}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="vl-name">
              <span className={styles.req}>*</span> Vaccine Name
            </label>
            <input
              id="vl-name"
              className="ui-input"
              placeholder="e.g. Measles, Mumps & Rubella"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="vl-instructions">
              Instructions
            </label>
            <textarea
              id="vl-instructions"
              className="ui-textarea"
              rows={3}
              placeholder="Optional notes for parents/staff"
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
            />
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={formMandatory}
              onChange={(e) => setFormMandatory(e.target.checked)}
            />
            Vaccine Mandatory
          </label>

          <div className={styles.doseSection}>
            <h3 className={styles.doseHeading}>Dose Schedule</h3>
            <div className={styles.doseList}>
              {formDoses.map((dose, index) => (
                <div key={dose.id} className={styles.doseRow}>
                  <span className={styles.doseNum} aria-label={`Dose ${index + 1}`}>
                    {index + 1}
                  </span>
                  <span className={styles.dueAt}>Due at</span>
                  <label className={styles.unitField}>
                    <input
                      className={`ui-input ${styles.unitInput}`}
                      type="number"
                      min={0}
                      value={dose.years}
                      onChange={(e) => updateDose(dose.id, { years: e.target.value })}
                      aria-label={`Dose ${index + 1} years`}
                    />
                    <span>yr</span>
                  </label>
                  <label className={styles.unitField}>
                    <input
                      className={`ui-input ${styles.unitInput}`}
                      type="number"
                      min={0}
                      value={dose.months}
                      onChange={(e) => updateDose(dose.id, { months: e.target.value })}
                      aria-label={`Dose ${index + 1} months`}
                    />
                    <span>mo</span>
                  </label>
                  <label className={styles.unitField}>
                    <input
                      className={`ui-input ${styles.unitInput}`}
                      type="number"
                      min={0}
                      value={dose.weeks}
                      onChange={(e) => updateDose(dose.id, { weeks: e.target.value })}
                      aria-label={`Dose ${index + 1} weeks`}
                    />
                    <span>wk</span>
                  </label>
                  <label className={styles.checkInline}>
                    <input
                      type="checkbox"
                      checked={dose.proofMandatory}
                      onChange={(e) => updateDose(dose.id, { proofMandatory: e.target.checked })}
                    />
                    Proof Mandatory
                  </label>
                  <button
                    type="button"
                    className={styles.removeDose}
                    aria-label={`Remove dose ${index + 1}`}
                    onClick={() => removeDose(dose.id)}
                    disabled={formDoses.length <= 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addDose} onClick={addDose}>
              + Add Dose
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Vaccine"
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleting(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p className={styles.deleteText}>
          Are you sure you want to delete <strong>{deleting?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={instructionsOpen}
        title={instructionsVaccine ? `${instructionsVaccine.name} — Instructions` : 'Instructions'}
        onClose={() => {
          setInstructionsOpen(false);
          setInstructionsVaccine(null);
        }}
        footer={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              setInstructionsOpen(false);
              setInstructionsVaccine(null);
            }}
          >
            Close
          </button>
        }
      >
        <p className={styles.instructionsBody}>
          {instructionsVaccine?.instructions?.trim()
            ? instructionsVaccine.instructions
            : 'No instructions provided for this vaccine.'}
        </p>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '!'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}
