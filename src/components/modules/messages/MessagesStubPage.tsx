'use client';

import { motion } from 'framer-motion';
import { Megaphone, MessagesSquare } from 'lucide-react';
import '@/components/modules/calendar/calendar.css';
import '@/components/ui/module.css';

type Props = {
  title: string;
  subtitle: string;
  variant: 'staff' | 'announcement';
};

export function MessagesStubPage({ title, subtitle, variant }: Props) {
  const Icon = variant === 'announcement' ? Megaphone : MessagesSquare;

  return (
    <div className="mod-page cal-page">
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
      </div>
      <div className="cal-page-inner">
        <motion.header
          className="cal-header"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cal-header-left">
            <div className="cal-hero-art" aria-hidden>
              <motion.div
                className="cal-hero-cal"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 16,
                  background: 'linear-gradient(145deg, #5d5fef, #8b8df5)',
                  color: '#fff',
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon size={26} />
              </motion.div>
            </div>
            <div className="cal-header-copy">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            padding: '2.5rem 1.5rem',
            borderRadius: '1.5rem',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(232,237,245,0.9)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            This workspace is ready in the sidebar. Full chat experience ships next — explore{' '}
            <strong style={{ color: 'var(--color-accent)' }}>Parent Messages</strong> for the premium
            messaging UI.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
