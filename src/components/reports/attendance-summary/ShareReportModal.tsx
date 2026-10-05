'use client';

import { useState } from 'react';
import { Copy, Mail, Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

type Props = {
  report: GeneratedExcelReport | null;
  onClose: () => void;
};

export function ShareReportModal({ report, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const link = `https://app.panacea.local/reports/attendance/${report.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={!!report}
      title="Share Report"
      onClose={onClose}
      footer={
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Close
        </button>
      }
    >
      <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Share <strong style={{ color: 'var(--text-primary)' }}>{report.name}</strong> using one of the options below.
        This is a frontend-only simulation.
      </p>
      <div className="asr-share-grid">
        <button type="button" className="asr-share-btn" onClick={copyLink}>
          <Copy size={18} color="var(--color-accent)" />
          <span>
            <strong>{copied ? 'Link copied' : 'Copy Link'}</strong>
            <span>{link}</span>
          </span>
        </button>
        <button
          type="button"
          className="asr-share-btn"
          onClick={() => {
            window.location.href = `mailto:?subject=${encodeURIComponent(report.name)}&body=${encodeURIComponent(`Please find attendance report: ${link}`)}`;
          }}
        >
          <Mail size={18} color="var(--color-accent)" />
          <span>
            <strong>Email</strong>
            <span>Open your mail client with a prefilled message</span>
          </span>
        </button>
        <button type="button" className="asr-share-btn" onClick={onClose}>
          <Share2 size={18} color="var(--color-accent)" />
          <span>
            <strong>Export</strong>
            <span>Use Download from the reports table for CSV export</span>
          </span>
        </button>
      </div>
    </Modal>
  );
}
