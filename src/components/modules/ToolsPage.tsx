'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, IdCard, Wrench } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import './center-management/students.css';
import './tools/tools.css';

export function ToolsPage() {
  return (
    <div className="cm-page cm-page--tools tools-page">
      <CenterManagementPageHeader
        title="Tools"
        description="Printable utilities for your center — ID cards and certificates."
        icon={<Wrench size={22} strokeWidth={2.1} />}
      />

      <div className="tools-hub-grid">
        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
          <Link href="/tools/id-cards" className="tools-hub-card">
            <span className="tools-hub-icon" aria-hidden>
              <IdCard size={22} />
            </span>
            <h2>ID Cards</h2>
            <p>Pick a template, customize details, select students, and download printable identity cards.</p>
            <span className="tools-hub-link">Open ID Cards →</span>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
          <Link href="/tools/certificates" className="tools-hub-card">
            <span className="tools-hub-icon tools-hub-icon--cert" aria-hidden>
              <Award size={22} />
            </span>
            <h2>Certificates</h2>
            <p>Create achievement and participation certificates with center branding.</p>
            <span className="tools-hub-link">Open Certificates →</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
