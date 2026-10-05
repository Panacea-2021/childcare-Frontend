'use client';

import { Modal } from '@/components/ui/Modal';
import {
  ACTION_LABELS,
  STATUS_BADGE_CLASS,
  TRIGGER_LABELS,
  type MarketingAutomation,
} from './types';
import {
  FORM_OPTIONS,
  TOUR_OPTIONS,
  actionSummary,
  formatRelativeDate,
} from './mockData';

type Props = {
  open: boolean;
  automation: MarketingAutomation | null;
  onClose: () => void;
  onEdit: () => void;
};

function triggerDetail(a: MarketingAutomation): string {
  const t = a.trigger;
  if (!t.type) return '—';
  if (t.type === 'stage_change') return t.status ? `Status → ${t.status}` : TRIGGER_LABELS[t.type];
  if (t.type === 'tour_booked') {
    const tour = TOUR_OPTIONS.find((x) => x.id === t.tourId)?.label;
    return tour ? `Tour: ${tour}` : TRIGGER_LABELS[t.type];
  }
  const form = FORM_OPTIONS.find((x) => x.id === t.formId)?.label;
  return form ? `Form: ${form}` : TRIGGER_LABELS[t.type];
}

export function ViewAutomationModal({ open, automation, onClose, onEdit }: Props) {
  if (!automation) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={automation.name}
      subtitle="Automation details"
      wide
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onEdit}>
            Edit
          </button>
        </>
      }
    >
      <div className="ma-detail-stack">
        <div className="ma-review-card">
          <h4>Overview</h4>
          <div className="ma-review-row">
            <strong>Status</strong>
            <span className={STATUS_BADGE_CLASS[automation.status]}>{automation.status}</span>
          </div>
          <div className="ma-review-row">
            <strong>Runs</strong>
            <span>{automation.runs.toLocaleString()}</span>
          </div>
          <div className="ma-review-row">
            <strong>Updated</strong>
            <span>{formatRelativeDate(automation.updatedAt)}</span>
          </div>
          <div className="ma-review-row">
            <strong>Created by</strong>
            <span>{automation.createdBy}</span>
          </div>
          {automation.description ? (
            <div className="ma-review-row">
              <strong>About</strong>
              <span>{automation.description}</span>
            </div>
          ) : null}
        </div>

        <div className="ma-review-card">
          <h4>Trigger</h4>
          <div className="ma-review-row">
            <strong>Type</strong>
            <span>{automation.trigger.type ? TRIGGER_LABELS[automation.trigger.type] : '—'}</span>
          </div>
          <div className="ma-review-row">
            <strong>Detail</strong>
            <span>{triggerDetail(automation)}</span>
          </div>
          {automation.trigger.conditions.length > 0 ? (
            <>
              <div className="ma-review-row">
                <strong>Conditions</strong>
              </div>
              <ul className="ma-review-list">
                {automation.trigger.conditions.map((c, i) => (
                  <li key={c.id}>
                    {i > 0 ? 'AND ' : ''}
                    {c.field} {c.operator.replace('_', ' ')} {c.value || '—'}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <div className="ma-review-card">
          <h4>Actions ({actionSummary(automation.actions)})</h4>
          <ul className="ma-review-list">
            {automation.actions.map((a, i) => (
              <li key={a.id}>
                {i + 1}. {ACTION_LABELS[a.type]}
                {a.timing.mode === 'delay'
                  ? ` — after ${a.timing.amount} ${a.timing.unit}`
                  : ' — immediately'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
