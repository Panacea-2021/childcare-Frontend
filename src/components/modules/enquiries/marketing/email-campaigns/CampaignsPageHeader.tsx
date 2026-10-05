'use client';

import { motion } from 'framer-motion';
import { LayoutTemplate, Mail, Plus } from 'lucide-react';
import { EnquiriesPageHeader } from '../../EnquiriesPageHeader';

type Props = {
  onCreate: () => void;
  onTemplates: () => void;
};

export function CampaignsPageHeader({ onCreate, onTemplates }: Props) {
  return (
    <EnquiriesPageHeader
      title="Email Campaigns"
      description="Create, send and track email campaigns for your school community."
      icon={<Mail size={22} strokeWidth={2.1} />}
      actions={
        <>
          <motion.button
            type="button"
            className="ec-btn-outline"
            onClick={onTemplates}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="ec-btn-outline-glow" aria-hidden />
            <LayoutTemplate size={16} aria-hidden />
            Manage Templates
          </motion.button>
          <motion.button
            type="button"
            className="ec-btn-primary"
            onClick={onCreate}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="ec-btn-shine" aria-hidden />
            <Plus size={16} aria-hidden />
            Create Campaign
          </motion.button>
        </>
      }
    />
  );
}
