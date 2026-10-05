'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { CenterInvoice, InvoicePayment } from '@/lib/billing-accounting/invoiceStore';
import { createReceiptPdfBlob, downloadReceiptPdf } from '../invoice-pdf';
import { easeOutCubic } from './animations';
import { GradientButton } from './viewer/GradientButton';
import { PdfViewer } from './viewer/PdfViewer';

type Props = {
  invoice: CenterInvoice;
  payment: InvoicePayment;
  onBack: () => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function ReceiptPreviewPage({ invoice, payment, onBack }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<'width' | 'page' | 'manual'>('width');
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const revoke = useCallback(() => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    revoke();
    createReceiptPdfBlob(invoice, payment)
      .then((blob) => {
        if (cancelled) return;
        setPdfUrl(URL.createObjectURL(blob));
        setFit('width');
        setZoom(1);
        setRotation(0);
      })
      .catch(() => {
        if (!cancelled) setError('Could not generate receipt PDF');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoice, payment, revoke]);

  useEffect(() => () => revoke(), [revoke]);

  const download = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadReceiptPdf(invoice, payment);
    } catch {
      setError('Download failed — try again');
    } finally {
      setDownloading(false);
    }
  };

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
      /* fullscreen unavailable */
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!pdfUrl || !e.ctrlKey) return;
      e.preventDefault();
      setFit('manual');
      setZoom((z) => {
        const next = e.deltaY > 0 ? z - 0.08 : z + 0.08;
        return Math.min(2.4, Math.max(0.45, Number(next.toFixed(2))));
      });
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [pdfUrl]);

  return (
    <motion.div
      ref={rootRef}
      className="ivw-root is-pdf-mode ivd-receipt-preview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.28, ease: easeOutCubic }}
    >
      <header className="ivw-toolbar is-pdf">
        <div className="ivw-toolbar-left">
          <button type="button" className="ivw-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="ivw-toolbar-meta">
            <strong>{payment.receiptId}</strong>
            <span className="ivw-toolbar-avatar" aria-hidden>
              {invoice.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.photoUrl} alt="" />
              ) : (
                initials(invoice.studentName)
              )}
            </span>
            <span className="ivw-toolbar-name">
              {invoice.invoiceId} · {invoice.studentName}
            </span>
          </div>
        </div>

        <div className="ivw-toolbar-actions">
          <GradientButton
            variant="ghost"
            onClick={() => {
              setFit('manual');
              setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))));
            }}
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </GradientButton>
          <span className="ivw-zoom-label">{Math.round(zoom * 100)}%</span>
          <GradientButton
            variant="ghost"
            onClick={() => {
              setFit('manual');
              setZoom((z) => Math.min(2.4, Number((z + 0.1).toFixed(2))));
            }}
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </GradientButton>
          <GradientButton
            variant="ghost"
            onClick={() => {
              setFit('width');
              setZoom(1);
            }}
            title="Fit width"
          >
            Fit width
          </GradientButton>
          <GradientButton
            variant="ghost"
            onClick={() => {
              setFit('page');
              setZoom(1);
            }}
            title="Fit page"
          >
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
          <GradientButton onClick={download} disabled={downloading}>
            <Download size={15} />
            {downloading ? 'Preparing…' : 'Download PDF'}
          </GradientButton>
        </div>
      </header>

      {error ? <p className="ivw-error">{error}</p> : null}

      <div className="ivw-stage">
        {loading ? (
          <div className="ivw-loading">Generating receipt PDF…</div>
        ) : pdfUrl ? (
          <div className="ivw-pdf-host">
            <PdfViewer url={pdfUrl} zoom={zoom} fit={fit} rotation={rotation} />
          </div>
        ) : (
          <div className="ivw-loading">Receipt unavailable</div>
        )}
      </div>
    </motion.div>
  );
}
