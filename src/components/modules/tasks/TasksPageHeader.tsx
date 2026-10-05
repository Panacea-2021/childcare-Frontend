'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import { EnquiriesPageHeader } from '@/components/modules/enquiries/EnquiriesPageHeader';

type Props = {
  subtitle: string;
  onCreate: () => void;
};

export function TasksPageHeader({ subtitle, onCreate }: Props) {
  return (
    <EnquiriesPageHeader
      title="Tasks"
      description={subtitle}
      icon={<ClipboardList size={22} strokeWidth={2.1} />}
      actions={
        <motion.button
          type="button"
          className="tm-btn-create"
          onClick={onCreate}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Create task"
        >
          <span className="tm-btn-create-shine" aria-hidden />
          <Plus size={16} aria-hidden />
          Create Task
        </motion.button>
      }
    />
  );
}
