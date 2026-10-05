'use client';

import {
  BookOpen,
  Briefcase,
  File,
  FileSpreadsheet,
  FileText,
  Flag,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Palette,
  Presentation,
  Star,
} from 'lucide-react';
import type { DocType, FolderIconKey } from './types';

export function FolderGlyph({
  icon,
  open,
  size = 28,
  color,
}: {
  icon: FolderIconKey;
  open?: boolean;
  size?: number;
  color?: string;
}) {
  const props = { size, color: color || 'currentColor', 'aria-hidden': true as const };
  if (open) return <FolderOpen {...props} />;
  if (icon === 'book') return <BookOpen {...props} />;
  if (icon === 'star') return <Star {...props} />;
  if (icon === 'flag') return <Flag {...props} />;
  if (icon === 'briefcase') return <Briefcase {...props} />;
  if (icon === 'palette') return <Palette {...props} />;
  return <Folder {...props} />;
}

export function DocumentGlyph({ type, size = 24 }: { type: DocType; size?: number }) {
  if (type === 'PDF' || type === 'DOC' || type === 'DOCX') return <FileText size={size} aria-hidden />;
  if (type === 'PPT' || type === 'PPTX') return <Presentation size={size} aria-hidden />;
  if (type === 'XLS') return <FileSpreadsheet size={size} aria-hidden />;
  if (type === 'Image') return <ImageIcon size={size} aria-hidden />;
  return <File size={size} aria-hidden />;
}

export function docTypeTone(type: DocType): string {
  if (type === 'PDF') return 'pdf';
  if (type === 'DOC' || type === 'DOCX') return 'word';
  if (type === 'PPT' || type === 'PPTX') return 'ppt';
  if (type === 'XLS') return 'xls';
  if (type === 'Image') return 'image';
  return 'other';
}
