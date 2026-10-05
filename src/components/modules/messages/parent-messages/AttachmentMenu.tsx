'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Film,
  Image as ImageIcon,
  Mic,
  Presentation,
} from 'lucide-react';
import type { MessageType } from './types';

const OPTIONS: { id: MessageType; label: string; icon: ReactNode }[] = [
  { id: 'image', label: 'Photo', icon: <ImageIcon size={18} /> },
  { id: 'video', label: 'Video', icon: <Film size={18} /> },
  { id: 'pdf', label: 'PDF', icon: <FileText size={18} /> },
  { id: 'word', label: 'Word', icon: <FileText size={18} /> },
  { id: 'excel', label: 'Excel', icon: <FileSpreadsheet size={18} /> },
  { id: 'powerpoint', label: 'PowerPoint', icon: <Presentation size={18} /> },
  { id: 'zip', label: 'ZIP', icon: <FileArchive size={18} /> },
  { id: 'audio', label: 'Audio', icon: <Mic size={18} /> },
  { id: 'image', label: 'Camera', icon: <Camera size={18} /> },
  { id: 'pdf', label: 'Document', icon: <FileText size={18} /> },
];

type Props = {
  onSelect: (type: MessageType, label: string) => void;
};

export function AttachmentMenu({ onSelect }: Props) {
  return (
    <motion.div
      className="pm-popover right"
      role="menu"
      aria-label="Attachments"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6 }}
    >
      <div className="pm-attach-menu">
        {OPTIONS.map((opt) => (
          <button
            key={`${opt.label}-${opt.id}`}
            type="button"
            className="pm-attach-item"
            role="menuitem"
            onClick={() => onSelect(opt.id, opt.label)}
          >
            <span className="pm-attach-icon">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
