'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Receipt } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PdfViewer } from '@/components/modules/billing-accounting/invoice-detail/viewer/PdfViewer';
import { createReceiptPdfBlob } from '@/components/modules/billing-accounting/invoice-pdf';
import type { InvoicePayment } from '@/lib/billing-accounting/invoiceStore';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import type { ParentInvoice, ParentInvoicePayment } from './types';
import {
  downloadParentReceiptPdf,
  mapParentInvoiceToCenter,
  mapParentPaymentToCenter,
  type ParentInvoiceStudentContext,
} from './mapToCenterInvoice';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  payment: ParentInvoicePayment | null;
  studentContext?: ParentInvoiceStudentContext;
  onClose: () => void;
  onError?: (message: string) => void;
  onDownloaded?: () => void;
};

export function ParentReceiptPreviewModal({
  open,
  invoice,
  payment,
  studentContext,
  onClose,
  onError,
  onDownloaded,
}: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const mapped = useMemo(() => {
    if (!invoice || !payment) return null;
    try {
      const center = mapParentInvoiceToCenter(invoice, studentContext);
      const centerPayment: InvoicePayment = mapParentPaymentToCenter(payment);
      return { center, centerPayment };
    } catch {
      return null;
    }
  }, [invoice, payment, studentContext]);

  const revoke = useCallback(() => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open || !mapped) {
      revoke();
      setLoadError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    revoke();

    createReceiptPdfBlob(mapped.center, mapped.centerPayment)
      .then((blob) => {
        if (cancelled) return;
        setPdfUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!cancelled) {
          const msg = 'Unable to load receipt preview. Please try again.';
          setLoadError(msg);
          onError?.(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, mapped, revoke, onError]);

  useEffect(() => () => revoke(), [revoke]);

  const handleDownload = async () => {
    if (!mapped || downloading) return;
    setDownloading(true);
    try {
      await downloadParentReceiptPdf(mapped.center, mapped.centerPayment);
      onDownloaded?.();
    } catch {
      const msg = 'Unable to download. Please try again.';
      setLoadError(msg);
      onError?.(msg);
    } finally {
      setDownloading(false);
    }
  };

  if (!invoice || !payment) {
    return (
      <Modal open={false} title="Receipt Preview" onClose={onClose} elevated>
        {null}
      </Modal>
    );
  }

  const receiptLabel = payment.receiptId || payment.reference || invoice.invoiceNumber;

  return (
    <Modal
      open={open}
      title="Receipt Preview"
      subtitle={receiptLabel}
      onClose={downloading ? () => undefined : onClose}
      icon={<Receipt size={18} />}
      elevated
      xl
      autoHeight
      iconClose
      className="pi-preview-modal pi-preview-modal--receipt"
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onClose}
            disabled={downloading}
          >
            Close
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={handleDownload}
            disabled={downloading || loading || !pdfUrl}
            aria-busy={downloading}
            aria-label={`Download receipt ${receiptLabel}`}
          >
            <Download size={15} strokeWidth={2} aria-hidden />
            {downloading ? 'Downloading…' : 'Download Receipt'}
          </button>
        </>
      }
    >
      <div className="pi-preview-body pi-preview-body--receipt">
        {loading ? (
          <div className="pi-preview-loading" role="status">
            Generating receipt…
          </div>
        ) : pdfUrl ? (
          <div className="pi-preview-doc pi-preview-doc--receipt ivw-pdf-host" aria-label="Receipt document">
            <PdfViewer url={pdfUrl} zoom={1} rotation={0} fit="width" />
          </div>
        ) : (
          <p className="pi-preview-error" role="alert">
            {loadError || 'Unable to load receipt preview. Please try again.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
