'use client';

import { Download, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DocumentGlyph, docTypeTone } from './icons';
import { formatDate } from './store';
import type { CurriculumDocument } from './types';

type Props = {
  open: boolean;
  document: CurriculumDocument | null;
  folderName?: string;
  onClose: () => void;
  onDownload: (doc: CurriculumDocument) => void;
};

export function DocumentViewModal({ open, document, folderName, onClose, onDownload }: Props) {
  if (!document) {
    return (
      <Modal open={open} title="View Document" onClose={onClose} icon={<Eye size={18} />}>
        <p>Document not found.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="View Document"
      onClose={onClose}
      icon={<Eye size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary cd-btn-anim"
            onClick={() => onDownload(document)}
          >
            <Download size={14} aria-hidden /> Download
          </button>
        </>
      }
    >
      <div className="cd-view">
        <div className={`cd-view-icon tone-${docTypeTone(document.type)}`} aria-hidden>
          <DocumentGlyph type={document.type} size={32} />
        </div>
        <h3>{document.name}</h3>
        <p className="cd-view-desc">{document.description || 'No description provided.'}</p>
        <dl className="cd-view-meta">
          <div>
            <dt>Folder</dt>
            <dd>{folderName || '—'}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{document.type}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{document.size}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`cd-status ${document.status === 'Active' ? 'is-active' : 'is-archived'}`}>
                {document.status}
              </span>
            </dd>
          </div>
          <div>
            <dt>Created By</dt>
            <dd>{document.createdBy}</dd>
          </div>
          <div>
            <dt>Uploaded</dt>
            <dd>{formatDate(document.uploadedAt)}</dd>
          </div>
          <div>
            <dt>Modified</dt>
            <dd>{formatDate(document.updatedAt)}</dd>
          </div>
          <div>
            <dt>Tags</dt>
            <dd>{document.tags.length ? document.tags.join(', ') : '—'}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
