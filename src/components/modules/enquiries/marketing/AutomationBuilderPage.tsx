'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import '@/components/ui/module.css';
import './automations.css';
import { TriggerStep, isTriggerComplete } from './TriggerStep';
import { ActionsStep, areActionsComplete } from './ActionsStep';
import { ReviewStep } from './ReviewStep';
import { emptyTrigger, newAction, cloneIds } from './mockData';
import type {
  AutomationAction,
  AutomationStatus,
  AutomationTrigger,
  BuilderStep,
  MarketingAutomation,
} from './types';
import {
  createAutomationId,
  loadAutomations,
  loadTemplates,
  saveAutomations,
  saveTemplates,
} from '@/lib/enquiries/marketingAutomationsStore';

type Draft = {
  id: string | null;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  templateId?: string;
};

function blankDraft(): Draft {
  return {
    id: null,
    name: '',
    description: '',
    trigger: emptyTrigger(),
    actions: [newAction('send_whatsapp')],
  };
}

export function AutomationBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const templateId = searchParams.get('templateId');

  const [step, setStep] = useState<BuilderStep>(1);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const autos = loadAutomations();
    const templates = loadTemplates();

    if (editId) {
      const found = autos.find((a) => a.id === editId);
      if (found) {
        setDraft({
          id: found.id,
          name: found.name,
          description: found.description ?? '',
          trigger: structuredClone(found.trigger),
          actions: structuredClone(found.actions),
          templateId: found.templateId,
        });
        setReady(true);
        return;
      }
    }

    if (templateId) {
      const tpl = templates.find((t) => t.id === templateId);
      if (tpl) {
        setDraft({
          id: null,
          name: `${tpl.name} (Copy)`,
          description: tpl.description,
          trigger: structuredClone(tpl.trigger),
          actions: cloneIds(structuredClone(tpl.actions), 'act'),
          templateId: tpl.id,
        });
        setReady(true);
        return;
      }
    }

    setDraft(blankDraft());
    setReady(true);
  }, [editId, templateId]);

  const canContinue = useMemo(() => {
    if (step === 1) return isTriggerComplete(draft.trigger);
    if (step === 2) return areActionsComplete(draft.actions);
    return draft.name.trim().length > 0;
  }, [step, draft]);

  const persist = (status: AutomationStatus) => {
    const now = new Date().toISOString();
    const autos = loadAutomations();
    const id = draft.id ?? createAutomationId();
    const existing = autos.find((a) => a.id === id);

    const next: MarketingAutomation = {
      id,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      status,
      trigger: draft.trigger,
      actions: draft.actions,
      runs: existing?.runs ?? 0,
      createdBy: existing?.createdBy ?? 'You',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      templateId: draft.templateId,
    };

    const list = existing
      ? autos.map((a) => (a.id === id ? next : a))
      : [next, ...autos];
    saveAutomations(list);

    if (draft.templateId && !existing) {
      const templates = loadTemplates().map((t) =>
        t.id === draft.templateId ? { ...t, uses: t.uses + 1, updatedAt: now } : t,
      );
      saveTemplates(templates);
    }

    router.push('/enquiries/marketing');
  };

  if (!ready) {
    return <div className="shell-loading">Loading…</div>;
  }

  return (
    <div className="mod-page ma-page ma-builder">
      <PageHeader
        crumbs={['Marketing', 'Automations', draft.id ? 'Edit' : 'Create']}
        title={draft.id ? 'Edit Automation' : 'Create Automation'}
        description="Configure trigger, actions, and review before saving."
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => router.push('/enquiries/marketing')}
          >
            Cancel
          </button>
        }
      />

      <div className="ma-builder-shell">
        <div className="ma-step-header">
          <div className="ma-stepper" aria-label="Builder progress">
            <StepPill n={1} label="Trigger" current={step} />
            <span className={`ma-step-line${step > 1 ? ' is-done' : ''}`} />
            <StepPill n={2} label="Actions" current={step} />
            <span className={`ma-step-line${step > 2 ? ' is-done' : ''}`} />
            <StepPill n={3} label="Review" current={step} />
          </div>
        </div>

        <div className="ma-builder-body">
          {step === 1 ? (
            <TriggerStep
              trigger={draft.trigger}
              onChange={(trigger) => setDraft((d) => ({ ...d, trigger }))}
            />
          ) : null}
          {step === 2 ? (
            <ActionsStep
              actions={draft.actions}
              onChange={(actions) => setDraft((d) => ({ ...d, actions }))}
            />
          ) : null}
          {step === 3 ? (
            <ReviewStep
              name={draft.name}
              description={draft.description}
              trigger={draft.trigger}
              actions={draft.actions}
              onNameChange={(name) => setDraft((d) => ({ ...d, name }))}
              onDescriptionChange={(description) => setDraft((d) => ({ ...d, description }))}
            />
          ) : null}
        </div>

        <div className="ma-builder-footer">
          <div>
            {step > 1 ? (
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as BuilderStep)))}
              >
                Back
              </button>
            ) : null}
          </div>
          <div className="ma-builder-footer-right">
            {step < 3 ? (
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={!canContinue}
                onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as BuilderStep)))}
              >
                Continue
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  disabled={!canContinue}
                  onClick={() => persist('Draft')}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  disabled={!canContinue}
                  onClick={() => persist('Active')}
                >
                  Activate Automation
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPill({
  n,
  label,
  current,
}: {
  n: BuilderStep;
  label: string;
  current: BuilderStep;
}) {
  const done = current > n;
  const active = current === n;
  return (
    <div className={`ma-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
      <span className="ma-step-num" aria-hidden>
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </span>
      <span>{label}</span>
    </div>
  );
}
