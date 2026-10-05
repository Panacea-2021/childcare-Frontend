'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  PenLine,
  Save,
  Type,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createBlankForm, upsertStudentForm } from './formsStore';
import type { PdfOverlayField, PdfOverlayFieldType } from './types';
import { btnMotion } from './animations';
import './student-forms.css';

const TOOLS: Array<{ type: PdfOverlayFieldType; label: string }> = [
  { type: 'text', label: 'Text' },
  { type: 'name', label: 'Name' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'date', label: 'Date' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'initials', label: 'Initials' },
  { type: 'signature', label: 'Signature' },
];

type UploadProps = {
  open: boolean;
  onClose: () => void;
  onUploaded: (fileName: string) => void;
};

export function PdfUploadModal({ open, onClose, onUploaded }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setName(null);
  }, [open]);

  const take = (file: File | null) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) return;
    setName(file.name);
  };

  return (
    <Modal
      open={open}
      title="Upload PDF"
      subtitle="Convert a PDF into a fillable digital form"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!name}
            onClick={() => name && onUploaded(name)}
            {...btnMotion}
          >
            Continue
          </motion.button>
        </>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => take(e.target.files?.[0] ?? null)}
      />
      <div
        className={`sf-dropzone ${dragOver ? 'is-over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          take(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <Upload size={28} color="var(--color-accent)" />
        <h4>{name ?? 'Drag & drop or browse files'}</h4>
        <p>Supported: PDF</p>
      </div>
    </Modal>
  );
}

type EditorProps = {
  fileName: string;
};

export function PdfFormEditor({ fileName }: EditorProps) {
  const router = useRouter();
  const [tool, setTool] = useState<PdfOverlayFieldType>('text');
  const [fields, setFields] = useState<PdfOverlayField[]>([]);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const placeField = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragId.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / zoom) - 60;
    const y = ((e.clientY - rect.top) / zoom) - 14;
    const field: PdfOverlayField = {
      id: `pdf-${Date.now()}`,
      type: tool,
      label: TOOLS.find((t) => t.type === tool)?.label ?? tool,
      required: tool === 'signature' || tool === 'name',
      x: Math.max(8, x),
      y: Math.max(8, y),
      page,
      width: tool === 'signature' ? 160 : tool === 'checkbox' ? 24 : 120,
      height: tool === 'signature' ? 48 : 28,
    };
    setFields((prev) => [...prev, field]);
  };

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const f = fields.find((x) => x.id === id);
    if (!f) return;
    dragId.current = id;
    dragOffset.current = { x: e.clientX / zoom - f.x, y: e.clientY / zoom - f.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragId.current) return;
    const id = dragId.current;
    const nx = e.clientX / zoom - dragOffset.current.x;
    const ny = e.clientY / zoom - dragOffset.current.y;
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, x: Math.max(0, nx), y: Math.max(0, ny) } : f)));
  };

  const onPointerUp = () => {
    dragId.current = null;
  };

  const toggleRequired = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f)));
  };

  const save = () => {
    const form = createBlankForm({
      title: fileName.replace(/\.pdf$/i, '') || 'Fillable PDF Form',
      description: `Fillable fields over ${fileName}`,
      source: 'pdf',
      pdfName: fileName,
      fields: fields.map((f) => ({
        id: f.id,
        type: f.type === 'name' || f.type === 'initials' ? 'text' : f.type === 'checkbox' ? 'checkbox' : f.type === 'signature' ? 'signature' : f.type === 'date' ? 'date' : f.type === 'dropdown' ? 'dropdown' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'phone' : 'text',
        label: f.label,
        required: f.required,
        width: 'full',
        size: 'md',
        visibility: 'visible',
        placeholder: `Enter ${f.label.toLowerCase()}`,
        helpText: `Placed on page ${f.page}`,
        defaultValue: '',
        validation: '',
        conditionalLogic: '',
        options: f.type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      })),
    });
    upsertStudentForm(form);
    flash('Saved');
    router.push(`/enquiries/forms/builder?id=${form.id}`);
  };

  const download = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text(`Fillable PDF: ${fileName}`, 14, 20);
    fields.forEach((f, i) => {
      doc.text(`${i + 1}. ${f.label} (${f.type}) p.${f.page}`, 14, 32 + i * 8);
    });
    doc.save(`${fileName.replace(/\.pdf$/i, '')}-fields.pdf`);
    flash('Downloaded field map');
  };

  const pageFields = fields.filter((f) => f.page === page);

  return (
    <div className="sfpdf-root">
      <header className="sfpdf-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="sf-icon-btn" aria-label="Close" onClick={() => router.push('/enquiries/forms')} style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'transparent', color: '#fff' }}>
            <X size={16} />
          </button>
          <div>
            <strong>{fileName}</strong>
            <div className="sf-meta" style={{ color: '#94a3b8' }}>
              Click the page to place fields · drag to reposition
            </div>
          </div>
        </div>
        <div className="sfpdf-tools">
          {TOOLS.map((t) => (
            <button
              key={t.type}
              type="button"
              className={`sfpdf-tool ${tool === t.type ? 'is-active' : ''}`}
              onClick={() => setTool(t.type)}
            >
              {t.type === 'signature' ? <PenLine size={13} /> : t.type === 'checkbox' ? <CheckSquare size={13} /> : <Type size={13} />}
              &nbsp;{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="sfpdf-tool" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '0.82rem' }}>{Math.round(zoom * 100)}%</span>
          <button type="button" className="sfpdf-tool" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            <ZoomIn size={14} />
          </button>
          <button type="button" className="sfpdf-tool" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.82rem' }}>Page {page}</span>
          <button type="button" className="sfpdf-tool" onClick={() => setPage((p) => Math.min(3, p + 1))}>
            <ChevronRight size={14} />
          </button>
          <button type="button" className="sfpdf-tool" onClick={() => flash('Preview ready (mock)')}>
            <Eye size={14} /> Preview
          </button>
          <button type="button" className="sfpdf-tool" onClick={download}>
            <Download size={14} /> Download
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
            <Save size={14} /> Save
          </button>
        </div>
      </header>

      <div className="sfpdf-stage">
        <motion.div
          className="sfpdf-page"
          style={{ transform: `scale(${zoom})` }}
          onClick={placeField}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div style={{ padding: '28px 36px', fontWeight: 700, fontSize: '1.1rem' }}>
            {fileName} · Page {page}
          </div>
          <div className="sfpdf-page-lines" />
          {pageFields.map((f) => (
            <div
              key={f.id}
              className={`sfpdf-overlay ${f.required ? 'is-required' : ''}`}
              style={{ left: f.x, top: f.y, width: f.width, height: f.height }}
              onPointerDown={(e) => onPointerDown(e, f.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                toggleRequired(f.id);
              }}
              title="Drag to move · double-click to toggle required"
            >
              {f.label}
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div className="sf-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
