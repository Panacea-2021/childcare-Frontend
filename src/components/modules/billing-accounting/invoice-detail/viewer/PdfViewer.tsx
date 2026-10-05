'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { easeOutCubic } from '../animations';

type Props = {
  url: string;
  zoom: number;
  rotation: number;
  fit: 'width' | 'page' | 'manual';
};

type PdfDoc = {
  getPage: (n: number) => Promise<{
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<unknown>; cancel: () => void };
  }>;
  destroy?: () => Promise<unknown> | void;
};

let pdfjsReady: Promise<typeof import('pdfjs-dist')> | null = null;

function loadPdfJs() {
  if (!pdfjsReady) {
    pdfjsReady = import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return pdfjs;
    });
  }
  return pdfjsReady;
}

function isCancelError(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const name = 'name' in err ? String((err as { name?: string }).name) : '';
  const message = 'message' in err ? String((err as { message?: string }).message) : '';
  return (
    name === 'RenderingCancelledException' ||
    name === 'AbortException' ||
    /cancel/i.test(message)
  );
}

export function PdfViewer({ url, zoom, rotation, fit }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [stageSize, setStageSize] = useState({ w: 900, h: 700 });
  const [pageSize, setPageSize] = useState({ w: 595, h: 842 });
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let timer: number | null = null;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width < 40 || height < 40) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setStageSize({ w: width, h: height }), 80);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // Load PDF document once per URL
  useEffect(() => {
    let cancelled = false;
    docRef.current = null;
    setLoading(true);
    setUseFallback(false);

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const bytes = await fetch(url).then((r) => {
          if (!r.ok) throw new Error(`Failed to fetch PDF (${r.status})`);
          return r.arrayBuffer();
        });
        if (cancelled) return;

        const task = pdfjs.getDocument({ data: new Uint8Array(bytes) });
        const pdf = (await task.promise) as unknown as PdfDoc;
        if (cancelled) {
          await pdf.destroy?.();
          return;
        }
        docRef.current = pdf;
        const page = await pdf.getPage(1);
        const base = page.getViewport({ scale: 1 });
        setPageSize({ w: base.width, h: base.height });
        // Trigger paint via loading flag flip in paint effect
        setLoading(false);
      } catch (err) {
        if (cancelled || isCancelError(err)) return;
        console.error('[InvoicePdfViewer] load failed', err);
        setUseFallback(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* ignore */
      }
      const doc = docRef.current;
      docRef.current = null;
      void doc?.destroy?.();
    };
  }, [url]);

  // Paint current page whenever zoom / fit / stage changes
  useEffect(() => {
    if (useFallback || loading) return;
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    let cancelled = false;

    (async () => {
      try {
        try {
          renderTaskRef.current?.cancel();
        } catch {
          /* ignore */
        }

        const page = await doc.getPage(1);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        const pad = 32;
        const usableW = Math.max(320, stageSize.w - pad * 2);
        const usableH = Math.max(400, stageSize.h - pad * 2);
        const fitWidthScale = Math.max(0.45, Math.min(2.2, usableW / base.width));
        const fitPageScale = Math.max(0.4, Math.min(fitWidthScale, usableH / base.height));
        const scale = fit === 'width' ? fitWidthScale : fit === 'page' ? fitPageScale : zoom;

        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * outputScale });
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas 2D unavailable');

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
        canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;

        const task = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (cancelled || isCancelError(err)) return;
        console.error('[InvoicePdfViewer] render failed', err);
        setUseFallback(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [loading, useFallback, zoom, fit, stageSize.w, stageSize.h]);

  const pad = 32;
  const fitWidthScale = Math.max(0.45, Math.min(2.2, (stageSize.w - pad * 2) / pageSize.w));
  const fitPageScale = Math.max(0.4, Math.min(fitWidthScale, (stageSize.h - pad * 2) / pageSize.h));
  const displayScale = fit === 'width' ? fitWidthScale : fit === 'page' ? fitPageScale : zoom;
  const frameW = pageSize.w * displayScale;
  const frameH = pageSize.h * displayScale;
  const fallbackSrc = `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <motion.div
      ref={stageRef}
      className="ivw-pdf-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOutCubic }}
    >
      <div
        className="ivw-pdf-frame-wrap ivw-pdf-canvas-wrap"
        style={{
          transform: `rotate(${rotation}deg)`,
          width: useFallback ? Math.min(frameW, Math.max(280, stageSize.w - 48)) : frameW,
          minHeight: useFallback ? Math.min(frameH, Math.max(360, stageSize.h - 48)) : frameH,
          height: useFallback ? Math.min(frameH, Math.max(360, stageSize.h - 48)) : undefined,
        }}
      >
        {loading ? <div className="ivw-pdf-loading">Rendering invoice…</div> : null}
        {useFallback ? (
          <object data={fallbackSrc} type="application/pdf" className="ivw-pdf-object" title="Invoice PDF">
            <a href={url} className="ivw-pdf-loading" download>
              Open downloaded PDF
            </a>
          </object>
        ) : (
          <canvas ref={canvasRef} className="ivw-pdf-canvas" />
        )}
      </div>
    </motion.div>
  );
}

/** Generates / holds PDF blob lifecycle for the viewer. */
export function PDFGenerator({
  onReady,
  onError,
  generate,
}: {
  generate: () => Promise<Blob>;
  onReady: (url: string, blob: Blob) => void;
  onError: (message: string) => void;
}) {
  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const blob = await generate();
        if (cancelled) return;
        const nextUrl = URL.createObjectURL(blob);
        revoke = nextUrl;
        onReady(nextUrl, blob);
      } catch {
        if (!cancelled) onError('Could not generate PDF');
      }
    })();
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [generate, onReady, onError]);

  return null;
}
