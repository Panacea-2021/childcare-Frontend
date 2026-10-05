'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  createSourceId,
  createSubSourceId,
} from '@/lib/enquiries/sourcesStore';
import type { EnquirySource, SubSource } from '@/lib/enquiries/types';
import { SourceForm } from './source-form';
import { SourceList } from './source-list';

type Props = {
  open: boolean;
  sources: EnquirySource[];
  onClose: () => void;
  onChange: (sources: EnquirySource[]) => void;
};

export const SourceManagementDialog = memo(function SourceManagementDialog({
  open,
  sources,
  onClose,
  onChange,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EnquirySource | null>(null);
  const [viewing, setViewing] = useState<EnquirySource | null>(null);
  const [formKey, setFormKey] = useState(0);

  const existingNames = useMemo(() => sources.map((s) => s.name), [sources]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((source: EnquirySource) => {
    setEditing(source);
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
      status: EnquirySource['status'];
      subSources: SubSource[];
    }) => {
      const ts = new Date().toISOString();
      if (editing) {
        onChange(
          sources.map((s) =>
            s.id === editing.id
              ? {
                  ...s,
                  name: payload.name,
                  status: payload.status,
                  subSources: payload.subSources,
                  updatedAt: ts,
                }
              : s,
          ),
        );
      } else {
        onChange([
          {
            id: createSourceId(),
            name: payload.name,
            status: payload.status,
            subSources: payload.subSources.length
              ? payload.subSources
              : [{ id: createSubSourceId(), name: 'General' }],
            createdAt: ts,
            updatedAt: ts,
          },
          ...sources,
        ]);
      }
      closeForm();
    },
    [closeForm, editing, onChange, sources],
  );

  const deleteSource = useCallback(
    (source: EnquirySource) => {
      const ok = window.confirm(
        `Delete source "${source.name}" and all of its sub sources?`,
      );
      if (!ok) return;
      onChange(sources.filter((s) => s.id !== source.id));
      if (viewing?.id === source.id) setViewing(null);
    },
    [onChange, sources, viewing?.id],
  );

  return (
    <>
      <Modal
        open={open}
        title="Manage Sources"
        subtitle="Create and maintain enquiry sources with at least one sub source each."
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
        <div className="enq-source-toolbar">
          <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
            {sources.length} source{sources.length === 1 ? '' : 's'} configured
          </p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
            + Add Source
          </button>
        </div>
        <SourceList
          sources={sources}
          onEdit={openEdit}
          onDelete={deleteSource}
          onViewSubs={setViewing}
        />
      </Modal>

      {formOpen ? (
        <SourceForm
          key={formKey}
          open={formOpen}
          initial={editing}
          existingNames={existingNames}
          onClose={closeForm}
          onSave={saveForm}
        />
      ) : null}

      <Modal
        open={Boolean(viewing)}
        title={viewing ? `${viewing.name} — Sub Sources` : 'Sub Sources'}
        onClose={() => setViewing(null)}
        elevated
        autoHeight
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setViewing(null)}
            >
              Close
            </button>
            {viewing ? (
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => {
                  const current = viewing;
                  setViewing(null);
                  openEdit(current);
                }}
              >
                Edit
              </button>
            ) : null}
          </>
        }
      >
        {viewing ? (
          <div className="enq-chip-list">
            {viewing.subSources.map((sub) => (
              <span key={sub.id} className="enq-chip">
                {sub.name}
              </span>
            ))}
          </div>
        ) : null}
      </Modal>
    </>
  );
});
