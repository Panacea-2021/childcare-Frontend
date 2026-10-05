'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Columns3,
  Divide,
  Eye,
  Heading2,
  Image as ImageIcon,
  Code2,
  Monitor,
  Redo2,
  Smartphone,
  Square,
  TextCursorInput,
  Trash2,
  Undo2,
  Video,
} from 'lucide-react';
import type { NewsletterItem } from '@/types/newsletter';
import {
  createDefaultBlocks,
  getNewsletterDoc,
  loadNewsletterList,
  saveNewsletterDoc,
  saveNewsletterList,
  type NewsletterBlock,
  type NewsletterBlockType,
} from '@/lib/newsletters/storage';
import './editor.css';

type PaletteTab = 'content' | 'blocks' | 'body';
type DeviceMode = 'desktop' | 'mobile';

const CONTENT_ITEMS: { type: NewsletterBlockType; label: string; icon: ReactNode }[] = [
  { type: 'columns', label: 'Columns', icon: <Columns3 size={18} /> },
  { type: 'button', label: 'Button', icon: <Square size={18} /> },
  { type: 'divider', label: 'Divider', icon: <Divide size={18} /> },
  { type: 'heading', label: 'Heading', icon: <Heading2 size={18} /> },
  { type: 'paragraph', label: 'Paragraph', icon: <TextCursorInput size={18} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon size={18} /> },
  { type: 'video', label: 'Video', icon: <Video size={18} /> },
  { type: 'html', label: 'HTML', icon: <Code2 size={18} /> },
];

function defaultContent(type: NewsletterBlockType): string {
  switch (type) {
    case 'heading':
      return 'New Heading';
    case 'paragraph':
      return 'Write your newsletter paragraph here…';
    case 'button':
      return 'Call to Action';
    case 'image':
      return 'Image placeholder';
    case 'video':
      return 'Video placeholder';
    case 'columns':
      return 'Two-column layout';
    case 'html':
      return '<div>Custom HTML</div>';
    case 'divider':
      return '';
    default:
      return '';
  }
}

function formatDateLabel(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function NewsletterEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [docId, setDocId] = useState(() => editId || `nl-${Date.now()}`);
  const [title, setTitle] = useState('Untitled Newsletter');
  const [blocks, setBlocks] = useState<NewsletterBlock[]>(() => createDefaultBlocks());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<PaletteTab>('content');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<NewsletterBlock[][]>([]);
  const [future, setFuture] = useState<NewsletterBlock[][]>([]);

  useEffect(() => {
    if (!editId) return;
    const list = loadNewsletterList();
    const meta = list.find((n) => n.id === editId);
    const doc = getNewsletterDoc(editId);
    setDocId(editId);
    if (meta) setTitle(meta.title);
    if (doc?.blocks?.length) {
      setBlocks(doc.blocks);
      setTitle(doc.title || meta?.title || 'Untitled Newsletter');
    }
  }, [editId]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const pushHistory = useCallback((prev: NewsletterBlock[]) => {
    setHistory((h) => [...h.slice(-30), prev]);
    setFuture([]);
  }, []);

  const updateBlocks = useCallback(
    (updater: (prev: NewsletterBlock[]) => NewsletterBlock[]) => {
      setBlocks((prev) => {
        const next = updater(prev);
        pushHistory(prev);
        return next;
      });
    },
    [pushHistory],
  );

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1]!;
      setFuture((f) => [blocks, ...f]);
      setBlocks(prev);
      return h.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0]!;
      setHistory((h) => [...h, blocks]);
      setBlocks(next);
      return f.slice(1);
    });
  };

  const addBlock = (type: NewsletterBlockType) => {
    const block: NewsletterBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      content: defaultContent(type),
      align: type === 'heading' || type === 'button' ? 'center' : 'left',
    };
    updateBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
  };

  const onPaletteDragStart = (e: DragEvent, type: NewsletterBlockType) => {
    e.dataTransfer.setData('text/nl-block-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/nl-block-type') as NewsletterBlockType;
    if (!type) return;
    addBlock(type);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: string) => {
    updateBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const persist = (status: NewsletterItem['status'], asTemplate = false) => {
    const now = new Date();
    const list = loadNewsletterList();
    const existing = list.find((n) => n.id === docId);
    const item: NewsletterItem = {
      id: docId,
      title: title.trim() || 'Untitled Newsletter',
      createdBy: existing?.createdBy ?? 'Center Administrator',
      createdById: existing?.createdById ?? 'admin',
      sentTo: status === 'sent' ? 'All Parents' : '—',
      audience: 'all_parents',
      status: asTemplate ? 'template' : status,
      updatedOn: formatDateLabel(now),
      updatedAtIso: now.toISOString(),
      previewColor: existing?.previewColor ?? '#C7D2FE',
      isTemplate: asTemplate || status === 'template',
    };

    const nextList = existing
      ? list.map((n) => (n.id === docId ? item : n))
      : [item, ...list];
    saveNewsletterList(nextList);
    saveNewsletterDoc({
      id: docId,
      title: item.title,
      blocks,
      updatedAtIso: item.updatedAtIso,
    });
  };

  const goBack = () => router.push('/parent-communication/newsletters');

  const selected = useMemo(
    () => blocks.find((b) => b.id === selectedId) ?? null,
    [blocks, selectedId],
  );

  return (
    <div className="nl-editor">
      <div className="nl-editor-top">
        <button type="button" className="nl-editor-back" onClick={goBack}>
          <ArrowLeft size={16} aria-hidden />
          Create Newsletter
        </button>
        <div className="nl-editor-actions">
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => {
              persist('template', true);
              showToast('Saved as template');
            }}
          >
            Save As Template
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => {
              persist('draft');
              showToast('Draft saved');
            }}
          >
            Save As Draft
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              persist('sent');
              showToast('Newsletter sent (demo)');
              window.setTimeout(goBack, 700);
            }}
          >
            Send Newsletter
          </button>
        </div>
      </div>

      <div className="nl-editor-body">
        <section className="nl-editor-main" aria-label="Newsletter canvas">
          <div className="nl-editor-toolbar">
            <div className="nl-toolbar-group">
              <button type="button" className="nl-tool-btn" aria-label="Undo" disabled={!history.length} onClick={undo}>
                <Undo2 size={16} />
              </button>
              <button type="button" className="nl-tool-btn" aria-label="Redo" disabled={!future.length} onClick={redo}>
                <Redo2 size={16} />
              </button>
            </div>
            <div className="nl-toolbar-group">
              <button
                type="button"
                className={`nl-tool-btn ${device === 'desktop' ? 'is-active' : ''}`}
                aria-label="Desktop view"
                onClick={() => setDevice('desktop')}
              >
                <Monitor size={16} />
              </button>
              <button
                type="button"
                className={`nl-tool-btn ${device === 'mobile' ? 'is-active' : ''}`}
                aria-label="Mobile view"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone size={16} />
              </button>
              <button
                type="button"
                className={`nl-tool-btn ${preview ? 'is-active' : ''}`}
                aria-label="Preview"
                onClick={() => setPreview((v) => !v)}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          <div
            className="nl-canvas-scroll"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCanvasDrop}
          >
            <div className={`nl-canvas ${device === 'mobile' ? 'is-mobile' : ''}`}>
              {preview ? <p className="nl-preview-banner">Preview mode — editing is paused</p> : null}
              <input
                className="nl-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Newsletter title"
                disabled={preview}
              />

              {blocks.map((block, index) => {
                const tone =
                  block.type === 'heading' && index === 0
                    ? 'pink'
                    : block.type === 'heading' && index === 1
                      ? 'green'
                      : undefined;
                return (
                  <div
                    key={block.id}
                    className={`nl-block is-${block.type}${selectedId === block.id ? ' is-selected' : ''}`}
                    data-tone={tone}
                    style={{ textAlign: block.align }}
                    onClick={() => !preview && setSelectedId(block.id)}
                  >
                    {selectedId === block.id && !preview ? (
                      <span className="nl-block-tag">{block.type}</span>
                    ) : null}

                    {block.type === 'heading' || block.type === 'paragraph' ? (
                      <textarea
                        className="nl-block-field"
                        rows={block.type === 'heading' ? 1 : 3}
                        value={block.content}
                        disabled={preview}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        onFocus={() => setSelectedId(block.id)}
                      />
                    ) : null}

                    {block.type === 'button' ? (
                      <div className="nl-fake-btn">
                        {preview ? (
                          block.content
                        ) : (
                          <input
                            className="nl-block-field"
                            style={{ color: '#fff', textAlign: 'center', fontWeight: 650 }}
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            onFocus={() => setSelectedId(block.id)}
                          />
                        )}
                      </div>
                    ) : null}

                    {block.type === 'divider' ? <hr /> : null}

                    {block.type === 'image' ||
                    block.type === 'video' ||
                    block.type === 'columns' ||
                    block.type === 'html' ? (
                      <span>{block.content}</span>
                    ) : null}

                    {selectedId === block.id && !preview ? (
                      <div className="nl-block-actions">
                        <button
                          type="button"
                          className="nl-tool-btn"
                          aria-label="Delete block"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlock(block.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="nl-palette" aria-label="Newsletter components">
          <div className="nl-palette-tabs">
            {(['content', 'blocks', 'body'] as PaletteTab[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`nl-palette-tab ${tab === key ? 'is-active' : ''}`}
                onClick={() => setTab(key)}
              >
                {key[0]!.toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="nl-palette-body">
            {tab === 'content' ? (
              <>
                <div className="nl-palette-grid">
                  {CONTENT_ITEMS.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      className="nl-palette-item"
                      draggable
                      onDragStart={(e) => onPaletteDragStart(e, item.type)}
                      onClick={() => addBlock(item.type)}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="nl-palette-hint">
                  Drag a block onto the canvas, or click to add it. Selected block:{' '}
                  <strong>{selected?.type ?? 'none'}</strong>
                </p>
              </>
            ) : null}

            {tab === 'blocks' ? (
              <p className="nl-palette-hint">
                Saved section blocks will appear here. For now, use Content to build your newsletter.
              </p>
            ) : null}

            {tab === 'body' ? (
              <div className="ui-field">
                <label className="ui-label" htmlFor="nl-body-bg">
                  Canvas tip
                </label>
                <p className="nl-palette-hint" style={{ marginTop: 0 }}>
                  Switch Desktop / Mobile in the toolbar to preview how parents will see this email.
                  Use Preview to lock editing.
                </p>
                <input id="nl-body-bg" className="ui-input" value="#FFFFFF" readOnly />
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {toast ? <div className="nl-toast">{toast}</div> : null}
    </div>
  );
}
