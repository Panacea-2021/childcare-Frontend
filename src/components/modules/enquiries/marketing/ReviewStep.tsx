'use client';

import {
  ACTION_LABELS,
  TRIGGER_LABELS,
  type AutomationAction,
  type AutomationTrigger,
} from './types';
import { FORM_OPTIONS, TOUR_OPTIONS } from './mockData';

type Props = {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
};

function triggerLabel(trigger: AutomationTrigger): string {
  if (!trigger.type) return 'Not set';
  const base = TRIGGER_LABELS[trigger.type];
  if (trigger.type === 'stage_change' && trigger.status) return `${base}: ${trigger.status}`;
  if (trigger.type === 'tour_booked' && trigger.tourId) {
    const tour = TOUR_OPTIONS.find((t) => t.id === trigger.tourId)?.label;
    return tour ? `${base}: ${tour}` : base;
  }
  if (trigger.type === 'form_submission' && trigger.formId) {
    const form = FORM_OPTIONS.find((f) => f.id === trigger.formId)?.label;
    return form ? `${base}: ${form}` : base;
  }
  return base;
}

function actionTimingLabel(action: AutomationAction): string {
  if (action.type === 'wait_delay') {
    return `Wait ${action.waitAmount ?? 1} ${action.waitUnit ?? 'days'}`;
  }
  if (action.timing.mode === 'delay') {
    return `After ${action.timing.amount} ${action.timing.unit}`;
  }
  return 'Immediately';
}

export function ReviewStep({
  name,
  description,
  trigger,
  actions,
  onNameChange,
  onDescriptionChange,
}: Props) {
  return (
    <div>
      <p className="ma-when-kicker">Review</p>
      <h2 className="ma-section-title">Review &amp; activate</h2>
      <p className="ma-section-desc">Confirm the details, then save as draft or activate.</p>

      <div className="ui-grid-2" style={{ marginBottom: '1.15rem' }}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="ma-name">
            Automation Name
          </label>
          <input
            id="ma-name"
            className="ui-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Interested Lead Follow-up"
          />
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor="ma-desc">
            Description (optional)
          </label>
          <input
            id="ma-desc"
            className="ui-input"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Short summary for your team"
          />
        </div>
      </div>

      <div className="ma-review-grid">
        <div className="ma-review-card">
          <h4>Trigger</h4>
          <div className="ma-review-row">
            <strong>When</strong>
            <span>{triggerLabel(trigger)}</span>
          </div>
          {trigger.formAsSource ? (
            <div className="ma-review-row">
              <strong>Form source</strong>
              <span>
                {FORM_OPTIONS.find((f) => f.id === trigger.formAsSource)?.label ??
                  trigger.formAsSource}
              </span>
            </div>
          ) : null}
          {trigger.conditions.length > 0 ? (
            <ul className="ma-review-list">
              {trigger.conditions.map((c, i) => (
                <li key={c.id}>
                  {i > 0 ? 'AND ' : ''}
                  {c.field} {c.operator.replace('_', ' ')} {c.value || '—'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ma-muted" style={{ margin: 0 }}>
              No additional conditions
            </p>
          )}
        </div>

        <div className="ma-review-card">
          <h4>Actions</h4>
          <ul className="ma-review-list">
            {actions.map((a, i) => (
              <li key={a.id}>
                {i + 1}. {ACTION_LABELS[a.type]} — {actionTimingLabel(a)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
