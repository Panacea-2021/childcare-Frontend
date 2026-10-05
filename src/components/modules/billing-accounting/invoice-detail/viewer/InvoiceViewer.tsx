'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CenterInvoice } from '@/lib/billing-accounting/invoiceStore';
import {
  buildInvoiceViewModel,
  createInvoicePdfBlob,
  downloadInvoicePdf,
} from '../../invoice-pdf';
import { easeOutCubic } from '../animations';
import { InvoiceToolbar } from './InvoiceToolbar';
import { InvoiceCard } from './InvoiceCard';
import { PdfViewer } from './PdfViewer';

type Props = {
  invoice: CenterInvoice;
  onBack: () => void;
  onRecordPayment?: () => void;
  /** Open directly in PDF viewer (zoom / fit / download) — skip invoice card. */
  initialMode?: 'card' | 'pdf';
};

export function InvoiceViewer({ invoice, onBack, initialMode = 'card' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const vm = useMemo(() => buildInvoiceViewModel(invoice), [invoice]);
  const pdfOnly = initialMode === 'pdf';
  const [mode, setMode] = useState<'card' | 'pdf'>(initialMode);
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<'width' | 'page' | 'manual'>('width');
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const revokePdf = useCallback(() => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => () => revokePdf(), [revokePdf]);

  const ensurePdf = useCallback(async () => {
    const blob = await createInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return { blob, url };
  }, [invoice]);

  const openPdfViewer = async () => {
    setDownloading(true);
    setError(null);
    try {
      await ensurePdf();
      setMode('pdf');
      setFit('width');
      setZoom(1);
    } catch {
      setError('Could not generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!pdfOnly) return;
    let cancelled = false;
    (async () => {
      setDownloading(true);
      setError(null);
      try {
        await ensurePdf();
        if (!cancelled) {
          setMode('pdf');
          setFit('width');
          setZoom(1);
        }
      } catch {
        if (!cancelled) setError('Could not generate PDF');
      } finally {
        if (!cancelled) setDownloading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfOnly, ensurePdf]);

  const handleBack = () => {
    if (pdfOnly || mode === 'card') onBack();
    else setMode('card');
  };

  const download = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadInvoicePdf(invoice);
      await ensurePdf();
      setMode('pdf');
      setFit('width');
      flash('PDF downloaded');
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
      flash('Fullscreen unavailable');
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (mode !== 'pdf' || !e.ctrlKey) return;
      e.preventDefault();
      setFit('manual');
      setZoom((z) => {
        const next = e.deltaY > 0 ? z - 0.08 : z + 0.08;
        return Math.min(2.4, Math.max(0.45, Number(next.toFixed(2))));
      });
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [mode]);

  return (
    <motion.div
      ref={rootRef}
      className={`ivw-root ${mode === 'pdf' ? 'is-pdf-mode' : ''}`}
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: easeOutCubic }}
    >
      <div className="ivw-mesh" aria-hidden>
        <span className="ivw-orb ivw-orb-a" />
        <span className="ivw-orb ivw-orb-b" />
        <span className="ivw-orb ivw-orb-c" />
        <span className="ivw-noise" />
        <span className="ivw-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
      </div>

      <InvoiceToolbar
        invoice={invoice}
        mode={mode}
        downloading={downloading}
        zoom={fit === 'manual' ? zoom : fit === 'width' ? 1 : 0.85}
        onBack={handleBack}
        onDownload={download}
        onShowPdf={openPdfViewer}
        onShowCard={pdfOnly ? undefined : () => setMode('card')}
        hideCardToggle={pdfOnly}
        onZoomIn={() => {
          setFit('manual');
          setZoom((z) => Math.min(2.4, Number((z + 0.1).toFixed(2))));
        }}
        onZoomOut={() => {
          setFit('manual');
          setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))));
        }}
        onFitWidth={() => {
          setFit('width');
          setZoom(1);
        }}
        onFitPage={() => {
          setFit('page');
          setZoom(0.85);
        }}
        onRotate={() => setRotation((r) => (r + 90) % 360)}
        onFullscreen={toggleFullscreen}
        fullscreen={fullscreen}
      />

      {error ? <p className="ivw-error">{error}</p> : null}

      <div className="ivw-stage">
        <AnimatePresence mode="wait">
          {mode === 'card' ? (
            <motion.div
              key="card"
              className="ivw-card-stage"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: easeOutCubic }}
            >
              <InvoiceCard vm={vm} />
            </motion.div>
          ) : pdfUrl ? (
            <motion.div
              key="pdf"
              className="ivw-pdf-host"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PdfViewer url={pdfUrl} zoom={zoom} rotation={rotation} fit={fit} />
            </motion.div>
          ) : (
            <motion.div key="loading" className="ivw-loading">
              Preparing PDF…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast ? (
        <span className="ivw-toast" role="status">
          {toast}
        </span>
      ) : null}
    </motion.div>
  );
}

export { InvoiceViewer as InvoicePreviewPage };
