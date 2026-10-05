'use client';

import { Archive, StickyNote } from 'lucide-react';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';

interface NotesHeaderProps {
  archivedCount?: number;
}

export function NotesHeader({ archivedCount = 0 }: NotesHeaderProps) {
  return (
    <ParentCommunicationPageHeader
      title="Parent Notes"
      description="Notes submitted by parents for their children. View full details in a form, mark as read, and manage archives from the Archives tab."
      icon={<StickyNote />}
      actions={
        <div className="pc-meta-pill" aria-label={`${archivedCount} archived notes`}>
          <Archive size={15} aria-hidden />
          <span>{archivedCount} archived</span>
        </div>
      }
    />
  );
}
