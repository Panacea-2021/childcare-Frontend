'use client';

import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  Layers,
  Pencil,
  Users,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { FormItem } from './types';

type Props = {
  open: boolean;
  form: FormItem | null;
  onClose: () => void;
  onEdit: (form: FormItem) => void;
  onOpenSubmissions: (form: FormItem) => void;
};

export function ViewFormModal({ open, form, onClose, onEdit, onOpenSubmissions }: Props) {
  if (!form) return null;

  const { submitted, rejected, changesRequested, pendingReview } = form.analytics;

  return (
    <Modal
      open={open}
      title={form.name}
      subtitle="Form overview and submission analytics"
      icon={<Eye size={18} />}
      lg
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => onEdit(form)}>
            <Pencil size={15} aria-hidden />
            Edit
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => onOpenSubmissions(form)}
          >
            View Submissions
          </button>
        </>
      }
    >
      <div className="fvm-body">
        <section className="fvm-section fvm-hero">
          <div className="fvm-hero-top">
            <span className={`forms-badge ${form.status === 'Live' ? 'forms-badge-live' : 'forms-badge-draft'}`}>
              {form.status === 'Live' ? 'LIVE' : 'DRAFT'}
            </span>
            <span className="fvm-chip">
              <Layers size={13} aria-hidden />
              {form.type}
            </span>
            <span className="fvm-chip">
              <FolderKanban size={13} aria-hidden />
              {form.category}
            </span>
          </div>
          <div className="fvm-meta-row">
            <span>Created {form.date}</span>
            {form.durationMin != null ? (
              <span>
                <Clock3 size={13} aria-hidden />
                {form.durationMin} min
              </span>
            ) : null}
            {form.sharedWith != null ? (
              <span>
                <Users size={13} aria-hidden />
                Shared with {form.sharedWith}
              </span>
            ) : null}
            {form.openUntil ? <span>Open until {form.openUntil}</span> : null}
          </div>
        </section>

        <section className="fvm-section">
          <h3 className="fvm-section-title">Analytics</h3>
          <div className="fvm-stats">
            <article className="fvm-stat is-ok">
              <CheckCircle2 size={18} aria-hidden />
              <div>
                <strong>{submitted}</strong>
                <span>Approved</span>
              </div>
            </article>
            <article className="fvm-stat is-bad">
              <XCircle size={18} aria-hidden />
              <div>
                <strong>{rejected}</strong>
                <span>Rejected</span>
              </div>
            </article>
            <article className="fvm-stat is-doc">
              <FileText size={18} aria-hidden />
              <div>
                <strong>{changesRequested}</strong>
                <span>Changes requested</span>
              </div>
            </article>
            <article className="fvm-stat is-time">
              <Clock3 size={18} aria-hidden />
              <div>
                <strong>{pendingReview}</strong>
                <span>Pending review</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </Modal>
  );
}
