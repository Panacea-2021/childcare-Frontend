'use client';

import { motion } from 'framer-motion';
import type { EmailTemplate } from './types';

type Props = {
  template: EmailTemplate;
  index: number;
  updatedLabel: string;
  onUse: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function TemplateCard({
  template,
  index,
  updatedLabel,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <motion.article
      className="ec-template-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
    >
      <div className="ec-template-preview" style={{ background: template.previewAccent }}>
        <div className="bar" />
        <div className="bar short" />
        <div className="bar" style={{ width: '70%' }} />
      </div>
      <div className="ec-template-body">
        <h3>{template.name}</h3>
        <div className="ec-template-meta">
          {template.category} · Updated {updatedLabel}
        </div>
        <div className="ec-template-actions">
          <button type="button" className="ui-btn ui-btn-primary" onClick={onUse}>
            Use Template
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}
