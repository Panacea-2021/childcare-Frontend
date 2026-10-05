'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  Copy,
  Download,
  Eye,
  FolderInput,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ActionsMenu } from './ActionsMenu';
import { DocumentGlyph, docTypeTone } from './icons';
import { formatDate } from './store';
import type { CurriculumDocument } from './types';

type Props = {
  document: CurriculumDocument;
  index: number;
  onView: (doc: CurriculumDocument) => void;
  onDownload: (doc: CurriculumDocument) => void;
  onRename: (doc: CurriculumDocument) => void;
  onMove: (doc: CurriculumDocument) => void;
  onDuplicate: (doc: CurriculumDocument) => void;
  onArchive: (doc: CurriculumDocument) => void;
  onDelete: (doc: CurriculumDocument) => void;
  onEdit: (doc: CurriculumDocument) => void;
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

function DocumentCardComponent({
  document,
  index,
  onView,
  onDownload,
  onRename,
  onMove,
  onDuplicate,
  onArchive,
  onDelete,
  onEdit,
}: Props) {
  return (
    <motion.article
      className="cd-card cd-doc-card"
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
        onClick={() => onView(document)}
        aria-label={`View document ${document.name}`}
      >
        <motion.span
          className={`cd-doc-ico tone-${docTypeTone(document.type)}`}
          aria-hidden
          initial={{ rotate: 4, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: Math.min(index * 0.06, 0.36) + 0.1, type: 'spring', stiffness: 300 }}
        >
          <DocumentGlyph type={document.type} size={26} />
        </motion.span>
        <div className="cd-card-body">
          <h3>{document.name}</h3>
          <p className="cd-card-meta">
            {document.type} · {document.size} · {document.status}
          </p>
          <p className="cd-card-sub">
            {document.createdBy} · Uploaded {formatDate(document.uploadedAt)} · Modified{' '}
            {formatDate(document.updatedAt)}
          </p>
          {document.description ? <p className="cd-card-desc">{document.description}</p> : null}
          {document.tags.length ? (
            <div className="cd-tags">
              {document.tags.map((tag) => (
                <span key={tag} className="cd-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </button>
      <div className="cd-card-actions">
        <ActionsMenu
          label={`Document actions for ${document.name}`}
          items={[
            { id: 'view', label: 'View', icon: <Eye size={14} />, onSelect: () => onView(document) },
            { id: 'edit', label: 'Edit', icon: <Pencil size={14} />, onSelect: () => onEdit(document) },
            {
              id: 'download',
              label: 'Download',
              icon: <Download size={14} />,
              onSelect: () => onDownload(document),
            },
            { id: 'rename', label: 'Rename', icon: <Pencil size={14} />, onSelect: () => onRename(document) },
            { id: 'move', label: 'Move', icon: <FolderInput size={14} />, onSelect: () => onMove(document) },
            {
              id: 'dup',
              label: 'Duplicate',
              icon: <Copy size={14} />,
              onSelect: () => onDuplicate(document),
            },
            {
              id: 'archive',
              label: document.status === 'Archived' ? 'Restore' : 'Archive',
              icon: <Archive size={14} />,
              onSelect: () => onArchive(document),
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 size={14} />,
              danger: true,
              onSelect: () => onDelete(document),
            },
          ]}
        />
      </div>
    </motion.article>
  );
}

export const DocumentCard = memo(DocumentCardComponent);
