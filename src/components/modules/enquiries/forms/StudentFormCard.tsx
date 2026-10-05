'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  Bot,
  Copy,
  Eye,
  FileStack,
  FileText,
  Heart,
  LayoutTemplate,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { StudentForm } from './types';
import { formatDateLabel } from './mockData';

type Props = {
  form: StudentForm;
  index: number;
  onEdit: () => void;
  onPreview: () => void;
  onFavorite: () => void;
  onDuplicate: () => void;
  onSaveTemplate: () => void;
  onDelete: () => void;
};

function SourceIcon({ source }: { source: StudentForm['source'] }) {
  if (source === 'ai') return <Bot size={14} />;
  if (source === 'template') return <LayoutTemplate size={14} />;
  if (source === 'pdf') return <FileText size={14} />;
  return <Sparkles size={14} />;
}

const accents = [
  'sf-card-tone-a',
  'sf-card-tone-b',
  'sf-card-tone-c',
  'sf-card-tone-d',
  'sf-card-tone-e',
];

export function StudentFormCard({
  form,
  index,
  onEdit,
  onPreview,
  onFavorite,
  onDuplicate,
  onSaveTemplate,
  onDelete,
}: Props) {
  const tone = accents[index % accents.length];

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.article
          className={`sf-premium-card ${tone}`}
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, delay: Math.min(index * 0.06, 0.36), ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            y: -8,
            scale: 1.015,
            boxShadow: '0 22px 48px rgba(93, 95, 239, 0.16)',
            transition: { duration: 0.22 },
          }}
          layout
        >
          <div className="sf-premium-card-glow" aria-hidden />
          <div className="sf-premium-card-shine" aria-hidden />

          <div className="sf-premium-card-top">
            <div className="sf-premium-card-icon" aria-hidden>
              <SourceIcon source={form.source} />
            </div>
            <span className={`sf-badge ${form.status === 'published' ? 'sf-badge-published' : 'sf-badge-draft'}`}>
              {form.status}
            </span>
          </div>

          <h3>{form.title}</h3>
          <p>{form.description || 'No description'}</p>

          <div className="sf-premium-meta">
            <span>
              <FileText size={12} aria-hidden /> {form.fields?.length ?? 0} fields
            </span>
            <span className="sf-premium-dot" aria-hidden />
            <span className="sf-premium-source">{form.source}</span>
            <span className="sf-premium-dot" aria-hidden />
            <span>Updated {formatDateLabel(form.updatedAt)}</span>
          </div>

          <div className="sf-premium-actions">
            <m.button
              type="button"
              className="sf-ss-btn sf-ss-btn-primary sf-card-edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="sf-ss-btn-shine" aria-hidden />
              Edit
            </m.button>

            <div className="sf-premium-icon-row">
              <m.button
                type="button"
                className="sf-premium-icon-btn"
                aria-label="Preview"
                title="Preview"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                whileHover={{ y: -2, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <Eye size={15} />
              </m.button>
              <m.button
                type="button"
                className={`sf-premium-icon-btn ${form.favorite ? 'is-fav' : ''}`}
                aria-label="Favorite"
                title="Favorite"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite();
                }}
                whileHover={{ y: -2, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <Heart size={15} fill={form.favorite ? 'currentColor' : 'none'} />
              </m.button>
              <m.button
                type="button"
                className="sf-premium-icon-btn"
                aria-label="Duplicate"
                title="Duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                whileHover={{ y: -2, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <Copy size={15} />
              </m.button>
              <m.button
                type="button"
                className="sf-premium-icon-btn"
                aria-label="Save as template"
                title="Save as template"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveTemplate();
                }}
                whileHover={{ y: -2, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <FileStack size={15} />
              </m.button>
              <m.button
                type="button"
                className="sf-premium-icon-btn is-danger"
                aria-label="Delete"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                whileHover={{ y: -2, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <Trash2 size={15} />
              </m.button>
            </div>
          </div>
        </m.article>
      </MotionConfig>
    </LazyMotion>
  );
}
