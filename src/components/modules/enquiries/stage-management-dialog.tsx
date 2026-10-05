'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { EnquiryStageConfig, LostReason, StageIconKey } from '@/lib/enquiries/types';
import {
  createStageId,
  nextAvailableColor,
} from '@/lib/enquiries/stagesStore';
import { StagePipelinePreview } from './stage-pipeline-preview';
import { StageCard } from './stage-card';
import { StageFormDialog } from './stage-form-dialog';
import { LostReasonDialog } from './lost-reason-dialog';

type Props = {
  open: boolean;
  stages: EnquiryStageConfig[];
  lostReasons: LostReason[];
  onClose: () => void;
  onChangeStages: (stages: EnquiryStageConfig[]) => void;
  onChangeLostReasons: (reasons: LostReason[]) => void;
};

export const StageManagementDialog = memo(function StageManagementDialog({
  open,
  stages,
  lostReasons,
  onClose,
  onChangeStages,
  onChangeLostReasons,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EnquiryStageConfig | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnquiryStageConfig | null>(null);
  const [systemBlockOpen, setSystemBlockOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);

  const ordered = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  );

  const existingNames = useMemo(() => stages.map((s) => s.name), [stages]);

  const defaultColor = useMemo(
    () => nextAvailableColor(stages.map((s) => s.color)),
    [stages],
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((stage: EnquiryStageConfig) => {
    setEditing(stage);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const saveForm = useCallback(
    (payload: {
      name: string;
      color: string;
      icon: StageIconKey;
      description: string;
      active: boolean;
    }) => {
      if (editing) {
        onChangeStages(
          ordered.map((s) =>
            s.id === editing.id
              ? {
                  ...s,
                  name: editing.isSystem ? s.name : payload.name,
                  color: payload.color,
                  icon: payload.icon,
                  description: payload.description,
                  active: s.isSystem ? true : payload.active,
                }
              : s,
          ),
        );
      } else {
        onChangeStages([
          ...ordered,
          {
            id: createStageId(),
            name: payload.name,
            color: payload.color,
            icon: payload.icon,
            description: payload.description,
            active: payload.active,
            isSystem: false,
            order: ordered.length,
            enquiryCount: 0,
          },
        ]);
      }
      closeForm();
    },
    [closeForm, editing, onChangeStages, ordered],
  );

  const onDrop = useCallback(
    (index: number) => {
      if (dragIndex === null || dragIndex === index) {
        setDragIndex(null);
        return;
      }
      const next = [...ordered];
      const [moved] = next.splice(dragIndex, 1);
      if (!moved) {
        setDragIndex(null);
        return;
      }
      next.splice(index, 0, moved);
      onChangeStages(next.map((s, i) => ({ ...s, order: i })));
      setDragIndex(null);
    },
    [dragIndex, onChangeStages, ordered],
  );

  const requestDelete = useCallback((stage: EnquiryStageConfig) => {
    if (stage.isSystem) {
      setSystemBlockOpen(true);
      return;
    }
    setDeleteTarget(stage);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget || deleteTarget.isSystem) return;
    onChangeStages(ordered.filter((s) => s.id !== deleteTarget.id).map((s, i) => ({ ...s, order: i })));
    setDeleteTarget(null);
  }, [deleteTarget, onChangeStages, ordered]);

  const toggleActive = useCallback(
    (stage: EnquiryStageConfig) => {
      if (stage.isSystem) return;
      onChangeStages(
        ordered.map((s) => (s.id === stage.id ? { ...s, active: !s.active } : s)),
      );
    },
    [onChangeStages, ordered],
  );

  const lockSystemFields = Boolean(editing?.isSystem);

  return (
    <>
      <Modal
        open={open}
        title="Manage Stages"
        subtitle="Configure pipeline stages, colors, and lost reasons."
        onClose={onClose}
        elevated
        xl
        autoHeight
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
        }
      >
        <StagePipelinePreview stages={ordered} />

        <div className="enq-source-toolbar" style={{ marginTop: 16 }}>
          <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
            {ordered.length} stage{ordered.length === 1 ? '' : 's'} · drag cards to reorder
          </p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
            + Add Stage
          </button>
        </div>

        <div className="enq-stage-grid">
          {ordered.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              index={index}
              dragIndex={dragIndex}
              onDragStart={setDragIndex}
              onDrop={onDrop}
              onEdit={openEdit}
              onDelete={requestDelete}
              onConfigureLost={() => setLostOpen(true)}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      </Modal>

      {formOpen ? (
        <StageFormDialog
          key={formKey}
          open={formOpen}
          initial={editing}
          defaultColor={defaultColor}
          existingNames={existingNames}
          lockSystemFields={lockSystemFields}
          onClose={closeForm}
          onSave={saveForm}
        />
      ) : null}

      <LostReasonDialog
        open={lostOpen}
        reasons={lostReasons}
        onClose={() => setLostOpen(false)}
        onChange={onChangeLostReasons}
      />

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Stage?"
        onClose={() => setDeleteTarget(null)}
        elevated
        autoHeight
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
          This action cannot be undone.
          {deleteTarget ? (
            <>
              {' '}
              Remove <strong>{deleteTarget.name}</strong> from the pipeline?
            </>
          ) : null}
        </p>
      </Modal>

      <Modal
        open={systemBlockOpen}
        title="System Stage"
        onClose={() => setSystemBlockOpen(false)}
        elevated
        autoHeight
        footer={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setSystemBlockOpen(false)}
          >
            Got it
          </button>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
          This is a system stage and cannot be deleted.
        </p>
      </Modal>
    </>
  );
});
