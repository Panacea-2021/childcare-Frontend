'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  X,
  File,
} from 'lucide-react';
import type { ActivityAttachment } from '@/types/activity';
import './activities.css';

interface AttachmentUploaderProps {
  attachments: ActivityAttachment[];
  onAdd: (att: ActivityAttachment) => void;
  onRemove: (id: string) => void;
}

function inferAttachmentType(file: File): ActivityAttachment['type'] {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) {
    return 'image';
  }
  if (mime.startsWith('video/') || /\.(mp4|mov|webm|avi)$/.test(name)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) {
    return 'audio';
  }
  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'document';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fileToAttachment(file: File): Promise<ActivityAttachment> {
  const type = inferAttachmentType(file);
  const needsPreview = type === 'image' || type === 'video';
  let url = '#';
  if (needsPreview) {
    try {
      url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '#'));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } catch {
      url = URL.createObjectURL(file);
    }
  }

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    type,
    url,
    size: formatFileSize(file.size),
    thumbnail: type === 'image' ? url : undefined,
  };
}

function AttachmentIcon({ type }: { type: ActivityAttachment['type'] }) {
  const size = 18;
  switch (type) {
    case 'image':
      return <ImageIcon size={size} />;
    case 'video':
      return <Film size={size} />;
    case 'audio':
      return <Music size={size} />;
    case 'pdf':
      return <FileText size={size} />;
    default:
      return <File size={size} />;
  }
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAdd,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        void fileToAttachment(file).then((att) => onAdd(att));
      });
    },
    [onAdd]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="act-upload-section act-step">
      <h4 className="act-step-title">Step 5: Attachments</h4>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`act-upload-dropzone${isDragging ? ' act-upload-dropzone-dragging' : ''}`}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="act-upload-icon">
          <UploadCloud size={24} />
        </div>
        <p className="act-upload-title">Click to upload or drag & drop files here</p>
        <p className="act-upload-hint">
          Supports images, videos, PDFs, documents, and audio files
        </p>
      </motion.div>

      {attachments.length > 0 && (
        <div className="act-upload-list">
          {attachments.map((att) => (
            <div key={att.id} className="act-upload-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {att.type === 'image' && att.thumbnail ? (
                  <img
                    src={att.thumbnail}
                    alt={att.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div className="act-upload-item-icon">
                    <AttachmentIcon type={att.type} />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {att.name}
                  </p>
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '0.65rem',
                      color: 'var(--text-secondary, #6b7280)',
                    }}
                  >
                    {att.size ?? 'Attached'} • {att.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="act-upload-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(att.id);
                }}
                aria-label={`Remove ${att.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
