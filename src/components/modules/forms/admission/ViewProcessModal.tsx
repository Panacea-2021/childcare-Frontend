'use client';

import { Eye, GitBranch, Layers3, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { AdmissionProcess } from './types';

type Props = {
  open: boolean;
  process: AdmissionProcess | null;
  onClose: () => void;
  onEdit: (process: AdmissionProcess) => void;
  onOpen: (process: AdmissionProcess) => void;
};

export function ViewProcessModal({ open, process, onClose, onEdit, onOpen }: Props) {
  if (!process) return null;

  return (
    <Modal
      open={open}
      title={process.name}
      subtitle="Admission process overview"
      icon={<Eye size={18} />}
      lg
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => onEdit(process)}>
            Edit Details
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => onOpen(process)}>
            Open Process
          </button>
        </>
      }
    >
      <div className="ap-view-body">
        <div className="ap-view-hero">
          <span className={`ap-status ${process.status === 'Live' ? 'live' : 'draft'}`}>
            <i />
            {process.status === 'Live' ? 'LIVE' : 'DRAFT'}
          </span>
          <div className="ap-view-meta">
            <span>
              <Users size={14} aria-hidden />
              {process.totalStudents} students
            </span>
            <span>
              <Layers3 size={14} aria-hidden />
              {process.steps.length} steps
            </span>
            <span>Due {process.dueDate || '—'}</span>
          </div>
        </div>

        <section className="ap-view-steps">
          <h3>
            <GitBranch size={15} aria-hidden />
            Workflow steps
          </h3>
          {process.steps.length === 0 ? (
            <p className="ap-view-empty">No steps yet. Open the process to build your workflow.</p>
          ) : (
            <ol className="ap-view-step-list">
              {process.steps.map((step, idx) => (
                <li key={step.id}>
                  <span className="ap-view-step-num">{idx + 1}</span>
                  <div>
                    <strong>{step.name}</strong>
                    <span>
                      {step.category ? `${step.category} · ` : ''}
                      {step.forms.length} form{step.forms.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </Modal>
  );
}
