'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Download,
  GripVertical,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import { AddFormToStepModal } from './AddFormToStepModal';
import { AddStepModal } from './AddStepModal';
import { CreateProcessModal, type ProcessFormPayload } from './CreateProcessModal';
import { ShareAdmissionProcessModal } from './ShareAdmissionProcessModal';
import { deleteProcess, getProcessById, upsertProcess } from './admissionStore';
import { downloadAdmissionBlankPdf } from './downloadAdmissionBlankPdf';
import type {
  AdmissionProcess,
  AdmissionStep,
  AdmissionStudentProgress,
  StudentProcessStatus,
} from './types';
import './admission.css';

type Props = { processId: string };

function formatDue(iso: string) {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function SortIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden>
      <path d="M5 1 9 6H1L5 1Z" fill="currentColor" opacity="0.45" />
      <path d="M5 13 1 8h8L5 13Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function statusClass(status: StudentProcessStatus) {
  if (status === 'Done') return 'is-done';
  if (status === 'In Progress') return 'is-progress';
  return 'is-pending';
}

function uniqueOptions(values: string[], allLabel: string) {
  return [allLabel, ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))];
}

export function AdmissionProcessDetailPage({ processId }: Props) {
  const router = useRouter();
  const [process, setProcess] = useState<AdmissionProcess | null>(null);
  const [tab, setTab] = useState<'progress' | 'steps'>('progress');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [stepModal, setStepModal] = useState(false);
  const [addFormStepId, setAddFormStepId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const actionsRef = useRef<HTMLDivElement>(null);

  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roomFilter, setRoomFilter] = useState('All Room');
  const [groupFilter, setGroupFilter] = useState('All Group');
  const [programFilter, setProgramFilter] = useState('All Programs');

  useEffect(() => {
    setProcess(getProcessById(processId));
    setDirty(false);
    setStatusFilter('All Status');
    setRoomFilter('All Room');
    setGroupFilter('All Group');
    setProgramFilter('All Programs');
  }, [processId]);

  useEffect(() => {
    if (!actionsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!actionsRef.current?.contains(e.target as Node)) setActionsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActionsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [actionsOpen]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const markDirty = (next: AdmissionProcess) => {
    setProcess(next);
    setDirty(true);
  };

  const save = () => {
    if (!process) return;
    upsertProcess(process);
    setDirty(false);
    flash('Successfully saved.');
  };

  const onUpdateMeta = (payload: ProcessFormPayload) => {
    if (!process) return;
    const next: AdmissionProcess = {
      ...process,
      name: payload.name,
      status: payload.status,
      dueDate: payload.dueDate ? formatDue(payload.dueDate) : undefined,
    };
    upsertProcess(next);
    setProcess(next);
    setEditOpen(false);
    setDirty(false);
    flash('Process updated.');
  };

  const onDeleteProcess = () => {
    if (!process) return;
    setActionsOpen(false);
    deleteProcess(process.id);
    flash('Process deleted');
    router.push('/forms/admission-process');
  };

  const onDownloadBlank = async () => {
    if (!process || downloading) return;
    setActionsOpen(false);
    setDownloading(true);
    try {
      await downloadAdmissionBlankPdf(process);
      flash('Blank admission packet downloaded');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not generate blank form packet');
    } finally {
      setDownloading(false);
    }
  };

  const addStep = (payload: {
    name: string;
    category: string;
    formIds: string[];
    formNames: string[];
  }) => {
    if (!process) return;
    const step: AdmissionStep = {
      id: `step-${Date.now()}`,
      name: payload.name,
      category: payload.category || undefined,
      forms: payload.formIds.map((id, i) => ({
        id: `sf-${Date.now()}-${i}`,
        formId: id,
        formName: payload.formNames[i] ?? id,
      })),
    };
    markDirty({ ...process, steps: [...process.steps, step] });
    setStepModal(false);
    setTab('steps');
  };

  const removeStep = (stepId: string) => {
    if (!process) return;
    markDirty({ ...process, steps: process.steps.filter((s) => s.id !== stepId) });
  };

  const removeForm = (stepId: string, formRowId: string) => {
    if (!process) return;
    markDirty({
      ...process,
      steps: process.steps.map((s) =>
        s.id === stepId ? { ...s, forms: s.forms.filter((f) => f.id !== formRowId) } : s,
      ),
    });
  };

  const addFormToStep = (payload: { formId: string; formName: string }) => {
    if (!process || !addFormStepId) return;
    markDirty({
      ...process,
      steps: process.steps.map((s) =>
        s.id === addFormStepId
          ? {
              ...s,
              forms: [
                ...s.forms,
                { id: `sf-${Date.now()}`, formId: payload.formId, formName: payload.formName },
              ],
            }
          : s,
      ),
    });
    setAddFormStepId(null);
  };

  const excludeForStep = useMemo(() => {
    if (!process || !addFormStepId) return [];
    return process.steps.find((s) => s.id === addFormStepId)?.forms.map((f) => f.formId) ?? [];
  }, [process, addFormStepId]);

  const students = process?.students ?? [];

  const statusOptions = useMemo(() => ['All Status', 'Done', 'In Progress', 'Pending'], []);
  const roomOptions = useMemo(
    () => uniqueOptions(students.map((s) => s.room), 'All Room'),
    [students],
  );
  const groupOptions = useMemo(
    () => uniqueOptions(students.map((s) => s.group), 'All Group'),
    [students],
  );
  const programOptions = useMemo(
    () => uniqueOptions(students.map((s) => s.program), 'All Programs'),
    [students],
  );

  const filteredStudents = useMemo(() => {
    let list: AdmissionStudentProgress[] = [...students];
    if (statusFilter !== 'All Status') {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (roomFilter !== 'All Room') {
      list = list.filter((s) => s.room === roomFilter);
    }
    if (groupFilter !== 'All Group') {
      list = list.filter((s) => s.group === groupFilter);
    }
    if (programFilter !== 'All Programs') {
      list = list.filter((s) => s.program === programFilter);
    }
    list.sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
    return list;
  }, [students, statusFilter, roomFilter, groupFilter, programFilter, sortAsc]);

  if (!process) {
    return (
      <div className="ap-page">
        <div className="ap-card">
          <p className="ap-empty">
            Process not found.{' '}
            <button
              type="button"
              className="ap-name-link"
              onClick={() => router.push('/forms/admission-process')}
            >
              Back to list
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-page">
      <div className="ap-card ap-detail-card">
        <div className="ap-detail-head">
          <div className="ap-detail-title">
            <button
              type="button"
              className="ap-icon-btn"
              aria-label="Back"
              onClick={() => router.push('/forms/admission-process')}
            >
              <ArrowLeft size={18} />
            </button>
            <h1>{process.name}</h1>
          </div>
          <div className="ap-detail-actions">
            {dirty ? <span className="ap-unsaved">Changes not saved !!</span> : null}
            <button type="button" className="ui-btn ui-btn-outline ap-btn outline" onClick={save}>
              Save
            </button>
            <div className="ap-actions-wrap" ref={actionsRef}>
              <button
                type="button"
                className="ui-btn ui-btn-primary ap-btn primary"
                aria-expanded={actionsOpen}
                onClick={() => setActionsOpen((v) => !v)}
              >
                Actions
                <ChevronDown size={14} />
              </button>
              {actionsOpen ? (
                <div className="ap-menu ap-actions-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActionsOpen(false);
                      setShareOpen(true);
                    }}
                  >
                    <Share2 size={14} />
                    Share with families
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={downloading}
                    onClick={() => void onDownloadBlank()}
                  >
                    <Download size={14} />
                    {downloading ? 'Downloading…' : 'Download Blank Form'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActionsOpen(false);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="danger"
                    onClick={onDeleteProcess}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="ap-tabs" role="tablist" aria-label="Process views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'progress'}
            className={tab === 'progress' ? 'is-active' : undefined}
            onClick={() => setTab('progress')}
          >
            Student Progress
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'steps'}
            className={tab === 'steps' ? 'is-active' : undefined}
            onClick={() => setTab('steps')}
          >
            Process Steps
          </button>
        </div>

        {tab === 'progress' ? (
          <div className="ap-progress-panel">
            <div className="ap-filters" role="group" aria-label="Student progress filters">
              <div className="ap-filter-item">
                <SearchableSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  searchable={false}
                  ariaLabel="Filter by status"
                />
              </div>
              <div className="ap-filter-item">
                <SearchableSelect
                  value={roomFilter}
                  onChange={setRoomFilter}
                  options={roomOptions}
                  searchable={false}
                  ariaLabel="Filter by room"
                />
              </div>
              <div className="ap-filter-item">
                <SearchableSelect
                  value={groupFilter}
                  onChange={setGroupFilter}
                  options={groupOptions}
                  searchable={false}
                  ariaLabel="Filter by group"
                />
              </div>
              <div className="ap-filter-item">
                <SearchableSelect
                  value={programFilter}
                  onChange={setProgramFilter}
                  options={programOptions}
                  searchable={false}
                  ariaLabel="Filter by program"
                />
              </div>
            </div>

            <div className="ap-progress-table-card">
              <table className="ap-table ap-progress-table">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="ap-th-sort ap-th-sort-btn"
                        onClick={() => setSortAsc((v) => !v)}
                        aria-sort={sortAsc ? 'ascending' : 'descending'}
                      >
                        STUDENT NAME
                        <SortIcon />
                      </button>
                    </th>
                    <th>PROCESS STATUS</th>
                    <th>PROGRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="ap-empty">
                        No students match these filters
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="ap-student-cell">
                            <strong>{student.name}</strong>
                            <span>
                              {student.room} · {student.group} · {student.program}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`ap-status-pill ${statusClass(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="ap-progress-cell">
                            <div
                              className="ap-progress-bar"
                              role="progressbar"
                              aria-valuenow={student.progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${student.name} progress`}
                            >
                              <span style={{ width: `${student.progress}%` }} />
                            </div>
                            <em>{student.progress}%</em>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="ap-steps">
            {process.steps.length === 0 ? (
              <p className="ap-steps-empty">No steps yet. Create your first step below.</p>
            ) : (
              process.steps.map((step, index) => (
                <div key={step.id} className="ap-step-card">
                  <div className="ap-step-head">
                    <h3>
                      {index + 1}. {step.name}
                      {step.category ? <span className="ap-step-cat">{step.category}</span> : null}
                    </h3>
                    <button
                      type="button"
                      className="ap-icon-btn"
                      aria-label={`Delete ${step.name}`}
                      onClick={() => removeStep(step.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="ap-step-forms">
                    {step.forms.map((f) => (
                      <div key={f.id} className="ap-step-form">
                        <GripVertical size={14} className="ap-grip" aria-hidden />
                        <span>{f.formName}</span>
                        <button
                          type="button"
                          className="ap-icon-btn"
                          aria-label={`Remove ${f.formName}`}
                          onClick={() => removeForm(step.id, f.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="ap-add-form"
                      onClick={() => setAddFormStepId(step.id)}
                    >
                      <Plus size={14} />
                      Add Form
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              className="ui-btn ui-btn-primary ap-create-step"
              onClick={() => setStepModal(true)}
            >
              CREATE NEW STEP
            </button>
          </div>
        )}
      </div>

      <CreateProcessModal
        open={editOpen}
        initial={{
          name: process.name,
          dueDate: process.dueDate,
          status: process.status,
        }}
        onClose={() => setEditOpen(false)}
        onSave={onUpdateMeta}
      />
      <AddStepModal open={stepModal} onClose={() => setStepModal(false)} onSave={addStep} />
      <AddFormToStepModal
        open={!!addFormStepId}
        onClose={() => setAddFormStepId(null)}
        onSave={addFormToStep}
        excludeIds={excludeForStep}
      />

      <ShareAdmissionProcessModal
        open={shareOpen}
        process={process}
        onClose={() => setShareOpen(false)}
        onShared={(count) => {
          flash(`Admission shared with ${count} famil${count === 1 ? 'y' : 'ies'}`);
          setShareOpen(false);
        }}
      />

      {toast ? (
        <div className="ap-toast success" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
