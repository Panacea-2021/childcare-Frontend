'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileUp, Upload } from 'lucide-react';
import { formatBytes } from './store';
import { inferDocType } from './utils';
import type { DocType } from './types';

export type UploadResult = {
  fileName: string;
  fileUrl: string;
  size: string;
  sizeBytes: number;
  type: DocType;
};

type Props = {
  fileName: string;
  progress: number;
  success: boolean;
  disabled?: boolean;
  onFile: (result: UploadResult) => void;
  onProgress: (value: number) => void;
  onSuccessChange: (value: boolean) => void;
};

export function FileUploadZone({
  fileName,
  progress,
  success,
  disabled,
  onFile,
  onProgress,
  onSuccessChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    onSuccessChange(false);
    onProgress(0);
    const url = URL.createObjectURL(file);
    const result: UploadResult = {
      fileName: file.name,
      fileUrl: url,
      size: formatBytes(file.size),
      sizeBytes: file.size,
      type: inferDocType(file),
    };
    onFile(result);

    let p = 0;
    const tick = window.setInterval(() => {
      p += Math.random() * 22 + 10;
      if (p >= 100) {
        p = 100;
        window.clearInterval(tick);
        onProgress(100);
        onSuccessChange(true);
        return;
      }
      onProgress(Math.min(96, Math.round(p)));
    }, 120);
  };

  return (
    <div className="cd-upload">
      <input
        ref={inputRef}
        type="file"
        className="cd-upload-input"
        disabled={disabled}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className={`cd-upload-drop${dragging ? ' is-drag' : ''}${success ? ' is-success' : ''}`}
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
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        aria-label="Upload document"
      >
        {success ? (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cd-upload-success-ico"
            aria-hidden
          >
            <CheckCircle2 size={30} />
          </motion.span>
        ) : (
          <Upload size={28} aria-hidden />
        )}
        <strong>{fileName || 'Drag & drop document here'}</strong>
        <span>{fileName ? 'Click to replace file' : 'PDF, Word, PowerPoint, Excel, or Image'}</span>
        {(progress > 0 && progress < 100) || (progress === 100 && !success) ? (
          <div className="cd-upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="cd-upload-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        ) : null}
        {success ? (
          <motion.span
            className="cd-upload-ok"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FileUp size={14} /> Upload complete
          </motion.span>
        ) : null}
      </button>
    </div>
  );
}
