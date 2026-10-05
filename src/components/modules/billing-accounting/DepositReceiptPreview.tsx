'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  formatBillingDateLong,
  formatInrShort,
  type DepositEntry,
} from '@/lib/center-management/billingStore';
import type { Student } from '@/lib/center-management/types';
import { GradientButton } from './invoice-detail/viewer/GradientButton';
import './invoice-detail/invoice-detail.css';
import './billing-invoices.css';
import './deposit-receipt-preview.css';

type Props = {
  open: boolean;
  student: Student;
  deposit: DepositEntry;
  onClose: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function DepositReceiptPreview({ open, student, deposit, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(0.78);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setZoom(0.78);
    setRotation(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* ignore */
    }
  };

  const downloadPdf = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      let y = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('DEPOSIT NOTE', margin, y);
      y += 28;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Reference: ${deposit.ref}`, margin, y);
      y += 18;
      doc.text(`Student: ${student.name}`, margin, y);
      y += 18;
      doc.text(`Admission: ${student.admissionNumber || '—'}`, margin, y);
      y += 18;
      doc.text(`Date: ${formatBillingDateLong(deposit.date)}`, margin, y);
      y += 18;
      doc.text(`Description: ${deposit.description}`, margin, y);
      y += 18;
      doc.text(`Issued Against: ${deposit.issuedAgainst}`, margin, y);
      y += 18;
      doc.text(`Payment Mode: ${deposit.paymentMode || '—'}`, margin, y);
      y += 18;
      doc.text(`Recorded By: ${deposit.recordedBy}`, margin, y);
      y += 18;
      if (deposit.approvedBy) {
        doc.text(`Approved By: ${deposit.approvedBy}`, margin, y);
        y += 18;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Amount: ${formatInrShort(deposit.amount)}`, margin, y + 10);
      doc.save(`${deposit.ref}-deposit-note.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={rootRef}
          className="bi-receipt-overlay crp-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease }}
        >
          <div className="ivw-root is-pdf-mode ivd-receipt-preview crp-root">
            <header className="ivw-toolbar is-pdf">
              <div className="ivw-toolbar-left">
                <button type="button" className="ivw-back" onClick={onClose}>
                  <ArrowLeft size={16} />
                  Back
                </button>
                <div className="ivw-toolbar-meta">
                  <strong>{deposit.ref}</strong>
                  <span className="ivw-toolbar-avatar" aria-hidden>
                    {student.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.photoUrl} alt="" />
                    ) : (
                      initials(student.name)
                    )}
                  </span>
                  <span className="ivw-toolbar-name">
                    {deposit.ref} · {student.name}
                  </span>
                </div>
              </div>

              <div className="ivw-toolbar-actions">
                <GradientButton
                  variant="ghost"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.08).toFixed(2))))}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </GradientButton>
                <span className="ivw-zoom-label">{Math.round(zoom * 100)}%</span>
                <GradientButton
                  variant="ghost"
                  onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.08).toFixed(2))))}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  onClick={() => setZoom(0.84)}
                  title="Fit width"
                >
                  Fit width
                </GradientButton>
                <GradientButton variant="ghost" onClick={() => setZoom(0.72)} title="Fit page">
                  Fit page
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate"
                >
                  <RotateCw size={16} />
                </GradientButton>
                <GradientButton variant="ghost" onClick={toggleFullscreen} title="Fullscreen">
                  {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </GradientButton>
                <GradientButton onClick={downloadPdf} disabled={downloading}>
                  <Download size={15} />
                  {downloading ? 'Preparing…' : 'Download PDF'}
                </GradientButton>
              </div>
            </header>

            <div className="ivw-stage crp-stage">
              <div
                className="crp-paper-wrap"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <article className="crp-paper">
                  <header className="crp-paper-head">
                    <div className="crp-brand">
                      <span className="crp-logo" aria-hidden>
                        P
                      </span>
                      <div>
                        <strong>Panacea Childcare</strong>
                        <p>Hams Kids Home | Daycare</p>
                        <em>Hyderabad, India</em>
                      </div>
                    </div>
                    <div className="crp-title">
                      <h2>DEPOSIT NOTE</h2>
                      <span>{deposit.ref}</span>
                      <strong className="crp-paid">{formatInrShort(deposit.amount)} Deposit</strong>
                    </div>
                  </header>

                  <div className="crp-grid">
                    <div>
                      <span>Student Name</span>
                      <strong>{student.name}</strong>
                      <span>Admission No.</span>
                      <strong>{student.admissionNumber || '—'}</strong>
                      <span>Payment Mode</span>
                      <strong>{deposit.paymentMode || '—'}</strong>
                    </div>
                    <div>
                      <span>Reference</span>
                      <strong>{deposit.ref}</strong>
                      <span>Date Issued</span>
                      <strong>{formatBillingDateLong(deposit.date)}</strong>
                      <span>Issued Against</span>
                      <strong>{deposit.issuedAgainst}</strong>
                    </div>
                  </div>

                  <table className="crp-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>DESCRIPTION</th>
                        <th>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formatBillingDateLong(deposit.date)}</td>
                        <td>
                          <strong>{deposit.transaction || deposit.description || 'Deposit'}</strong>
                          <em>{deposit.ref}</em>
                        </td>
                        <td>{formatInrShort(deposit.amount)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="crp-totals">
                    <div>
                      <span>Recorded by</span>
                      <strong>{deposit.recordedBy}</strong>
                    </div>
                    <div>
                      <span>Approved by</span>
                      <strong>{deposit.approvedBy || '—'}</strong>
                    </div>
                    <div className="crp-total-amt">
                      <span>Total</span>
                      <strong>{formatInrShort(deposit.amount)}</strong>
                    </div>
                  </div>

                  <footer className="crp-foot">
                    <p>Authorized Signatory</p>
                    <em>Panacea ChildCare</em>
                  </footer>
                </article>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
