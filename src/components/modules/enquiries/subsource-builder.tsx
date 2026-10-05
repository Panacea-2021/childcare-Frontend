'use client';

import { memo, useCallback, useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { createSubSourceId } from '@/lib/enquiries/sourcesStore';
import type { SubSource } from '@/lib/enquiries/types';

type Props = {
  items: SubSource[];
  onChange: (items: SubSource[]) => void;
  error?: string;
  allowReorder?: boolean;
};

export const SubSourceBuilder = memo(function SubSourceBuilder({
  items,
  onChange,
  error,
  allowReorder = true,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateName = useCallback(
    (index: number, name: string) => {
      onChange(items.map((item, i) => (i === index ? { ...item, name } : item)));
    },
    [items, onChange],
  );

  const add = useCallback(() => {
    onChange([...items, { id: createSubSourceId(), name: '' }]);
  }, [items, onChange]);

  const remove = useCallback(
    (index: number) => {
      if (items.length <= 1) return;
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  const onDragStart = (index: number) => setDragIndex(index);

  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div className="enq-sub-builder">
      <label className="ui-label">
        Sub Sources <span className="req">*</span>
      </label>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`enq-sub-row${dragIndex === index ? ' is-dragging' : ''}`}
          draggable={allowReorder}
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(index)}
        >
          <span className="enq-sub-handle" aria-hidden title="Drag to reorder">
            <GripVertical size={16} />
          </span>
          <input
            className="ui-input"
            value={item.name}
            placeholder={`Sub source ${index + 1}`}
            onChange={(e) => updateName(index, e.target.value)}
          />
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => remove(index)}
            disabled={items.length <= 1}
            aria-label="Remove sub source"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="ui-btn ui-btn-outline" onClick={add}>
        + Add Another Sub Source
      </button>
      {error ? <p className="enq-error">{error}</p> : null}
    </div>
  );
});
