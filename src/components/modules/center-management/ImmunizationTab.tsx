'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  FileText,
  Pencil,
  Smartphone,
  Syringe,
  Upload,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type {
  DoseStatus,
  ExemptionReason,
  Student,
  VaccineRecord,
} from '@/lib/center-management/types';
import {
  defaultVaccines,
  isLegacyVaccine,
  normalizeVaccines,
} from '@/lib/center-management/vaccineUtils';
import { AppMenu, AppSelect, ProfileTablePagination, useClientPagination } from './ui';
import './immunization.css';

export { defaultVaccines } from '@/lib/center-management/vaccineUtils';

type Props = {
  student: Student;
  onUpdate: (next: Student) => void;
};

const EXEMPT_REASONS: ExemptionReason[] = ['Medical', 'Religious', 'Personal Belief', 'Others'];

/** Fraction numerator = Done only (Exempt does not bump completed count in Illumine list) */
function doneCount(v: VaccineRecord) {
  return v.doses.filter((d) => d.status === 'Done').length;
}

/** Row status: any Overdue → Overdue; vaccine exempt → Exempt; else Up to Date (pending future OK) */
function vaccineStatus(v: VaccineRecord): 'Overdue' | 'Up to Date' | 'Exempt' {
  if (v.exempt) return 'Exempt';
  if (v.doses.some((d) => d.status === 'Overdue')) return 'Overdue';
  return 'Up to Date';
}

function formatDisplayDate(value?: string) {
  if (!value) return '—';
  const m = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return value;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[Number(m[2]) - 1] ?? m[2];
  return `${month} ${Number(m[1])}, ${m[3]}`;
}

function vaccineInstructions(name: string): string {
  const map: Record<string, string> = {
    Boostrix:
      'Boostrix protects against diphtheria, tetanus, and whooping cough (pertussis). It is typically given as a booster later in childhood. Record each dose with the administered date and keep the immunisation certificate on file.',
    'Rotarix® (oral)':
      'Rotarix® is an oral vaccine that protects against rotavirus gastroenteritis. Doses are usually given in early infancy. Confirm oral administration and attach supporting documentation when marked Done.',
    'Infanrix® hexa':
      'Infanrix® hexa combines protection against diphtheria, tetanus, pertussis, hepatitis B, poliomyelitis, and Haemophilus influenzae type b. Complete the scheduled multi-dose course and upload proof for completed doses.',
    'Prevenar 13®':
      'Prevenar 13® protects against pneumococcal disease. Complete the full dose series for the child\'s age group and attach certificates for completed doses.',
    'Bexsero®':
      'Bexsero® protects against meningococcal group B disease. Follow the recommended schedule and keep administration or exemption records up to date.',
    'Priorix®':
      'Priorix® protects against measles, mumps, and rubella (MMR). Two doses are commonly required. Record each dose with the administered date and retain clinic documentation.',
    'Varivax®':
      'Varivax® protects against varicella (chickenpox). Ensure both doses in the series are recorded and supporting documents are filed when doses are completed.',
    'Infanrix® IPV':
      'Infanrix® IPV protects against diphtheria, tetanus, pertussis, and poliomyelitis. Record the administration date and upload documentation when the dose is marked Done.',
    'Gardasil® 9':
      'Gardasil® 9 protects against human papillomavirus (HPV). Complete the multi-dose series per schedule and attach certificates for completed doses.',
    'Nimenrix®':
      'Nimenrix® protects against meningococcal disease (groups A, C, W, and Y). Administer according to the recommended schedule and keep exemption or administration records current.',
  };
  return (
    map[name] ||
    `${name} should be administered according to the recommended immunisation schedule. Record each dose status accurately, note due or administered dates, and upload supporting documents when a dose is marked Done or Exempt.`
  );
}

function reminderItems(vaccines: VaccineRecord[]) {
  const items: { id: string; vaccineId: string; name: string; dose: string; status: string; date?: string }[] = [];
  for (const v of vaccines) {
    if (v.exempt) continue;
    for (const d of v.doses) {
      if (d.status === 'Done' || d.status === 'Exempt') continue;
      items.push({
        id: `${v.id}-${d.index}`,
        vaccineId: v.id,
        name: v.name,
        dose: `Dose ${d.index}`,
        status: d.status === 'Overdue' ? 'Overdue' : 'Upcoming',
        date: d.dueDate || d.administeredOn,
      });
    }
  }
  return items;
}

export function ImmunizationTab({ student, onUpdate }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [exemptOpen, setExemptOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [instructionsVaccine, setInstructionsVaccine] = useState<VaccineRecord | null>(null);
  const [target, setTarget] = useState<VaccineRecord | null>(null);

  const [doseIndex, setDoseIndex] = useState(1);
  const [doseStatus, setDoseStatus] = useState<DoseStatus>('Pending');
  const [administeredOn, setAdministeredOn] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [docName, setDocName] = useState('');
  const [exemptReason, setExemptReason] = useState<ExemptionReason | ''>('');
  const [exemptNote, setExemptNote] = useState('');
  const [exemptDoc, setExemptDoc] = useState('');
  const exemptFileRef = useRef<HTMLInputElement>(null);
  const doseFileRef = useRef<HTMLInputElement>(null);

  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [notifyParents, setNotifyParents] = useState(true);
  const [notifyStaff, setNotifyStaff] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const next = normalizeVaccines(student.vaccines);
    const needsSeed =
      !student.vaccines?.length || student.vaccines.some(isLegacyVaccine);
    if (needsSeed) onUpdate({ ...student, vaccines: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const vaccines = normalizeVaccines(student.vaccines);
  const reminders = useMemo(() => reminderItems(vaccines), [vaccines]);
  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(vaccines, 30, student.id);

  const patchStudent = (patch: Partial<Student>) => onUpdate({ ...student, vaccines, ...patch });

  const patchVaccine = (id: string, updater: (v: VaccineRecord) => VaccineRecord) => {
    patchStudent({
      vaccines: vaccines.map((v) => (v.id === id ? updater(v) : v)),
    });
  };

  const loadDoseIntoForm = (v: VaccineRecord, index: number) => {
    const d = v.doses.find((x) => x.index === index) || v.doses[0];
    setDoseIndex(d.index);
    setDoseStatus(d.status);
    setAdministeredOn(d.administeredOn || '');
    setDueDate(d.dueDate || '');
    setNotes(d.notes || '');
    setShowNotes(Boolean(d.notes));
    setDocName(d.documentName || '');
  };

  const openEdit = (v: VaccineRecord, doseIdx?: number) => {
    setTarget(v);
    const first =
      typeof doseIdx === 'number'
        ? v.doses.find((d) => d.index === doseIdx) || v.doses[0]
        : v.doses.find((d) => d.status === 'Overdue') ||
          v.doses.find((d) => d.status === 'Pending') ||
          v.doses[0];
    loadDoseIntoForm(v, first?.index ?? 1);
    setExemptReason(v.exemptReason || '');
    setEditOpen(true);
  };

  const openExempt = (v: VaccineRecord) => {
    setTarget(v);
    setExemptReason(v.exemptReason || '');
    setExemptNote(v.exemptNote || '');
    setExemptDoc(v.exemptDocumentName || '');
    if (exemptFileRef.current) exemptFileRef.current.value = '';
    setExemptOpen(true);
  };

  const openInstructions = (v: VaccineRecord) => {
    setInstructionsVaccine(v);
    setInstructionsOpen(true);
  };

  const saveEdit = () => {
    if (!target) return;
    if (doseStatus === 'Done' && !administeredOn.trim()) {
      setToast('Administered On is required');
      return;
    }
    if ((doseStatus === 'Pending' || doseStatus === 'Overdue') && !dueDate.trim()) {
      setToast('Due Date is required');
      return;
    }
    if (doseStatus === 'Exempt' && !exemptReason) {
      setToast('Reason is required');
      return;
    }
    if ((doseStatus === 'Done' || doseStatus === 'Exempt') && !docName.trim()) {
      setToast('Please upload a supporting document');
      return;
    }

    patchVaccine(target.id, (v) => ({
      ...v,
      doses: v.doses.map((d) => {
        if (d.index !== doseIndex) return d;
        if (doseStatus === 'Done') {
          return {
            ...d,
            status: 'Done',
            administeredOn: administeredOn.trim(),
            dueDate: undefined,
            notes: notes || undefined,
            documentName: docName || undefined,
          };
        }
        if (doseStatus === 'Exempt') {
          return {
            ...d,
            status: 'Exempt',
            administeredOn: undefined,
            dueDate: undefined,
            notes: notes || undefined,
            documentName: docName || undefined,
          };
        }
        return {
          ...d,
          status: doseStatus,
          dueDate: dueDate.trim(),
          administeredOn: undefined,
          notes: notes || undefined,
          documentName: undefined,
        };
      }),
      ...(doseStatus === 'Exempt'
        ? { exemptReason: exemptReason || undefined }
        : {}),
    }));
    setEditOpen(false);
    setToast('Vaccine record saved');
  };

  const saveExempt = () => {
    if (!exemptReason) {
      setToast('Reason is required');
      return;
    }

    // Exempt all immunizations (from header toggle)
    if (!target) {
      patchStudent({
        immunizationExemptAll: true,
        immunizationExemptReason: exemptReason || undefined,
        immunizationExemptNote: exemptNote || undefined,
        immunizationExemptDocumentName: exemptDoc || undefined,
        vaccines: vaccines.map((v) => ({
          ...v,
          exempt: true,
          exemptReason: exemptReason || undefined,
          exemptNote: exemptNote || undefined,
          exemptDocumentName: exemptDoc || undefined,
          doses: v.doses.map((d) => ({ ...d, status: 'Exempt' as const })),
        })),
      });
      setExemptOpen(false);
      setToast('Student exempted from all immunizations');
      if (exemptFileRef.current) exemptFileRef.current.value = '';
      return;
    }

    patchVaccine(target.id, (v) => ({
      ...v,
      exempt: true,
      exemptReason: exemptReason || undefined,
      exemptNote: exemptNote || undefined,
      exemptDocumentName: exemptDoc || undefined,
      doses: v.doses.map((d) => ({ ...d, status: 'Exempt' as const })),
    }));
    setExemptOpen(false);
    setToast(`${target.name} marked exempt`);
    if (exemptFileRef.current) exemptFileRef.current.value = '';
  };

  const openReminder = () => {
    setSelectedReminders(reminders.map((r) => r.id));
    setNotifyParents(true);
    setNotifyStaff(false);
    setReminderOpen(true);
  };

  const openExemptAll = () => {
    setTarget(null);
    // Editing existing exemption keeps saved values; enabling from scratch starts empty
    if (student.immunizationExemptAll) {
      setExemptReason(student.immunizationExemptReason || '');
      setExemptNote(student.immunizationExemptNote || '');
      setExemptDoc(student.immunizationExemptDocumentName || '');
    } else {
      setExemptReason('');
      setExemptNote('');
      setExemptDoc('');
    }
    if (exemptFileRef.current) exemptFileRef.current.value = '';
    setExemptOpen(true);
  };

  const clearAllExempt = () => {
    const hadDocument = Boolean(student.immunizationExemptDocumentName || exemptDoc);
    setExemptDoc('');
    setExemptNote('');
    setExemptReason('');
    setExemptOpen(false);
    setTarget(null);
    if (exemptFileRef.current) exemptFileRef.current.value = '';

    const next: Student = {
      ...student,
      vaccines: defaultVaccines(),
      immunizationExemptAll: false,
    };
    delete next.immunizationExemptReason;
    delete next.immunizationExemptNote;
    delete next.immunizationExemptDocumentName;

    onUpdate(next);
    setToast(
      hadDocument
        ? 'Exemption cleared — supporting document deleted'
        : 'Exemption cleared',
    );
  };

  const closeExemptModal = () => {
    setExemptOpen(false);
    setTarget(null);
    // Discard unsaved upload when cancelling a fresh enable
    if (!student.immunizationExemptAll) {
      setExemptDoc('');
      setExemptNote('');
      setExemptReason('');
      if (exemptFileRef.current) exemptFileRef.current.value = '';
    }
  };

  const onExemptFileChange = (file: File | null) => {
    setExemptDoc(file?.name || '');
  };

  const removeExemptDoc = () => {
    setExemptDoc('');
    if (exemptFileRef.current) exemptFileRef.current.value = '';
  };

  const showDueDate = doseStatus === 'Pending' || doseStatus === 'Overdue';
  const showAdministered = doseStatus === 'Done';
  const showReason = doseStatus === 'Exempt';
  const showUpload = doseStatus === 'Done' || doseStatus === 'Exempt';
  const isExemptAll = Boolean(student.immunizationExemptAll);

  const exemptionModal = (
    <Modal
      open={exemptOpen}
      title="Add Exemption"
      elevated
      onClose={closeExemptModal}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={closeExemptModal}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={saveExempt}>
            Save
          </button>
        </>
      }
    >
      <motion.div
        className="imm-exempt-form"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="imm-modal-sub imm-exempt-student">{student.name}</p>
        {target ? (
          <p className="imm-exempt-scope">
            Exempting <strong>{target.name}</strong>
          </p>
        ) : (
          <p className="imm-exempt-scope">Exempting <strong>all immunizations</strong></p>
        )}

        <div className="ui-field">
          <label className="ui-label">
            Reason <span className="req">*</span>
          </label>
          <div className="imm-pill-row imm-reason-row" role="group" aria-label="Exemption reason">
            {EXEMPT_REASONS.map((r, i) => (
              <motion.button
                key={r}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.22 }}
                whileTap={{ scale: 0.96 }}
                className={`imm-reason-btn tone-${r.toLowerCase().replace(/\s+/g, '')}${
                  exemptReason === r ? ' is-on' : ''
                }`}
                onClick={() => setExemptReason(r)}
              >
                {r}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label">Note</label>
          <textarea
            className="ui-textarea"
            placeholder="Enter note..."
            rows={3}
            value={exemptNote}
            onChange={(e) => setExemptNote(e.target.value)}
          />
        </div>

        <div className="ui-field">
          <label className="ui-label">Supporting Document</label>
          <input
            ref={exemptFileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,image/*,application/pdf"
            hidden
            onChange={(e) => onExemptFileChange(e.target.files?.[0] ?? null)}
          />
          {exemptDoc ? (
            <div className="imm-upload has-file imm-upload-file">
              <FileText size={18} />
              <span className="imm-upload-name" title={exemptDoc}>
                {exemptDoc}
              </span>
              <button
                type="button"
                className="imm-upload-remove"
                aria-label="Remove document"
                onClick={removeExemptDoc}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="imm-upload"
              onClick={() => exemptFileRef.current?.click()}
            >
              <Upload size={18} />
              <span>Click to upload (optional)</span>
            </button>
          )}
        </div>
      </motion.div>
    </Modal>
  );

  return (
    <motion.section
      className="cm-tab-card imm-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {toast ? <div className="imm-toast">{toast}</div> : null}

      <div className="imm-head">
        <div className="imm-title">
          <span className="imm-title-icon" aria-hidden>
            <Syringe size={16} />
          </span>
          <strong>Immunization</strong>
        </div>
        <div className="imm-head-actions">
          <label className="imm-toggle-row">
            <span className={`imm-switch${isExemptAll ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={isExemptAll}
                onChange={(e) => {
                  if (e.target.checked) openExemptAll();
                  else clearAllExempt();
                }}
              />
              <span className="imm-switch-knob" />
            </span>
            Exempt student from all immunizations
          </label>
          {!isExemptAll ? (
            <button type="button" className="ui-btn ui-btn-outline imm-send-btn" onClick={openReminder}>
              Send Reminder
            </button>
          ) : null}
        </div>
      </div>

      {isExemptAll ? (
        <motion.div
          className="imm-exempt-all"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="imm-exempt-all-icon" aria-hidden>
            <Ban size={28} />
          </div>
          <p className="imm-exempt-msg">This student is exempted from all vaccines.</p>
          <div className="imm-exempt-meta">
            <span>
              Reason:{' '}
              <em className="imm-reason-pill">{student.immunizationExemptReason || 'Medical'}</em>
            </span>
            {student.immunizationExemptDocumentName ? (
              <button
                type="button"
                className="imm-link"
                title={student.immunizationExemptDocumentName}
                onClick={() =>
                  setToast(`Supporting document: ${student.immunizationExemptDocumentName}`)
                }
              >
                <FileText size={14} /> Supporting Document
              </button>
            ) : null}
            <button type="button" className="imm-link" onClick={openExemptAll}>
              <Pencil size={14} /> Edit
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="imm-table-shell">
          <div className="imm-table-wrap">
            <table className="imm-table">
              <thead>
                <tr>
                  <th className="imm-col-vaccine">Vaccine</th>
                  <th className="imm-col-doses">Doses</th>
                  <th className="imm-col-status">Status</th>
                  <th className="imm-col-actions" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((v, rowIdx) => {
                  const status = vaccineStatus(v);
                  const done = doneCount(v);
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(rowIdx * 0.03, 0.24), duration: 0.22 }}
                    >
                      <td className="imm-col-vaccine">
                        <div className="imm-vax-cell">
                          <div className="imm-vax-name">{v.name}</div>
                          <button
                            type="button"
                            className="imm-instructions"
                            onClick={() => openInstructions(v)}
                          >
                            <FileText size={12} /> Instructions
                          </button>
                          {v.mandatory ? <span className="imm-mandatory">Mandatory</span> : null}
                        </div>
                      </td>
                      <td className="imm-col-doses">
                        <div className="imm-doses">
                          <div className="imm-dots">
                            {v.doses.map((d) => (
                              <button
                                key={d.index}
                                type="button"
                                className={`imm-dot ${
                                  d.status === 'Done'
                                    ? 'is-done'
                                    : d.status === 'Overdue'
                                      ? 'is-overdue'
                                      : d.status === 'Exempt'
                                        ? 'is-exempt'
                                        : 'is-pending'
                                }`}
                                title={`Dose ${d.index}: ${d.status} — click to update`}
                                aria-label={`Update dose ${d.index} for ${v.name}`}
                                onClick={() => openEdit(v, d.index)}
                              />
                            ))}
                          </div>
                          <span className="imm-dose-count">
                            {done}/{v.dosesRequired}
                          </span>
                        </div>
                      </td>
                      <td className="imm-col-status">
                        {status === 'Up to Date' ? (
                          <span className="imm-status ok">
                            <CheckCircle2 size={15} /> Up to Date
                          </span>
                        ) : status === 'Exempt' ? (
                          <span className="imm-status exempt">
                            <Ban size={15} /> Exempt
                          </span>
                        ) : (
                          <span className="imm-status overdue">
                            <AlertCircle size={15} /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="imm-col-actions">
                        <AppMenu
                          align="end"
                          minWidth={180}
                          items={[
                            {
                              id: 'edit',
                              label: 'Edit Record',
                              icon: <Pencil size={15} />,
                              onSelect: () => openEdit(v),
                            },
                            {
                              id: 'exempt',
                              label: 'Exempt Vaccine',
                              icon: <Ban size={15} />,
                              onSelect: () => openExempt(v),
                            },
                          ]}
                          trigger={({ open, buttonProps }) => (
                            <button
                              type="button"
                              className={`cm-row-action${open ? ' is-open' : ''}`}
                              aria-label="Vaccine actions"
                              {...buttonProps}
                            >
                              <span className="imm-kebab" aria-hidden>
                                ⋮
                              </span>
                            </button>
                          )}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ProfileTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Vaccine instructions */}
      <Modal
        open={instructionsOpen}
        title={instructionsVaccine ? `${instructionsVaccine.name} — Instructions` : 'Instructions'}
        elevated
        onClose={() => setInstructionsOpen(false)}
        footer={
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => setInstructionsOpen(false)}>
            Got it
          </button>
        }
      >
        {instructionsVaccine ? (
          <div className="imm-instructions-body">
            <div className="imm-instructions-hero">
              <span className="imm-instructions-icon" aria-hidden>
                <FileText size={20} />
              </span>
              <div>
                <strong>{instructionsVaccine.name}</strong>
                {instructionsVaccine.mandatory ? <span className="imm-mandatory">Mandatory</span> : null}
                <p>
                  {instructionsVaccine.dosesRequired} dose
                  {instructionsVaccine.dosesRequired === 1 ? '' : 's'} in this schedule
                </p>
              </div>
            </div>
            <p className="imm-instructions-text">{vaccineInstructions(instructionsVaccine.name)}</p>
            <ul className="imm-instructions-list">
              <li>Click a dose circle in the table to update that specific dose.</li>
              <li>
                Mark a dose <strong>Done</strong> to record the administered date and upload documentation.
              </li>
              <li>
                Use <strong>Exempt Dose</strong> when a dose is waived — select a reason and attach supporting
                documents.
              </li>
              <li>
                <strong>Pending</strong> and <strong>Overdue</strong> doses only need a due date (no document
                upload).
              </li>
            </ul>
          </div>
        ) : null}
      </Modal>

      {/* Send Reminders */}
      <Modal
        open={reminderOpen}
        title="Send Reminders"
        elevated
        onClose={() => setReminderOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setReminderOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!selectedReminders.length}
              onClick={() => {
                setReminderOpen(false);
                setToast(`Reminder sent (${selectedReminders.length} doses)`);
              }}
            >
              Send
            </button>
          </>
        }
      >
        <p className="imm-modal-sub">Choose vaccines to include in the reminder.</p>
        <label className="imm-check-row imm-select-all">
          <input
            type="checkbox"
            className="cm-check"
            checked={reminders.length > 0 && selectedReminders.length === reminders.length}
            onChange={(e) =>
              setSelectedReminders(e.target.checked ? reminders.map((r) => r.id) : [])
            }
          />
          Select All ({reminders.length})
        </label>
        <div className="imm-reminder-list">
          {reminders.map((r) => (
            <label key={r.id} className="imm-reminder-row">
              <input
                type="checkbox"
                className="cm-check"
                checked={selectedReminders.includes(r.id)}
                onChange={(e) =>
                  setSelectedReminders((prev) =>
                    e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                  )
                }
              />
              <span className="imm-reminder-label">
                <strong>{r.name}</strong>
                <span> · {r.dose}</span>
              </span>
              <span className={`imm-mini-badge ${r.status === 'Overdue' ? 'overdue' : 'upcoming'}`}>
                {r.status}
              </span>
              <span className="imm-reminder-date">
                <CalendarDays size={13} /> {formatDisplayDate(r.date)}
              </span>
            </label>
          ))}
        </div>
        <div className="imm-info-banner">
          <Smartphone size={16} />
          Reminder will be sent as an in-app notification and email.
        </div>
        <label className="imm-check-block">
          <input
            type="checkbox"
            className="cm-check"
            checked={notifyParents}
            onChange={(e) => setNotifyParents(e.target.checked)}
          />
          <span>
            <strong>Send vaccine reminders to parents</strong>
            <small>Notifies {student.name}&apos;s parents.</small>
          </span>
        </label>
        <label className="imm-check-block">
          <input
            type="checkbox"
            className="cm-check"
            checked={notifyStaff}
            onChange={(e) => setNotifyStaff(e.target.checked)}
          />
          <span>
            <strong>Notify staff to follow up on vaccine reminder</strong>
            <small>Notifies {student.name}&apos;s staff.</small>
          </span>
        </label>
      </Modal>

      {/* Update Vaccine */}
      <Modal
        open={editOpen}
        title="Update Vaccine"
        elevated
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveEdit}>
              Save Record
            </button>
          </>
        }
      >
        <p className="imm-modal-sub">
          {target?.name} for {student.name}
        </p>

        <div className="ui-field">
          <label className="ui-label">
            Select Dose <span className="req">*</span>
          </label>
          <div className="imm-pill-row">
            {target?.doses.map((d) => (
              <button
                key={d.index}
                type="button"
                className={`imm-pill${doseIndex === d.index ? ' is-on' : ''}`}
                onClick={() => target && loadDoseIntoForm(target, d.index)}
              >
                Dose {d.index}
              </button>
            ))}
          </div>
        </div>

        {showAdministered ? (
          <div className="ui-field">
            <label className="ui-label">
              Administered On <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              placeholder="DD/MM/YYYY"
              value={administeredOn}
              onChange={(e) => setAdministeredOn(e.target.value)}
            />
          </div>
        ) : null}

        {showDueDate ? (
          <div className="ui-field">
            <label className="ui-label">
              Due Date <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              placeholder="DD/MM/YYYY"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        ) : null}

        <div className="ui-field">
          <label className="ui-label">Dose Status</label>
          <div className="imm-pill-row">
            {(['Done', 'Pending', 'Overdue', 'Exempt'] as DoseStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`imm-status-pill tone-${s.toLowerCase()}${doseStatus === s ? ' is-on' : ''}`}
                onClick={() => setDoseStatus(s)}
              >
                {s === 'Exempt' ? 'Exempt Dose' : s}
              </button>
            ))}
          </div>
        </div>

        {showReason ? (
          <div className="ui-field">
            <label className="ui-label">
              Reason <span className="req">*</span>
            </label>
            <AppSelect
              value={exemptReason}
              onChange={(v) => setExemptReason(v as ExemptionReason)}
              options={EXEMPT_REASONS.map((r) => ({ label: r, value: r }))}
              placeholder="Select a reason"
            />
          </div>
        ) : null}

        {showUpload ? (
          <div className="ui-field">
            <label className="ui-label">
              Upload Document <span className="req">*</span>
            </label>
            <p className="imm-upload-hint">
              {doseStatus === 'Done'
                ? 'Attach proof of administration for this completed dose.'
                : 'Attach supporting documents for this dose exemption.'}
            </p>
            <input
              ref={doseFileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,image/*,application/pdf"
              hidden
              onChange={(e) => setDocName(e.target.files?.[0]?.name || '')}
            />
            {docName ? (
              <div className="imm-upload has-file imm-upload-file">
                <FileText size={18} />
                <span className="imm-upload-name" title={docName}>
                  {docName}
                </span>
                <button
                  type="button"
                  className="imm-upload-remove"
                  aria-label="Remove document"
                  onClick={() => {
                    setDocName('');
                    if (doseFileRef.current) doseFileRef.current.value = '';
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="imm-upload"
                onClick={() => doseFileRef.current?.click()}
              >
                <Upload size={18} />
                <span>Click to upload</span>
              </button>
            )}
          </div>
        ) : (
          <p className="imm-no-upload-hint">
            Document upload is not required for {doseStatus.toLowerCase()} doses — set the due date above.
          </p>
        )}

        {showNotes ? (
          <div className="ui-field">
            <label className="ui-label">Notes</label>
            <textarea
              className="ui-textarea"
              placeholder="Optional notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        ) : (
          <button type="button" className="imm-add-notes" onClick={() => setShowNotes(true)}>
            + Add notes
          </button>
        )}
      </Modal>

      {/* Same Add Exemption modal for toggle + ⋮ Exempt Vaccine */}
      {exemptionModal}
    </motion.section>
  );
}
