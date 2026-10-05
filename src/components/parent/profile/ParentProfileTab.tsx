'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  Camera,
  ChevronDown,
  Copy,
  Heart,
  IdCard,
  Pencil,
  Plus,
  Shield,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type {
  AllergyRecord,
  EmergencyContact,
  Student,
  StudentStatus,
} from '@/lib/center-management/types';
import {
  GENDER_OPTIONS,
  GROUP_OPTIONS,
  ROOM_OPTIONS,
  STUDENT_STATUSES,
  initials,
  roomName,
  severityTone,
  statusBadgeTone,
} from '@/lib/center-management/studentsStore';
import { AddAllergyModal } from '@/components/modules/center-management/AddAllergyModal';
import { AddEmergencyModal } from '@/components/modules/center-management/AddEmergencyModal';
import { readImageAsDataUrl } from '@/components/modules/center-management/photoUpload';
import {
  AppMenu,
  AppSelect,
  StatusBadge,
} from '@/components/modules/center-management/ui';

function ageFromDob(dob?: string): string {
  if (!dob) return '';
  const parts = dob.split(/[/-]/).map((p) => Number(p));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const [d, m, y] = parts[0] > 31 ? [parts[2], parts[1], parts[0]] : [parts[0], parts[1], parts[2]];
  const birth = new Date(y, m - 1, d);
  if (Number.isNaN(birth.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return '';
  return `${years} year ${months} month`;
}

function SectionChrome({
  icon,
  title,
  count,
  open,
  onToggle,
  addLabel,
  onAdd,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  addLabel?: string;
  onAdd?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="cm-section">
      <div className="cm-section-head">
        <button type="button" className="cm-section-title-btn" onClick={onToggle}>
          <span className="cm-section-ico">{icon}</span>
          <strong>
            {title}
            {typeof count === 'number' ? <em> {count}</em> : null}
          </strong>
          <ChevronDown
            size={16}
            style={{
              marginLeft: 6,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
        <div className="cm-section-actions">
          {onAdd ? (
            <button type="button" className="ui-btn ui-btn-outline cm-add-btn" onClick={onAdd}>
              <Plus size={14} /> {addLabel}
            </button>
          ) : null}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="cm-section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

type Props = {
  student: Student;
  siblings: Student[];
  onUpdate: (next: Student) => void;
  onToast: (type: 'ok' | 'err', message: string) => void;
};

export function ParentProfileTab({ student, siblings, onUpdate, onToast }: Props) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthDraft, setHealthDraft] = useState({ bloodGroup: '', medication: '' });
  const [draft, setDraft] = useState<Student>(student);
  const [openInfo, setOpenInfo] = useState(true);
  const [openHealth, setOpenHealth] = useState(true);
  const [openEmergency, setOpenEmergency] = useState(true);
  const [openAllergy, setOpenAllergy] = useState(true);
  const [openParents, setOpenParents] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyEdit, setEmergencyEdit] = useState<EmergencyContact | null>(null);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyEdit, setAllergyEdit] = useState<AllergyRecord | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    kind: 'allergy' | 'emergency';
    id?: string;
    title: string;
  }>({ open: false, kind: 'allergy', title: '' });

  useEffect(() => {
    if (!editingInfo) {
      setDraft({
        ...student,
        roomIds: [...student.roomIds],
        parents: student.parents.map((p) => ({ ...p })),
        allergies: student.allergies.map((a) => ({ ...a })),
        siblingIds: [...student.siblingIds],
      });
    }
  }, [student, editingInfo]);

  const ageLabel = ageFromDob(student.dob);
  const mother = useMemo(() => student.parents.find((p) => p.role === 'Mother'), [student.parents]);
  const father = useMemo(() => student.parents.find((p) => p.role === 'Father'), [student.parents]);

  const guardEdit = () => {
    if (!editingInfo) return false;
    onToast(
      'err',
      'Student details are currently in edit mode. Please save or cancel your changes before editing other information.',
    );
    return true;
  };

  const saveInfo = () => {
    if (!draft.name.trim() || !draft.gender || !draft.roomIds.length) return;
    onUpdate({ ...draft });
    setEditingInfo(false);
    onToast('ok', 'Student details saved');
  };

  const cancelInfo = () => {
    setDraft({ ...student });
    setEditingInfo(false);
  };

  const saveHealth = () => {
    onUpdate({
      ...student,
      bloodGroup: healthDraft.bloodGroup,
      medication: healthDraft.medication,
    });
    setEditingHealth(false);
    onToast('ok', 'Health information saved');
  };

  const onSaveAllergy = (data: Omit<AllergyRecord, 'id'> & { id?: string }) => {
    const nextAllergy: AllergyRecord = {
      id: data.id ?? `al-${Date.now()}`,
      name: data.name,
      category: data.category,
      severity: data.severity,
      symptoms: data.symptoms,
      parentNotes: data.parentNotes,
      emergencyPlan: data.emergencyPlan,
    };
    const allergies = data.id
      ? student.allergies.map((a) => (a.id === data.id ? nextAllergy : a))
      : [...student.allergies, nextAllergy];
    onUpdate({ ...student, allergies });
    setAllergyOpen(false);
    setAllergyEdit(null);
    onToast('ok', data.id ? 'Allergy updated' : 'Allergy added');
  };

  const onSaveEmergency = (data: Omit<EmergencyContact, 'id'> & { id?: string }) => {
    const next: EmergencyContact = {
      id: data.id ?? `ec-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      relation: data.relation,
    };
    const emergencyContacts = data.id
      ? student.emergencyContacts.map((c) => (c.id === data.id ? next : c))
      : [...student.emergencyContacts, next];
    onUpdate({ ...student, emergencyContacts });
    setEmergencyOpen(false);
    setEmergencyEdit(null);
    onToast('ok', data.id ? 'Emergency contact updated' : 'Emergency contact added');
  };

  const runDelete = () => {
    const { kind, id } = confirmDelete;
    if (kind === 'allergy' && id) {
      onUpdate({ ...student, allergies: student.allergies.filter((a) => a.id !== id) });
      onToast('ok', 'Allergy removed');
    } else if (kind === 'emergency' && id) {
      onUpdate({
        ...student,
        emergencyContacts: student.emergencyContacts.filter((c) => c.id !== id),
      });
      onToast('ok', 'Emergency contact removed');
    }
    setConfirmDelete({ open: false, kind: 'allergy', title: '' });
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      onToast('ok', 'Email copied');
    } catch {
      onToast('err', 'Could not copy email');
    }
  };

  return (
    <>
      <motion.div
        className="cm-hero cm-hero-v2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cm-hero-identity">
          <div className="cm-hero-avatar-wrap">
            <div className="cm-hero-avatar">
              {student.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.photoUrl} alt="" />
              ) : (
                initials(student.name)
              )}
            </div>
            <button
              type="button"
              className="cm-hero-cam"
              title="Add profile photo"
              aria-label="Add profile photo"
              onClick={() => photoInputRef.current?.click()}
            >
              <Camera size={14} />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const photoUrl = await readImageAsDataUrl(file);
                onUpdate({ ...student, photoUrl });
                onToast('ok', 'Profile photo updated');
                e.target.value = '';
              }}
            />
          </div>
          <h2>
            {student.name}
            {student.preferredName ? (
              <span className="cm-nick"> ({student.preferredName})</span>
            ) : null}
          </h2>
          <StatusBadge status={student.status} showChevron={false} />
        </div>

        <div className="cm-hero-mid">
          <ul className="cm-hero-facts-v2">
            <li>
              <UserRound size={16} />
              <span>
                Gender: <strong>{student.gender || '—'}</strong>
              </span>
            </li>
            <li>
              <Calendar size={16} />
              <span>
                Date of Birth:{' '}
                <strong>
                  {student.dob || 'Birth date not found'}
                  {ageLabel ? ` (${ageLabel})` : ''}
                </strong>
              </span>
            </li>
            <li>
              <IdCard size={16} />
              <span>
                Admission Number: <strong>{student.admissionNumber || '—'}</strong>
              </span>
            </li>
            <li>
              <Building2 size={16} />
              <span>
                Room: <strong>{student.roomIds.map(roomName).join(', ') || '—'}</strong>
              </span>
            </li>
          </ul>
        </div>
      </motion.div>

      <section className={`cm-section${editingInfo ? ' is-editing' : ''}`}>
        <div className="cm-section-head">
          <button type="button" className="cm-section-title-btn" onClick={() => setOpenInfo((v) => !v)}>
            <span className="cm-section-ico">
              <UserRound size={15} />
            </span>
            <strong>Student Information</strong>
            <ChevronDown
              size={16}
              style={{
                marginLeft: 6,
                transform: openInfo ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          <div className="cm-section-actions">
            {editingInfo ? (
              <>
                <button type="button" className="ui-btn ui-btn-outline" onClick={cancelInfo}>
                  Cancel
                </button>
                <button type="button" className="ui-btn ui-btn-primary" onClick={saveInfo}>
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cm-icon-btn"
                title="Edit"
                onClick={() => setEditingInfo(true)}
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
        </div>
        {openInfo ? (
          <div className="cm-section-body">
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">
                  Name <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Preferred Name</label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.preferredName}
                  onChange={(e) => setDraft({ ...draft, preferredName: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">DOB</label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.dob}
                  onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  Gender <span className="req">*</span>
                </label>
                <AppSelect
                  disabled={!editingInfo}
                  value={draft.gender}
                  onChange={(v) => setDraft({ ...draft, gender: v as Student['gender'] })}
                  options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Status</label>
                <AppSelect
                  disabled={!editingInfo}
                  value={draft.status}
                  onChange={(v) => setDraft({ ...draft, status: v as StudentStatus })}
                  options={STUDENT_STATUSES.map((st) => ({
                    value: st,
                    label: st,
                    icon: <span className={`cm-status-dot ${statusBadgeTone(st)}`} />,
                  }))}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Registration Date</label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.registrationDate}
                  onChange={(e) => setDraft({ ...draft, registrationDate: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Admission Number</label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.admissionNumber}
                  onChange={(e) => setDraft({ ...draft, admissionNumber: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Admission Date</label>
                <input
                  className="ui-input"
                  disabled={!editingInfo}
                  value={draft.admissionDate}
                  onChange={(e) => setDraft({ ...draft, admissionDate: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Groups</label>
                <AppSelect
                  disabled={!editingInfo}
                  value={draft.groupIds[0] ?? ''}
                  onChange={(v) => setDraft({ ...draft, groupIds: v ? [v] : [] })}
                  placeholder="—"
                  options={[
                    { value: '', label: '—' },
                    ...GROUP_OPTIONS.map((g) => ({ value: g.id, label: g.name })),
                  ]}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  Room <span className="req">*</span>
                </label>
                {editingInfo ? (
                  <AppSelect
                    value={draft.roomIds[0] ?? ''}
                    onChange={(v) => setDraft({ ...draft, roomIds: v ? [v] : [] })}
                    options={ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name }))}
                  />
                ) : (
                  <input
                    className="ui-input"
                    disabled
                    value={draft.roomIds.map(roomName).join(', ') || '—'}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={`cm-section${editingHealth ? ' is-editing' : ''}`}>
        <div className="cm-section-head">
          <button
            type="button"
            className="cm-section-title-btn"
            onClick={() => {
              if (guardEdit()) return;
              setOpenHealth((v) => !v);
            }}
          >
            <span className="cm-section-ico">
              <Heart size={15} />
            </span>
            <strong>Health Information</strong>
            <ChevronDown
              size={16}
              style={{
                marginLeft: 6,
                transform: openHealth ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          <div className="cm-section-actions">
            {editingHealth ? (
              <>
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={() => setEditingHealth(false)}
                >
                  Cancel
                </button>
                <button type="button" className="ui-btn ui-btn-primary" onClick={saveHealth}>
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cm-icon-btn"
                title="Edit"
                onClick={() => {
                  if (guardEdit()) return;
                  setHealthDraft({
                    bloodGroup: student.bloodGroup || '',
                    medication: student.medication || '',
                  });
                  setEditingHealth(true);
                  setOpenHealth(true);
                }}
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
        </div>
        {openHealth ? (
          <div className="cm-section-body">
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">Blood Group</label>
                <input
                  className="ui-input"
                  disabled={!editingHealth}
                  value={
                    editingHealth
                      ? healthDraft.bloodGroup
                      : student.bloodGroup || 'No blood group on record'
                  }
                  onChange={(e) =>
                    setHealthDraft((d) => ({ ...d, bloodGroup: e.target.value }))
                  }
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Medication</label>
                <input
                  className="ui-input"
                  disabled={!editingHealth}
                  value={
                    editingHealth
                      ? healthDraft.medication
                      : student.medication || 'No medication on record'
                  }
                  onChange={(e) =>
                    setHealthDraft((d) => ({ ...d, medication: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <SectionChrome
        icon={<Shield size={15} />}
        title="Emergency Information"
        open={openEmergency}
        onToggle={() => {
          if (guardEdit()) return;
          setOpenEmergency((v) => !v);
        }}
        addLabel="Add Emergency Contact"
        onAdd={() => {
          if (guardEdit()) return;
          setEmergencyEdit(null);
          setEmergencyOpen(true);
        }}
      >
        {student.emergencyContacts.length ? (
          <div className="cm-card-grid">
            {student.emergencyContacts.map((c) => (
              <div key={c.id} className="cm-info-card">
                <div className="cm-info-card-top">
                  <strong>{c.name}</strong>
                  <AppMenu
                    align="end"
                    minWidth={160}
                    items={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: <Pencil size={15} />,
                        onSelect: () => {
                          setEmergencyEdit(c);
                          setEmergencyOpen(true);
                        },
                      },
                      {
                        id: 'del',
                        label: 'Delete',
                        icon: <Trash2 size={15} />,
                        danger: true,
                        onSelect: () =>
                          setConfirmDelete({
                            open: true,
                            kind: 'emergency',
                            id: c.id,
                            title: `Delete ${c.name}?`,
                          }),
                      },
                    ]}
                    trigger={({ buttonProps }) => (
                      <button type="button" className="cm-row-action" {...buttonProps}>
                        ⋮
                      </button>
                    )}
                  />
                </div>
                <div className="cm-kv">
                  <span>Phone</span>
                  <strong>{c.phone}</strong>
                  <span>Relation</span>
                  <strong>{c.relation}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="cm-empty-msg">
            No emergency contacts added. Emergency contacts are required for student safety.
          </p>
        )}
      </SectionChrome>

      <SectionChrome
        icon={<TriangleAlert size={15} />}
        title="Allergy Information"
        open={openAllergy}
        onToggle={() => {
          if (guardEdit()) return;
          setOpenAllergy((v) => !v);
        }}
        addLabel="Add Allergy"
        onAdd={() => {
          if (guardEdit()) return;
          setAllergyEdit(null);
          setAllergyOpen(true);
        }}
      >
        {student.allergies.length ? (
          <div className="cm-card-grid">
            {student.allergies.map((a, idx) => (
              <div key={a.id} className="cm-allergy-card">
                <div className="cm-allergy-top">
                  <div>
                    <div className="cm-allergy-title">
                      <i className="cm-dot" />
                      <strong>{a.name}</strong>
                      <span>{a.category}</span>
                    </div>
                    <span className={`cm-sev cm-sev-${severityTone(a.severity)}`}>{a.severity}</span>
                  </div>
                  <AppMenu
                    align="end"
                    minWidth={160}
                    items={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: <Pencil size={15} />,
                        onSelect: () => {
                          setAllergyEdit(a);
                          setAllergyOpen(true);
                        },
                      },
                      {
                        id: 'del',
                        label: 'Delete',
                        icon: <Trash2 size={15} />,
                        danger: true,
                        onSelect: () =>
                          setConfirmDelete({
                            open: true,
                            kind: 'allergy',
                            id: a.id,
                            title: `Delete allergy ${a.name}?`,
                          }),
                      },
                    ]}
                    trigger={({ buttonProps }) => (
                      <button type="button" className="cm-row-action" {...buttonProps}>
                        ⋮
                      </button>
                    )}
                  />
                </div>
                <div className="cm-allergy-body">
                  <span>Symptoms</span>
                  <strong>{a.symptoms || '—'}</strong>
                </div>
                <div className="cm-allergy-label">Allergy Information {idx + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="cm-empty-msg">No allergies added.</p>
        )}
      </SectionChrome>

      <SectionChrome
        icon={<Users size={15} />}
        title="Parents"
        count={student.parents.length}
        open={openParents}
        onToggle={() => {
          if (guardEdit()) return;
          setOpenParents((v) => !v);
        }}
      >
        <div className="cm-parents-grid">
          {(
            [
              { role: 'Mother' as const, parent: mother },
              { role: 'Father' as const, parent: father },
            ] as const
          ).map(({ role, parent: p }) =>
            p ? (
              <div key={p.id} className="cm-parent-card">
                <div className="cm-parent-head">
                  <div className="cm-parent-id">
                    <div className="cm-parent-avatar">
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" />
                      ) : (
                        initials(p.name)
                      )}
                    </div>
                    <div>
                      <strong>{p.name}</strong>
                      <span className="cm-pin-btn" style={{ cursor: 'default' }}>
                        {role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cm-kv">
                  <span>Name</span>
                  <strong>{p.name}</strong>
                  <span>Phone</span>
                  <strong>{p.phone || '—'}</strong>
                  <span>Email</span>
                  <strong className="cm-email-val">
                    {p.email || '—'}
                    {p.email ? (
                      <button
                        type="button"
                        className="cm-mini-ico"
                        title="Copy"
                        onClick={() => copyEmail(p.email || '')}
                      >
                        <Copy size={13} />
                      </button>
                    ) : null}
                  </strong>
                  <span>Company Name</span>
                  <strong>{p.company || '—'}</strong>
                  <span>Allow child pickup</span>
                  <strong>{p.allowPickup === false ? 'no' : 'yes'}</strong>
                  <span>Children</span>
                  <strong>
                    {[student.name, ...siblings.map((s) => s.name)].join(', ') || '—'}
                  </strong>
                </div>
              </div>
            ) : (
              <div key={role} className="cm-parent-empty">
                <strong>{role} Details</strong>
                <p className="cm-empty-msg" style={{ margin: 0 }}>
                  No {role.toLowerCase()} on file.
                </p>
              </div>
            ),
          )}
        </div>
      </SectionChrome>

      <AddAllergyModal
        open={allergyOpen}
        initial={allergyEdit}
        onClose={() => {
          setAllergyOpen(false);
          setAllergyEdit(null);
        }}
        onSave={onSaveAllergy}
      />
      <AddEmergencyModal
        open={emergencyOpen}
        initial={emergencyEdit}
        onClose={() => {
          setEmergencyOpen(false);
          setEmergencyEdit(null);
        }}
        onSave={onSaveEmergency}
      />
      <Modal
        open={confirmDelete.open}
        title="Confirm delete"
        onClose={() => setConfirmDelete({ open: false, kind: 'allergy', title: '' })}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setConfirmDelete({ open: false, kind: 'allergy', title: '' })}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={runDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>{confirmDelete.title}</p>
      </Modal>
    </>
  );
}
