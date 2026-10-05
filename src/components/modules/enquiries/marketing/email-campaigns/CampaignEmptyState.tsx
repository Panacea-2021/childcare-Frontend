'use client';

import { LayoutTemplate, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onCreate: () => void;
  onTemplates: () => void;
};

export function CampaignEmptyState({ onCreate, onTemplates }: Props) {
  return (
    <motion.div
      className="ec-empty"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="ec-empty-icon"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <LayoutTemplate size={28} />
      </motion.div>
      <h2>Create your first email campaign</h2>
      <p>
        Reach parents, students and your school community with beautifully designed email
        campaigns.
      </p>
      <div className="ec-empty-actions">
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={onCreate}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          Create Campaign
        </motion.button>
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline"
          onClick={onTemplates}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Browse Templates
        </motion.button>
      </div>
    </motion.div>
  );
}
