'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  FilePlus2,
  FolderInput,
  FolderPlus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ActionsMenu } from './ActionsMenu';
import { FolderGlyph } from './icons';
import { formatDate } from './store';
import type { CurriculumFolder } from './types';

type Props = {
  folder: CurriculumFolder;
  itemCount: number;
  index: number;
  onOpen: (folder: CurriculumFolder) => void;
  onEdit: (folder: CurriculumFolder) => void;
  onDelete: (folder: CurriculumFolder) => void;
  onAddSubfolder: (folder: CurriculumFolder) => void;
  onAddDocument: (folder: CurriculumFolder) => void;
  onRename: (folder: CurriculumFolder) => void;
  onMove: (folder: CurriculumFolder) => void;
  onCopy: (folder: CurriculumFolder) => void;
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(index * 0.06, 0.36),
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
  exit: { opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.2 } },
};

function FolderCardComponent({
  folder,
  itemCount,
  index,
  onOpen,
  onEdit,
  onDelete,
  onAddSubfolder,
  onAddDocument,
  onRename,
  onMove,
  onCopy,
}: Props) {
  return (
    <motion.article
      className="cd-card cd-folder-card"
      style={{ ['--cd-accent' as string]: folder.color }}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 360, damping: 22 } }}
      whileTap={{ scale: 0.985 }}
      layout
    >
      <button
        type="button"
        className="cd-card-main"
        onClick={() => onOpen(folder)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(folder);
          }
        }}
        aria-label={`Open folder ${folder.name}`}
      >
        <motion.span
          className="cd-folder-ico"
          aria-hidden
          initial={{ rotate: -6, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: Math.min(index * 0.06, 0.36) + 0.1, type: 'spring', stiffness: 300 }}
        >
          <FolderGlyph icon={folder.icon} size={30} color={folder.color} />
        </motion.span>
        <div className="cd-card-body">
          <h3>{folder.name}</h3>
          <p className="cd-card-meta">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · Updated {formatDate(folder.updatedAt)}
          </p>
          <p className="cd-card-sub">Created by {folder.createdBy}</p>
          {folder.description ? <p className="cd-card-desc">{folder.description}</p> : null}
        </div>
      </button>
      <div className="cd-card-actions">
        <ActionsMenu
          label={`Folder actions for ${folder.name}`}
          items={[
            { id: 'edit', label: 'Edit Folder', icon: <Pencil size={14} />, onSelect: () => onEdit(folder) },
            { id: 'rename', label: 'Rename', icon: <Pencil size={14} />, onSelect: () => onRename(folder) },
            {
              id: 'sub',
              label: 'Add Subfolder',
              icon: <FolderPlus size={14} />,
              onSelect: () => onAddSubfolder(folder),
            },
            {
              id: 'doc',
              label: 'Add Document',
              icon: <FilePlus2 size={14} />,
              onSelect: () => onAddDocument(folder),
            },
            { id: 'move', label: 'Move Folder', icon: <FolderInput size={14} />, onSelect: () => onMove(folder) },
            { id: 'copy', label: 'Copy Folder', icon: <Copy size={14} />, onSelect: () => onCopy(folder) },
            {
              id: 'delete',
              label: 'Delete Folder',
              icon: <Trash2 size={14} />,
              danger: true,
              onSelect: () => onDelete(folder),
            },
          ]}
        />
      </div>
    </motion.article>
  );
}

export const FolderCard = memo(FolderCardComponent);
