'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatSourceDate } from '@/lib/enquiries/sourcesStore';
import type { EnquirySource } from '@/lib/enquiries/types';

type Props = {
  sources: EnquirySource[];
  onEdit: (source: EnquirySource) => void;
  onDelete: (source: EnquirySource) => void;
  onViewSubs: (source: EnquirySource) => void;
};

export const SourceList = memo(function SourceList({
  sources,
  onEdit,
  onDelete,
  onViewSubs,
}: Props) {
  if (!sources.length) {
    return (
      <div className="enq-empty-panel">
        No sources yet. Add your first enquiry source to get started.
      </div>
    );
  }

  return (
    <div className="enq-source-grid">
      {sources.map((source, index) => (
        <motion.article
          key={source.id}
          className="enq-source-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.22 }}
          whileHover={{ y: -2 }}
        >
          <div className="enq-source-card-head">
            <h4>{source.name}</h4>
            <motion.span
              className={`ui-badge ${source.status === 'Active' ? 'ui-badge-mint' : 'ui-badge-blush'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {source.status}
            </motion.span>
          </div>
          <div className="enq-source-meta">
            <div>
              <span>Sub Sources</span>
              <strong>{source.subSources.length}</strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{formatSourceDate(source.createdAt)}</strong>
            </div>
            <div>
              <span>Last Updated</span>
              <strong>{formatSourceDate(source.updatedAt)}</strong>
            </div>
          </div>
          <div className="enq-source-actions">
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => onViewSubs(source)}
            >
              <Eye size={14} aria-hidden /> View Sub Sources
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => onEdit(source)}
            >
              <Pencil size={14} aria-hidden /> Edit
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => onDelete(source)}
            >
              <Trash2 size={14} aria-hidden /> Delete
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
});
