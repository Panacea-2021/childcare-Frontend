'use client';

import { motion } from 'framer-motion';
import type { EmailCampaign } from './types';
import { STATUS_BADGE_CLASS } from './types';
import { formatCampaignDate, formatRate } from './mockData';
import { CampaignRowMenu, type CampaignActionKey } from './CampaignRowMenu';

type Props = {
  campaigns: EmailCampaign[];
  onAction: (campaign: EmailCampaign, action: CampaignActionKey) => void;
  onOpen: (campaign: EmailCampaign) => void;
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.05,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function CampaignTable({ campaigns, onAction, onOpen }: Props) {
  return (
    <div className="ec-table-wrap">
      <motion.table
        className="ui-table ec-table"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Audience</th>
            <th>Channel</th>
            <th>Recipients</th>
            <th>Status</th>
            <th>Scheduled/Sent</th>
            <th>Open Rate</th>
            <th>Click Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, i) => (
            <motion.tr
              key={c.id}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ backgroundColor: 'rgba(232, 242, 255, 0.55)' }}
            >
              <td>
                <motion.button
                  type="button"
                  className="ec-name-btn"
                  onClick={() => onOpen(c)}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  {c.name}
                </motion.button>
              </td>
              <td>{c.audienceLabel}</td>
              <td>{c.channel}</td>
              <td>{c.recipientCount.toLocaleString()}</td>
              <td>
                <motion.span
                  className={STATUS_BADGE_CLASS[c.status]}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 400 }}
                >
                  {c.status}
                </motion.span>
              </td>
              <td className="ec-muted">{formatCampaignDate(c.sentAt || c.scheduledAt)}</td>
              <td>{formatRate(c.openRate)}</td>
              <td>{formatRate(c.clickRate)}</td>
              <td>
                <CampaignRowMenu status={c.status} onAction={(a) => onAction(c, a)} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
}
