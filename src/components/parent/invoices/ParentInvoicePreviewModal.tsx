'use client';

import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { InvoiceCard } from '@/components/modules/billing-accounting/invoice-detail/viewer/InvoiceCard';
import { buildInvoiceViewModel } from '@/components/modules/billing-accounting/invoice-pdf';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import type { ParentInvoice } from './types';
import {
  downloadParentInvoicePdf,
  mapParentInvoiceToCenter,
  type ParentInvoiceStudentContext,
} from './mapToCenterInvoice';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  studentContext?: ParentInvoiceStudentContext;
  onClose: () => void;
  onError?: (message: string) => void;
  onDownloaded?: () => void;
};

export function ParentInvoicePreviewModal({
  open,
  invoice,
  studentContext,
  onClose,
  onError,
  onDownloaded,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const center = useMemo(() => {
    if (!invoice) return null;
    try {
      return mapParentInvoiceToCenter(invoice, studentContext);
    } catch {
      return null;
    }
  }, [invoice, studentContext]);

  const vm = useMemo(() => {
    if (!center) return null;
    try {
      return buildInvoiceViewModel(center);
    } catch {
      return null;
    }
  }, [center]);

  const handleDownload = async () => {
    if (!center || downloading) return;
    setDownloading(true);
    setPreviewError(null);
    try {
      await downloadParentInvoicePdf(center);
      onDownloaded?.();
    } catch {
      const msg = 'Unable to download. Please try again.';
      setPreviewError(msg);
      onError?.(msg);
    } finally {
      setDownloading(false);
    }
  };

  if (!invoice) {
    return (
      <Modal open={false} title="Invoice Preview" onClose={onClose} elevated>
        {null}
      </Modal>
    );
  }

  const loadFailed = open && (!center || !vm);

  return (
    <Modal
      open={open}
      title="Invoice Preview"
      onClose={downloading ? () => undefined : onClose}
      icon={<FileText size={18} />}
      elevated
      xl
      autoHeight
      iconClose
      className="pi-preview-modal"
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
            disabled={downloading || !center}
            aria-busy={downloading}
            aria-label={`Download invoice ${invoice.invoiceNumber}`}
          >
            <Download size={15} strokeWidth={2} aria-hidden />
            {downloading ? 'Downloading…' : 'Download Invoice'}
          </button>
        </>
      }
    >
      <div className="pi-preview-body">
        {loadFailed ? (
          <p className="pi-preview-error" role="alert">
            Unable to load invoice preview. Please try again.
          </p>
        ) : vm ? (
          <div className="pi-preview-doc pi-preview-doc--invoice" aria-label="Invoice document">
            <InvoiceCard vm={vm} />
          </div>
        ) : null}
        {previewError ? (
          <p className="pi-preview-error" role="alert">
            {previewError}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
