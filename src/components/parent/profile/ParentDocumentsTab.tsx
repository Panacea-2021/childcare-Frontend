'use client';

import { useMemo, useState } from 'react';
import type { Student } from '@/lib/center-management/types';
import type { ActivityAttachment } from '@/types/activity';
import { PersonalFilesPanel } from '@/components/modules/view-profile/PersonalFilesPanel';
import { TimelineMediaViewer } from '@/components/parent/timeline/TimelineMediaViewer';
import '@/components/parent/timeline/parent-timeline.css';

function isImageFile(name?: string, mimeType?: string, url?: string) {
  if (mimeType?.startsWith('image/')) return true;
  const probe = `${name || ''} ${url || ''}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(probe);
}

type Props = {
  student: Student;
};

export function ParentDocumentsTab({ student }: Props) {
  const [viewer, setViewer] = useState<{
    items: ActivityAttachment[];
    index: number;
  } | null>(null);

  const imageItems = useMemo(() => {
    return viewer?.items ?? [];
  }, [viewer]);

  return (
    <>
      <PersonalFilesPanel
        ownerName={student.name}
        storageKey={`student-${student.id}`}
        onPreviewDocument={(node) => {
          if (node.type !== 'document' || !node.url) return false;
          if (!isImageFile(node.fileName || node.name, node.mimeType, node.url)) return false;
          setViewer({
            items: [
              {
                id: node.id,
                name: node.name,
                type: 'image',
                url: node.url,
              },
            ],
            index: 0,
          });
          return true;
        }}
      />
      {viewer ? (
        <TimelineMediaViewer
          items={imageItems}
          startIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </>
  );
}
