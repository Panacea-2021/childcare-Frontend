'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Download,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  Music,
  UploadCloud,
  X,
} from 'lucide-react';
import type { LessonAttachment } from './types';

type Props = {
  attachments: LessonAttachment[];
  onChange: (next: LessonAttachment[]) => void;
  disabled?: boolean;
};

function inferType(file: File): LessonAttachment['type'] {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|mov|webm|avi)$/.test(name)) return 'video';
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) return 'audio';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  return 'document';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToAttachment(file: File): LessonAttachment {
  const type = inferType(file);
  const url = URL.createObjectURL(file);
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    type,
    url,
    size: formatSize(file.size),
    thumbnail: type === 'image' ? url : undefined,
  };
}

function AttIcon({ type }: { type: LessonAttachment['type'] }) {
  const size = 18;
  if (type === 'image') return <ImageIcon size={size} />;
  if (type === 'video') return <Film size={size} />;
  if (type === 'audio') return <Music size={size} />;
  if (type === 'pdf') return <FileText size={size} />;
  return <File size={size} />;
}

export function MediaUploader({ attachments, onChange, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next = Array.from(files).map(fileToAttachment);
      onChange([...attachments, ...next]);
    },
    [attachments, onChange],
  );

  const remove = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="les-upload">
      <input
        ref={inputRef}
        type="file"
        multiple
        disabled={disabled}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        className="les-upload-input"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className={`les-upload-drop ${dragging ? 'is-drag' : ''}`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={28} aria-hidden />
        <strong>Drag & drop files here</strong>
        <span>Images, PDF, Word, Excel, PowerPoint, video, audio</span>
      </button>

      {attachments.length > 0 ? (
        <ul className="les-upload-list">
          {attachments.map((a) => (
            <li key={a.id} className="les-upload-item">
              <div className="les-upload-thumb" aria-hidden>
                {a.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.thumbnail} alt="" />
                ) : (
                  <AttIcon type={a.type} />
                )}
              </div>
              <div className="les-upload-meta">
                <strong>{a.name}</strong>
                <span>
                  {a.type} · {a.size}
                </span>
              </div>
              <div className="les-upload-actions">
                <a
                  href={a.url}
                  download={a.name}
                  className="les-icon-btn"
                  aria-label={`Download ${a.name}`}
                >
                  <Download size={15} />
                </a>
                {!disabled ? (
                  <button
                    type="button"
                    className="les-icon-btn"
                    aria-label={`Remove ${a.name}`}
                    onClick={() => remove(a.id)}
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
