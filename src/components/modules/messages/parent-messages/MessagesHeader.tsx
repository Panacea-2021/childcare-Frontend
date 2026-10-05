'use client';

import { motion } from 'framer-motion';
import { Archive, Filter, MessageCircle, Plus, Users } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';

type Props = {
  onNewChat: () => void;
  onNewGroup: () => void;
  onArchive: () => void;
  onFilters: () => void;
};

export function MessagesHeader({ onNewChat, onNewGroup, onArchive, onFilters }: Props) {
  return (
    <CenterManagementPageHeader
      title="Parent Messages"
      description="Communicate instantly with parents through secure real-time conversations, groups and announcements."
      icon={<MessageCircle />}
      actions={
        <>
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onFilters}
            whileTap={{ scale: 0.98 }}
            aria-label="Open filters"
          >
            <Filter size={16} aria-hidden />
            Filters
          </motion.button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onArchive}
            whileTap={{ scale: 0.98 }}
            aria-label="View archived chats"
          >
            <Archive size={16} aria-hidden />
            Archive
          </motion.button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onNewGroup}
            whileTap={{ scale: 0.98 }}
            aria-label="Create new group"
          >
            <Users size={16} aria-hidden />
            New Group
          </motion.button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={onNewChat}
            whileTap={{ scale: 0.98 }}
            aria-label="Start new chat"
          >
            <Plus size={16} aria-hidden />
            New Chat
          </motion.button>
        </>
      }
    />
  );
}
