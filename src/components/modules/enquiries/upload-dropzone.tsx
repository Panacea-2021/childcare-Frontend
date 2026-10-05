'use client';

import { memo, useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  disabled?: boolean;
  onFile: (file: File) => void;
};

const ACCEPT = '.xlsx,.xls,.csv';

export const UploadDropzone = memo(function UploadDropzone({
  disabled,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const pick = useCallback(
    (file?: File | null) => {
      if (!file || disabled) return;
      onFile(file);
    },
    [disabled, onFile],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setActive(false);
      pick(e.dataTransfer.files?.[0]);
    },
    [pick],
  );

  return (
    <motion.div
      className={`enq-dropzone${active ? ' is-active' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
      animate={active ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      <UploadCloud size={32} color="var(--color-accent)" aria-hidden />
      <h4>Drag & drop your template file here</h4>
      <p>Official enquiry template only · .xlsx, .xls, .csv</p>
      <button
        type="button"
        className="ui-btn ui-btn-primary"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse File
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </motion.div>
  );
});
