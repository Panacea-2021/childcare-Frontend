'use client';

import { Check, CalendarDays, ClipboardList, RefreshCw, Plus, Trash2 } from 'lucide-react';
import type { AutomationCondition, AutomationTrigger, TriggerType } from './types';
import {
  CONDITION_FIELDS,
  CONDITION_OPERATORS,
  ENQUIRY_STATUS_OPTIONS,
  FORM_OPTIONS,
  TOUR_OPTIONS,
  newCondition,
} from './mockData';

type Props = {
  trigger: AutomationTrigger;
  onChange: (next: AutomationTrigger) => void;
};

const CARDS: {
  type: TriggerType;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'stage_change',
    title: 'Stage Change',
    description: 'When an enquiry stage changes',
    icon: <RefreshCw size={20} />,
  },
  {
    type: 'tour_booked',
    title: 'Tour Booked',
    description: 'When a tour is scheduled',
    icon: <CalendarDays size={20} />,
  },
  {
    type: 'form_submission',
    title: 'Form Submission',
    description: 'When a form is submitted',
    icon: <ClipboardList size={20} />,
  },
];

export function TriggerStep({ trigger, onChange }: Props) {
  const selectType = (type: TriggerType) => {
    onChange({
      type,
      status: type === 'stage_change' ? trigger.status : undefined,
      tourId: type === 'tour_booked' ? trigger.tourId : undefined,
      formId: type === 'form_submission' ? trigger.formId : undefined,
      formAsSource: type === 'stage_change' ? trigger.formAsSource : undefined,
      conditions: trigger.conditions,
    });
  };

  const updateCondition = (id: string, patch: Partial<AutomationCondition>) => {
    onChange({
      ...trigger,
      conditions: trigger.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const removeCondition = (id: string) => {
    onChange({
      ...trigger,
      conditions: trigger.conditions.filter((c) => c.id !== id),
    });
  };

  const addCondition = () => {
    onChange({
      ...trigger,
      conditions: [...trigger.conditions, newCondition()],
    });
  };

  return (
    <div>
      <p className="ma-when-kicker">When</p>
      <h2 className="ma-section-title">Choose a Trigger</h2>
      <p className="ma-section-desc">What should start this automation?</p>

      <div className="ma-trigger-grid">
        {CARDS.map((card) => {
          const selected = trigger.type === card.type;
          return (
            <button
              key={card.type}
              type="button"
              className={`ma-trigger-card${selected ? ' is-selected' : ''}`}
              onClick={() => selectType(card.type)}
            >
              {selected ? (
                <span className="ma-trigger-check" aria-hidden>
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : null}
              <span className="ma-trigger-icon" aria-hidden>
                {card.icon}
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </button>
          );
        })}
      </div>

      {trigger.type === 'stage_change' ? (
        <div className="ma-config-block">
          <h4>Status Change</h4>
          <p>When enquiry status gets updated to</p>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ma-status">
              Select Status
            </label>
            <select
              id="ma-status"
              className="ui-select"
              value={trigger.status ?? ''}
              onChange={(e) => onChange({ ...trigger, status: e.target.value })}
            >
              <option value="">Select Status</option>
              {ENQUIRY_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {trigger.formAsSource !== undefined ? (
            <div className="ui-field">
              <label className="ui-label" htmlFor="ma-form-source">
                Select Form
              </label>
              <select
                id="ma-form-source"
                className="ui-select"
                value={trigger.formAsSource ?? ''}
                onChange={(e) => onChange({ ...trigger, formAsSource: e.target.value })}
              >
                <option value="">Select Form</option>
                {FORM_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              type="button"
              className="ma-link-btn"
              onClick={() => onChange({ ...trigger, formAsSource: '' })}
            >
              <Plus size={15} /> Add form as source
            </button>
          )}

          <ConditionsBlock
            conditions={trigger.conditions}
            onAdd={addCondition}
            onUpdate={updateCondition}
            onRemove={removeCondition}
          />
        </div>
      ) : null}

      {trigger.type === 'tour_booked' ? (
        <div className="ma-config-block">
          <h4>Tour Booked</h4>
          <p>When enquiry books a tour in</p>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ma-tour">
              Select Tour
            </label>
            <select
              id="ma-tour"
              className="ui-select"
              value={trigger.tourId ?? ''}
              onChange={(e) => onChange({ ...trigger, tourId: e.target.value })}
            >
              <option value="">Select Tour</option>
              {TOUR_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <ConditionsBlock
            conditions={trigger.conditions}
            onAdd={addCondition}
            onUpdate={updateCondition}
            onRemove={removeCondition}
          />
        </div>
      ) : null}

      {trigger.type === 'form_submission' ? (
        <div className="ma-config-block">
          <h4>Form Submission</h4>
          <p>When enquiry is captured from form</p>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ma-form">
              Select Form
            </label>
            <select
              id="ma-form"
              className="ui-select"
              value={trigger.formId ?? ''}
              onChange={(e) => onChange({ ...trigger, formId: e.target.value })}
            >
              <option value="">Select Form</option>
              {FORM_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <ConditionsBlock
            conditions={trigger.conditions}
            onAdd={addCondition}
            onUpdate={updateCondition}
            onRemove={removeCondition}
          />
        </div>
      ) : null}
    </div>
  );
}

function ConditionsBlock({
  conditions,
  onAdd,
  onUpdate,
  onRemove,
}: {
  conditions: AutomationCondition[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<AutomationCondition>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="ma-conditions">
      <button type="button" className="ma-link-btn" onClick={onAdd}>
        <Plus size={15} /> Add Condition
      </button>
      {conditions.map((c, index) => (
        <div key={c.id}>
          {index > 0 ? <div className="ma-and">AND</div> : null}
          <div className="ma-condition-row">
            <select
              className="ui-select"
              value={c.field}
              aria-label="Condition field"
              onChange={(e) => onUpdate(c.id, { field: e.target.value })}
            >
              {CONDITION_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              className="ui-select"
              value={c.operator}
              aria-label="Condition operator"
              onChange={(e) =>
                onUpdate(c.id, { operator: e.target.value as AutomationCondition['operator'] })
              }
            >
              {CONDITION_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            <input
              className="ui-input"
              value={c.value}
              placeholder="Value"
              aria-label="Condition value"
              onChange={(e) => onUpdate(c.id, { value: e.target.value })}
            />
            <button
              type="button"
              className="ma-icon-btn"
              aria-label="Remove condition"
              onClick={() => onRemove(c.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function isTriggerComplete(trigger: AutomationTrigger): boolean {
  if (!trigger.type) return false;
  if (trigger.type === 'stage_change') return Boolean(trigger.status);
  if (trigger.type === 'tour_booked') return Boolean(trigger.tourId);
  if (trigger.type === 'form_submission') return Boolean(trigger.formId);
  return false;
}
