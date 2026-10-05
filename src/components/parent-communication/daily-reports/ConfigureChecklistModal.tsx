'use client';

import { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ChecklistItemDef } from '@/types/dailyReport';
import { ADDABLE_CHECKLIST_PRESETS } from '@/lib/mock/mockDailyReports';
import { slugify } from './utils';

type Props = {
  open: boolean;
  checklist: ChecklistItemDef[];
  onClose: () => void;
  onSave: (next: ChecklistItemDef[]) => void;
};

function ChecklistRow({
  item,
  onToggle,
  onRename,
  onDelete,
}: {
  item: ChecklistItemDef;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={`dr-check-row${!item.enabled ? ' is-disabled' : ''}`}
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 32px rgba(31,41,55,0.12)' }}
    >
      <button
        type="button"
        className="dr-icon-btn"
        aria-label="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        style={{ cursor: 'grab' }}
      >
        <GripVertical size={16} />
      </button>

      <input
        className="dr-check-name-input"
        value={item.name}
        onChange={(e) => onRename(e.target.value)}
        aria-label="Checklist item name"
      />

      <button
        type="button"
        className={`dr-toggle${item.enabled ? ' is-on' : ''}`}
        aria-label={item.enabled ? 'Disable item' : 'Enable item'}
        onClick={onToggle}
      >
        <span />
      </button>

      <button
        type="button"
        className="dr-icon-btn"
        aria-label="Focus name field"
        title="Click the name to edit"
        onClick={(e) => {
          const input = (e.currentTarget.parentElement?.querySelector(
            '.dr-check-name-input',
          ) as HTMLInputElement | null) ?? null;
          input?.focus();
          input?.select();
        }}
      >
        <Pencil size={15} />
      </button>

      <button
        type="button"
        className="dr-icon-btn"
        aria-label="Delete item"
        onClick={onDelete}
        title={item.isSystem ? 'System items are disabled instead of deleted' : 'Delete custom item'}
      >
        <Trash2 size={15} />
      </button>
    </Reorder.Item>
  );
}

export function ConfigureChecklistModal({ open, checklist, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ChecklistItemDef[]>(() => checklist.map((c) => ({ ...c })));
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(checklist.map((c) => ({ ...c })));
    setNewName('');
  }, [open, checklist]);

  const reorder = (next: ChecklistItemDef[]) => {
    setDraft(next.map((item, index) => ({ ...item, order: index })));
  };

  const addItem = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `cl-custom-${Date.now()}`;
    setDraft((prev) => [
      ...prev,
      {
        id,
        name: trimmed,
        enabled: true,
        order: prev.length,
        isSystem: false,
        key: slugify(trimmed) || id,
      },
    ]);
    setNewName('');
  };

  return (
    <Modal
      open={open}
      title="Configure Checklist"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save Checklist
          </button>
        </>
      }
    >
      <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Enable, rename, reorder, or add checklist items. Changes update the Daily Reports table
        immediately after saving.
      </p>

      <Reorder.Group axis="y" values={draft} onReorder={reorder} className="dr-check-list">
        {draft.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            onToggle={() =>
              setDraft((prev) =>
                prev.map((c) => (c.id === item.id ? { ...c, enabled: !c.enabled } : c)),
              )
            }
            onRename={(name) =>
              setDraft((prev) => prev.map((c) => (c.id === item.id ? { ...c, name } : c)))
            }
            onDelete={() => {
              if (item.isSystem) {
                setDraft((prev) =>
                  prev.map((c) => (c.id === item.id ? { ...c, enabled: false } : c)),
                );
                return;
              }
              setDraft((prev) =>
                prev.filter((c) => c.id !== item.id).map((c, i) => ({ ...c, order: i })),
              );
            }}
          />
        ))}
      </Reorder.Group>

      <div className="dr-add-item-row">
        <div className="ui-field" style={{ flex: 1, margin: 0 }}>
          <label className="ui-label" htmlFor="dr-new-item">
            Add New Checklist Item
          </label>
          <input
            id="dr-new-item"
            className="ui-input"
            placeholder="e.g. Homework, Swimming, Dance…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem(newName);
              }
            }}
          />
        </div>
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          style={{ alignSelf: 'flex-end' }}
          onClick={() => addItem(newName)}
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="dr-presets">
        {ADDABLE_CHECKLIST_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="dr-preset-chip"
            onClick={() => addItem(preset)}
          >
            + {preset}
          </button>
        ))}
      </div>
    </Modal>
  );
}
