'use client';

import type { ReactNode } from 'react';
import { MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';
import { AppMenu } from './AppDropdown';

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  onAddSibling?: () => void;
  extra?: { id: string; label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean }[];
};

export function TableActionMenu({ onEdit, onDelete, onAddSibling, extra = [] }: Props) {
  const items = [
    ...(onEdit
      ? [{ id: 'edit', label: 'Edit', icon: <Pencil size={15} />, onSelect: onEdit }]
      : []),
    ...(onAddSibling
      ? [
          {
            id: 'sibling',
            label: 'Add Sibling',
            icon: <UserPlus size={15} />,
            onSelect: onAddSibling,
          },
        ]
      : []),
    ...extra,
    ...(onDelete
      ? [
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 size={15} />,
            onSelect: onDelete,
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <AppMenu
      align="end"
      minWidth={190}
      items={items}
      trigger={({ open, buttonProps }) => (
        <button
          type="button"
          className={`cm-row-action${open ? ' is-open' : ''}`}
          aria-label="Row actions"
          {...buttonProps}
        >
          <MoreVertical size={16} />
        </button>
      )}
    />
  );
}
