'use client';

import { motion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ChecklistItemDef, RoomDailyReport } from '@/types/dailyReport';
import { getEntry, roomChecklistColumns } from './utils';

type Props = {
  open: boolean;
  report: RoomDailyReport | null;
  checklist: ChecklistItemDef[];
  onClose: () => void;
  onSend: () => void;
};

export function WhatsAppPreviewModal({ open, report, checklist, onClose, onSend }: Props) {
  const columns = report ? roomChecklistColumns(checklist, report) : [];
  const completed = report
    ? columns.filter((c) => getEntry(report, c.id)?.completed)
    : [];

  const body = [
    `Hello Parents of ${report?.room ?? 'Classroom'},`,
    '',
    `Today's classroom report for ${report?.room ?? 'your room'} is ready.`,
    '',
    ...completed.map((c) => `✓ ${c.name}`),
    '',
    'Remarks:',
    report?.overallNotes ||
      'Children actively participated in today’s activities and had a wonderful day.',
    '',
    'Regards,',
    'ABC Preschool',
  ].join('\n');

  return (
    <Modal
      open={open && Boolean(report)}
      title="WhatsApp Preview"
      onClose={onClose}
      icon={<MessageCircle size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onSend}>
            Send
          </button>
        </>
      }
    >
      <div className="dr-wa-preview">
        <motion.div
          className="dr-wa-bubble"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {body}
        </motion.div>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          {completed.slice(0, 6).map((c) => (
            <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} color="#059669" /> {c.name}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  );
}
