'use client';

import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { GradientButton } from './GradientButton';
import type { CenterInvoice } from '@/lib/billing-accounting/invoiceStore';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

type Mode = 'card' | 'pdf';

type Props = {
  invoice: CenterInvoice;
  mode: Mode;
  downloading?: boolean;
  zoom?: number;
  onBack: () => void;
  onDownload: () => void;
  onShowPdf?: () => void;
  onShowCard?: () => void;
  hideCardToggle?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitWidth?: () => void;
  onFitPage?: () => void;
  onRotate?: () => void;
  onFullscreen?: () => void;
  fullscreen?: boolean;
};

export function InvoiceToolbar({
  invoice,
  mode,
  downloading,
  zoom = 1,
  onBack,
  onDownload,
  onShowPdf,
  onShowCard,
  hideCardToggle,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onRotate,
  onFullscreen,
  fullscreen,
}: Props) {
  return (
    <header className={`ivw-toolbar ${mode === 'pdf' ? 'is-pdf' : ''}`}>
      <div className="ivw-toolbar-left">
        <button type="button" className="ivw-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="ivw-toolbar-meta">
          <strong>{invoice.invoiceId}</strong>
          <StatusBadge status={invoice.status} />
          <span className="ivw-toolbar-avatar" aria-hidden>
            {invoice.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={invoice.photoUrl} alt="" />
            ) : (
              initials(invoice.studentName)
            )}
          </span>
          <span className="ivw-toolbar-name">{invoice.studentName}</span>
        </div>
      </div>

      <div className="ivw-toolbar-actions">
        {mode === 'pdf' ? (
          <>
            {!hideCardToggle && onShowCard ? (
              <GradientButton variant="ghost" onClick={onShowCard} title="Invoice card">
                Card
              </GradientButton>
            ) : null}
            <GradientButton variant="ghost" onClick={onZoomOut} title="Zoom out">
              <ZoomOut size={16} />
            </GradientButton>
            <span className="ivw-zoom-label">{Math.round(zoom * 100)}%</span>
            <GradientButton variant="ghost" onClick={onZoomIn} title="Zoom in">
              <ZoomIn size={16} />
            </GradientButton>
            <GradientButton variant="ghost" onClick={onFitWidth} title="Fit width">
              Fit width
            </GradientButton>
            <GradientButton variant="ghost" onClick={onFitPage} title="Fit page">
              Fit page
            </GradientButton>
            <GradientButton variant="ghost" onClick={onRotate} title="Rotate">
              <RotateCw size={16} />
            </GradientButton>
            <GradientButton variant="ghost" onClick={onFullscreen} title="Fullscreen">
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </GradientButton>
          </>
        ) : (
          <GradientButton variant="ghost" onClick={onShowPdf} title="Open PDF viewer">
            PDF view
          </GradientButton>
        )}
        <GradientButton onClick={onDownload} disabled={downloading}>
          <Download size={15} />
          {downloading ? 'Preparing…' : 'Download PDF'}
        </GradientButton>
      </div>
    </header>
  );
}
