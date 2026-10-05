'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ActionType, AutomationAction, DelayUnit } from './types';
import {
  ACTION_TYPE_OPTIONS,
  COUNSELOR_OPTIONS,
  EMAIL_TEMPLATES,
  ENQUIRY_STATUS_OPTIONS,
  SMS_TEMPLATES,
  TAG_OPTIONS,
  TOUR_OPTIONS,
  WHATSAPP_TEMPLATES,
  newAction,
} from './mockData';

type Props = {
  actions: AutomationAction[];
  onChange: (next: AutomationAction[]) => void;
};

export function ActionsStep({ actions, onChange }: Props) {
  const [preview, setPreview] = useState<{ title: string; body: string; subject?: string } | null>(
    null,
  );

  const update = (id: string, patch: Partial<AutomationAction>) => {
    onChange(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const remove = (id: string) => {
    onChange(actions.filter((a) => a.id !== id));
  };

  const add = () => {
    onChange([...actions, newAction('send_whatsapp')]);
  };

  return (
    <div>
      <p className="ma-when-kicker">Then</p>
      <h2 className="ma-section-title">Choose what should happen</h2>
      <p className="ma-section-desc">Add one or more actions for this automation.</p>

      <div className="ma-action-list">
        {actions.length === 0 ? (
          <div className="ma-empty">No actions yet. Add your first action below.</div>
        ) : null}

        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            index={index}
            action={action}
            onChange={(patch) => update(action.id, patch)}
            onRemove={() => remove(action.id)}
            onPreview={setPreview}
          />
        ))}
      </div>

      <button type="button" className="ma-link-btn" style={{ marginTop: '1rem' }} onClick={add}>
        <Plus size={15} /> Add Action
      </button>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? 'Preview'}
        elevated
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPreview(null)}>
            Close
          </button>
        }
      >
        {preview?.subject ? (
          <p style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>{preview.subject}</p>
        ) : null}
        <div className="ma-preview-box">{preview?.body}</div>
      </Modal>
    </div>
  );
}

function ActionCard({
  index,
  action,
  onChange,
  onRemove,
  onPreview,
}: {
  index: number;
  action: AutomationAction;
  onChange: (patch: Partial<AutomationAction>) => void;
  onRemove: () => void;
  onPreview: (p: { title: string; body: string; subject?: string }) => void;
}) {
  const smsBody = useMemo(() => {
    const tpl = SMS_TEMPLATES.find((t) => t.id === action.templateId);
    return tpl?.body ?? action.body ?? '';
  }, [action.templateId, action.body]);

  const setType = (type: ActionType) => {
    onChange({
      type,
      templateId: undefined,
      subject: undefined,
      body: undefined,
      taskTitle: undefined,
      taskAssignee: undefined,
      counselorId: undefined,
      notificationMessage: undefined,
      stage: undefined,
      tag: undefined,
      appointmentType: undefined,
      timing: { mode: 'immediate' },
      waitAmount: 1,
      waitUnit: 'days',
    });
  };

  const timingMode = action.timing.mode;
  const delayAmount = action.timing.mode === 'delay' ? action.timing.amount : 1;
  const delayUnit: DelayUnit = action.timing.mode === 'delay' ? action.timing.unit : 'days';

  return (
    <article className="ma-action-card">
      <div className="ma-action-card-head">
        <h4>Action {index + 1}</h4>
        <button type="button" className="ma-icon-btn" aria-label="Remove action" onClick={onRemove}>
          <Trash2 size={15} />
        </button>
      </div>

      <div className="ma-action-fields">
        <div className="ui-field">
          <label className="ui-label">Action</label>
          <select
            className="ui-select"
            value={action.type}
            onChange={(e) => setType(e.target.value as ActionType)}
          >
            {ACTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {action.type === 'send_whatsapp' ? (
          <>
            <div className="ui-field">
              <label className="ui-label">WhatsApp Template</label>
              <select
                className="ui-select"
                value={action.templateId ?? ''}
                onChange={(e) => onChange({ templateId: e.target.value })}
              >
                <option value="">Select WhatsApp Template</option>
                {WHATSAPP_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <TimingFields
              mode={timingMode}
              amount={delayAmount}
              unit={delayUnit}
              onMode={(mode) =>
                onChange({
                  timing:
                    mode === 'immediate'
                      ? { mode: 'immediate' }
                      : { mode: 'delay', amount: delayAmount, unit: delayUnit },
                })
              }
              onAmount={(amount) =>
                onChange({ timing: { mode: 'delay', amount, unit: delayUnit } })
              }
              onUnit={(unit) =>
                onChange({ timing: { mode: 'delay', amount: delayAmount, unit } })
              }
            />
            <div className="span-2">
              <button
                type="button"
                className="ma-link-btn"
                disabled={!action.templateId}
                onClick={() => {
                  const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === action.templateId);
                  if (!tpl) return;
                  onPreview({ title: 'WhatsApp Preview', body: tpl.body });
                }}
              >
                Preview Template
              </button>
            </div>
          </>
        ) : null}

        {action.type === 'send_email' ? (
          <>
            <div className="ui-field">
              <label className="ui-label">Email Template</label>
              <select
                className="ui-select"
                value={action.templateId ?? ''}
                onChange={(e) => {
                  const tpl = EMAIL_TEMPLATES.find((t) => t.id === e.target.value);
                  onChange({
                    templateId: e.target.value,
                    subject: tpl?.subject ?? '',
                    body: tpl?.body ?? '',
                  });
                }}
              >
                <option value="">Select Email Template</option>
                {EMAIL_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-field">
              <label className="ui-label">Subject</label>
              <input className="ui-input" value={action.subject ?? ''} readOnly />
            </div>
            <TimingFields
              mode={timingMode}
              amount={delayAmount}
              unit={delayUnit}
              onMode={(mode) =>
                onChange({
                  timing:
                    mode === 'immediate'
                      ? { mode: 'immediate' }
                      : { mode: 'delay', amount: delayAmount, unit: delayUnit },
                })
              }
              onAmount={(amount) =>
                onChange({ timing: { mode: 'delay', amount, unit: delayUnit } })
              }
              onUnit={(unit) =>
                onChange({ timing: { mode: 'delay', amount: delayAmount, unit } })
              }
            />
            <div className="span-2">
              <button
                type="button"
                className="ma-link-btn"
                disabled={!action.templateId}
                onClick={() => {
                  const tpl = EMAIL_TEMPLATES.find((t) => t.id === action.templateId);
                  if (!tpl) return;
                  onPreview({ title: 'Email Preview', body: tpl.body, subject: tpl.subject });
                }}
              >
                Preview Email
              </button>
            </div>
          </>
        ) : null}

        {action.type === 'send_sms' ? (
          <>
            <div className="ui-field">
              <label className="ui-label">SMS Template</label>
              <select
                className="ui-select"
                value={action.templateId ?? ''}
                onChange={(e) => {
                  const tpl = SMS_TEMPLATES.find((t) => t.id === e.target.value);
                  onChange({ templateId: e.target.value, body: tpl?.body ?? '' });
                }}
              >
                <option value="">Select SMS Template</option>
                {SMS_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <TimingFields
              mode={timingMode}
              amount={delayAmount}
              unit={delayUnit}
              onMode={(mode) =>
                onChange({
                  timing:
                    mode === 'immediate'
                      ? { mode: 'immediate' }
                      : { mode: 'delay', amount: delayAmount, unit: delayUnit },
                })
              }
              onAmount={(amount) =>
                onChange({ timing: { mode: 'delay', amount, unit: delayUnit } })
              }
              onUnit={(unit) =>
                onChange({ timing: { mode: 'delay', amount: delayAmount, unit } })
              }
            />
            {action.templateId ? (
              <div className="span-2">
                <div className="ma-preview-box">{smsBody}</div>
                <div className="ma-char-count">{smsBody.length} / 160 characters</div>
              </div>
            ) : null}
          </>
        ) : null}

        {action.type === 'create_task' ? (
          <>
            <div className="ui-field">
              <label className="ui-label">Task Title</label>
              <input
                className="ui-input"
                value={action.taskTitle ?? ''}
                onChange={(e) => onChange({ taskTitle: e.target.value })}
                placeholder="e.g. Call interested lead"
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Assignee</label>
              <select
                className="ui-select"
                value={action.taskAssignee ?? ''}
                onChange={(e) => onChange({ taskAssignee: e.target.value })}
              >
                <option value="">Select Assignee</option>
                {COUNSELOR_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <TimingFields
              mode={timingMode}
              amount={delayAmount}
              unit={delayUnit}
              onMode={(mode) =>
                onChange({
                  timing:
                    mode === 'immediate'
                      ? { mode: 'immediate' }
                      : { mode: 'delay', amount: delayAmount, unit: delayUnit },
                })
              }
              onAmount={(amount) =>
                onChange({ timing: { mode: 'delay', amount, unit: delayUnit } })
              }
              onUnit={(unit) =>
                onChange({ timing: { mode: 'delay', amount: delayAmount, unit } })
              }
            />
          </>
        ) : null}

        {action.type === 'assign_counselor' ? (
          <div className="ui-field">
            <label className="ui-label">Counselor</label>
            <select
              className="ui-select"
              value={action.counselorId ?? ''}
              onChange={(e) => onChange({ counselorId: e.target.value })}
            >
              <option value="">Select Counselor</option>
              {COUNSELOR_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {action.type === 'send_notification' ? (
          <div className="ui-field span-2">
            <label className="ui-label">Notification Message</label>
            <input
              className="ui-input"
              value={action.notificationMessage ?? ''}
              onChange={(e) => onChange({ notificationMessage: e.target.value })}
              placeholder="Internal message for staff"
            />
          </div>
        ) : null}

        {action.type === 'update_stage' ? (
          <div className="ui-field">
            <label className="ui-label">New Stage</label>
            <select
              className="ui-select"
              value={action.stage ?? ''}
              onChange={(e) => onChange({ stage: e.target.value })}
            >
              <option value="">Select Stage</option>
              {ENQUIRY_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {action.type === 'add_tag' ? (
          <div className="ui-field">
            <label className="ui-label">Tag</label>
            <select
              className="ui-select"
              value={action.tag ?? ''}
              onChange={(e) => onChange({ tag: e.target.value })}
            >
              <option value="">Select Tag</option>
              {TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {action.type === 'create_appointment' ? (
          <div className="ui-field">
            <label className="ui-label">Appointment Type</label>
            <select
              className="ui-select"
              value={action.appointmentType ?? ''}
              onChange={(e) => onChange({ appointmentType: e.target.value })}
            >
              <option value="">Select Type</option>
              {TOUR_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {action.type === 'wait_delay' ? (
          <div className="ui-field span-2">
            <label className="ui-label">Wait for</label>
            <div className="ma-timing-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <input
                className="ui-input"
                type="number"
                min={1}
                value={action.waitAmount ?? 1}
                onChange={(e) => onChange({ waitAmount: Number(e.target.value) || 1 })}
              />
              <select
                className="ui-select"
                value={action.waitUnit ?? 'days'}
                onChange={(e) => onChange({ waitUnit: e.target.value as DelayUnit })}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TimingFields({
  mode,
  amount,
  unit,
  onMode,
  onAmount,
  onUnit,
}: {
  mode: 'immediate' | 'delay';
  amount: number;
  unit: DelayUnit;
  onMode: (mode: 'immediate' | 'delay') => void;
  onAmount: (n: number) => void;
  onUnit: (u: DelayUnit) => void;
}) {
  return (
    <div className="ui-field span-2">
      <label className="ui-label">Timing</label>
      <div className="ma-timing-row">
        <select
          className="ui-select"
          value={mode}
          onChange={(e) => onMode(e.target.value as 'immediate' | 'delay')}
        >
          <option value="immediate">Immediately</option>
          <option value="delay">After Delay</option>
        </select>
        {mode === 'delay' ? (
          <>
            <input
              className="ui-input"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => onAmount(Number(e.target.value) || 1)}
            />
            <select
              className="ui-select"
              value={unit}
              onChange={(e) => onUnit(e.target.value as DelayUnit)}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function areActionsComplete(actions: AutomationAction[]): boolean {
  if (!actions.length) return false;
  return actions.every((a) => {
    switch (a.type) {
      case 'send_whatsapp':
      case 'send_email':
      case 'send_sms':
        return Boolean(a.templateId);
      case 'create_task':
        return Boolean(a.taskTitle?.trim());
      case 'assign_counselor':
        return Boolean(a.counselorId);
      case 'send_notification':
        return Boolean(a.notificationMessage?.trim());
      case 'update_stage':
        return Boolean(a.stage);
      case 'add_tag':
        return Boolean(a.tag);
      case 'create_appointment':
        return Boolean(a.appointmentType);
      case 'wait_delay':
        return Boolean(a.waitAmount && a.waitAmount > 0);
      default:
        return true;
    }
  });
}
