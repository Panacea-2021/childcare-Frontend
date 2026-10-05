'use client';

import { useState } from 'react';
import { ClipboardList, Download, Loader2, Plus, Settings2, Users } from 'lucide-react';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';

type Props = {
  onGenerate: () => void;
  onConfigure: () => void;
  onDownload: () => void;
  onClassroomSend: () => void;
};

export function DailyReportsHeader({
  onGenerate,
  onConfigure,
  onDownload,
  onClassroomSend,
}: Props) {
  const [exporting, setExporting] = useState(false);

  return (
    <ParentCommunicationPageHeader
      title="Daily Reports"
      description="Track every room's daily activities and share updates with parents."
      icon={<ClipboardList />}
      actions={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClassroomSend}>
            <Users size={16} aria-hidden />
            Send Classroom Report
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onConfigure}>
            <Settings2 size={16} aria-hidden />
            Configure Checklist
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                await onDownload();
                await new Promise((r) => setTimeout(r, 400));
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? (
              <Loader2 size={16} className="cal-spin" aria-hidden />
            ) : (
              <Download size={16} aria-hidden />
            )}
            {exporting ? 'Downloading…' : 'Download Reports'}
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onGenerate}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Generate Daily Report
          </button>
        </>
      }
    />
  );
}
