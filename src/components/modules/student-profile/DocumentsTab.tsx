'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Upload,
} from 'lucide-react';
import type { ProfileDocument } from '@/lib/students/profileTypes';
import { formatDisplayDate } from '@/lib/students/profileStore';
import { btnMotion, cardHover, staggerContainer, staggerItem } from './animations';

type Props = {
  documents: ProfileDocument[];
  onUpload: () => void;
  onAddFolder: () => void;
};

export function DocumentsTab({ documents, onUpload, onAddFolder }: Props) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const folders = documents.filter((d) => d.kind === 'folder');
  const files = documents.filter((d) => d.kind === 'file');

  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="sp-panel">
      <div className="sp-panel-toolbar">
        <div>
          <h3 className="sp-panel-title">Document Manager</h3>
          <p className="sp-panel-sub">Folders and files linked to this student</p>
        </div>
        <div className="sp-panel-actions">
          <motion.button type="button" className="ui-btn ui-btn-primary" onClick={onUpload} {...btnMotion}>
            <Upload size={15} /> Upload Document
          </motion.button>
          <motion.button type="button" className="ui-btn ui-btn-outline" onClick={onAddFolder} {...btnMotion}>
            <FolderPlus size={15} /> Add Folder
          </motion.button>
        </div>
      </div>

      {documents.length === 0 ? (
        <motion.div
          className="sp-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="sp-empty-art" aria-hidden>
            <Folder size={36} />
          </div>
          <h4>No documents yet</h4>
          <p>Upload a document or create a folder to start organising this student&apos;s files.</p>
          <motion.button type="button" className="ui-btn ui-btn-primary" onClick={onUpload} {...btnMotion}>
            <Upload size={15} /> Upload Document
          </motion.button>
        </motion.div>
      ) : (
        <>
          {folders.length > 0 ? (
            <motion.div
              className="sp-folder-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {folders.map((folder) => (
                <motion.article
                  key={folder.id}
                  className="sp-folder-card"
                  variants={staggerItem}
                  whileHover={cardHover}
                >
                  <span className="sp-folder-ico" aria-hidden>
                    <Folder size={22} />
                  </span>
                  <div>
                    <strong>{folder.name}</strong>
                    <p>
                      {folder.fileCount ?? 0} items · {formatDisplayDate(folder.uploadedAt)}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : null}

          <motion.div
            className="sp-doc-list"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {files.map((doc) => (
              <motion.article
                key={doc.id}
                className="sp-doc-card"
                variants={staggerItem}
                whileHover={cardHover}
              >
                <span className="sp-doc-ico" aria-hidden>
                  <FileText size={20} />
                </span>
                <div className="sp-doc-meta">
                  <strong>{doc.name}</strong>
                  <p>
                    {formatDisplayDate(doc.uploadedAt)} · {doc.uploadedBy}
                    {doc.size ? ` · ${doc.size}` : ''}
                  </p>
                </div>
                <div className="sp-doc-actions">
                  <button type="button" className="tm-icon-btn" data-tip="Preview" aria-label="Preview">
                    <Eye size={15} />
                  </button>
                  <button type="button" className="tm-icon-btn" data-tip="Download" aria-label="Download">
                    <Download size={15} />
                  </button>
                  <div className="sp-more-wrap">
                    <button
                      type="button"
                      className="tm-icon-btn"
                      data-tip="More"
                      aria-label="More"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFor((id) => (id === doc.id ? null : doc.id));
                      }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    <AnimatePresence>
                      {menuFor === doc.id ? (
                        <motion.div
                          className="sp-more-menu"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          <button type="button">Rename</button>
                          <button type="button">Move</button>
                          <button type="button" className="is-danger">
                            Delete
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
