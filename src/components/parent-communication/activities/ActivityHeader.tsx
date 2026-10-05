'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Images, Plus, Settings2 } from 'lucide-react';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';

export function ActivityHeader() {
  const router = useRouter();

  const handlePostClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'act-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
      router.push('/parent-communication/activities/post');
    },
    [router],
  );

  return (
    <ParentCommunicationPageHeader
      title="Activities"
      description="Share classroom moments, keep parents updated, schedule classroom activities and manage communication beautifully."
      icon={<Images />}
      actions={
        <>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ui-btn ui-btn-outline act-settings-btn"
            onClick={() => router.push('/parent-communication/activities/settings')}
            aria-label="Activity settings"
            title="Settings"
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePostClick}
            className="ui-btn ui-btn-primary act-post-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Post Activity</span>
          </motion.button>
        </>
      }
    />
  );
}
