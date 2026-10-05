'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type { CustomFieldDef } from './types';

type CategoryBlockProps = {
  title: string;
  category: CustomFieldDef['category'];
  fields: CustomFieldDef[];
  onAdd: (category: CustomFieldDef['category']) => void;
  onEdit: (field: CustomFieldDef) => void;
  onDelete: (id: string) => void;
  onReorder: (category: CustomFieldDef['category'], from: number, to: number) => void;
};

export const CustomFields = memo(function CustomFields({
  fields,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: {
  fields: CustomFieldDef[];
  onAdd: (category: CustomFieldDef['category']) => void;
  onEdit: (field: CustomFieldDef) => void;
  onDelete: (id: string) => void;
  onReorder: (category: CustomFieldDef['category'], from: number, to: number) => void;
}) {
  const groups = useMemo(
    () =>
      (
        [
          { key: 'child' as const, title: 'Child Information' },
          { key: 'enquiry' as const, title: 'Enquiry Information' },
          { key: 'parent' as const, title: 'Parent Information' },
        ] as const
      ).map((g) => ({
        ...g,
        items: fields.filter((f) => f.category === g.key),
      })),
    [fields],
  );

  return (
    <div>
      {groups.map((g) => (
        <CategoryBlock
          key={g.key}
          title={g.title}
          category={g.key}
          fields={g.items}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
});

const CategoryBlock = memo(function CategoryBlock({
  title,
  category,
  fields,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: CategoryBlockProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    (to: number) => {
      if (dragIndex === null || dragIndex === to) return;
      onReorder(category, dragIndex, to);
      setDragIndex(null);
    },
    [category, dragIndex, onReorder],
  );

  return (
    <div className="enq-cf-block">
      <div className="enq-cf-head">
        <h4>{title}</h4>
        <button type="button" className="ui-btn ui-btn-outline" onClick={() => onAdd(category)}>
          + Add Custom Field
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="enq-cf-empty">No custom fields yet.</p>
      ) : (
        <div className="enq-cf-list">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`enq-cf-item${dragIndex === index ? ' is-dragging' : ''}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              onDragEnd={() => setDragIndex(null)}
            >
              <span className="enq-cf-drag" aria-hidden>
                ⋮⋮
              </span>
              <div className="enq-cf-meta">
                <strong>{field.label}</strong>
                <span>
                  {field.type}
                  {field.required ? ' · Required' : ''}
                </span>
              </div>
              <div className="enq-cf-actions">
                <button type="button" aria-label="Edit field" onClick={() => onEdit(field)}>
                  ✎
                </button>
                <button
                  type="button"
                  className="is-danger"
                  aria-label="Delete field"
                  onClick={() => onDelete(field.id)}
                >
                  ⌫
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
