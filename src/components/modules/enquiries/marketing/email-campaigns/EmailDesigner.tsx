'use client';

import {
  Code2,
  Divide,
  Heading2,
  Image as ImageIcon,
  Link2,
  Square,
  TextCursorInput,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Trash2,
  Share2,
  PanelBottom,
  Space,
  School,
} from 'lucide-react';
import type { BlockAlign, EmailBlock, EmailBlockType } from './types';
import { createBlockId } from '@/lib/enquiries/emailCampaignsStore';

const TOOLS: { type: EmailBlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'logo', label: 'Logo', icon: <School size={15} /> },
  { type: 'heading', label: 'Heading', icon: <Heading2 size={15} /> },
  { type: 'paragraph', label: 'Text', icon: <TextCursorInput size={15} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon size={15} /> },
  { type: 'button', label: 'Button', icon: <Square size={15} /> },
  { type: 'divider', label: 'Divider', icon: <Divide size={15} /> },
  { type: 'spacer', label: 'Spacer', icon: <Space size={15} /> },
  { type: 'social', label: 'Social Links', icon: <Share2 size={15} /> },
  { type: 'footer', label: 'Footer', icon: <PanelBottom size={15} /> },
  { type: 'html', label: 'HTML', icon: <Code2 size={15} /> },
];

function defaultContent(type: EmailBlockType): Partial<EmailBlock> {
  switch (type) {
    case 'logo':
      return { content: 'Bright Future Academy', align: 'center' };
    case 'heading':
      return { content: 'Summer Camp 2026', align: 'center' };
    case 'paragraph':
      return {
        content: 'Exciting activities await your child this summer.',
        align: 'left',
      };
    case 'image':
      return { content: 'Hero image', align: 'center', meta: { accent: '#E8F2FF' } };
    case 'button':
      return { content: 'Learn More', href: 'https://example.com', align: 'center' };
    case 'social':
      return { content: 'Follow us', align: 'center' };
    case 'footer':
      return {
        content: 'Bright Future Academy · admissions@school.com · Unsubscribe',
        align: 'center',
      };
    case 'html':
      return { content: '<div>Custom HTML block</div>', align: 'left' };
    case 'divider':
    case 'spacer':
      return { content: '', align: 'center' };
    default:
      return { content: '' };
  }
}

type Props = {
  blocks: EmailBlock[];
  selectedId: string | null;
  device: 'desktop' | 'mobile';
  onSelect: (id: string | null) => void;
  onChange: (blocks: EmailBlock[]) => void;
};

export function EmailDesigner({
  blocks,
  selectedId,
  device,
  onSelect,
  onChange,
}: Props) {
  const selected = blocks.find((b) => b.id === selectedId) ?? null;

  const addBlock = (type: EmailBlockType) => {
    const block: EmailBlock = {
      id: createBlockId(),
      type,
      content: '',
      ...defaultContent(type),
    };
    onChange([...blocks, block]);
    onSelect(block.id);
  };

  const updateBlock = (id: string, patch: Partial<EmailBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (selectedId === id) onSelect(null);
  };

  const setAlign = (align: BlockAlign) => {
    if (!selected) return;
    updateBlock(selected.id, { align });
  };

  const wrapSelection = (tag: 'b' | 'i' | 'u') => {
    if (!selected || (selected.type !== 'paragraph' && selected.type !== 'heading')) return;
    updateBlock(selected.id, {
      content: `<${tag}>${selected.content}</${tag}>`,
    });
  };

  return (
    <div className="ec-designer">
      <div className="ec-designer-toolbar">
        {TOOLS.map((t) => (
          <button key={t.type} type="button" className="ec-tool" onClick={() => addBlock(t.type)}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="ec-format-bar">
        <button type="button" className="ec-format-btn" title="Bold" onClick={() => wrapSelection('b')}>
          <Bold size={14} />
        </button>
        <button type="button" className="ec-format-btn" title="Italic" onClick={() => wrapSelection('i')}>
          <Italic size={14} />
        </button>
        <button
          type="button"
          className="ec-format-btn"
          title="Underline"
          onClick={() => wrapSelection('u')}
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          className={`ec-format-btn${selected?.align === 'left' ? ' is-active' : ''}`}
          title="Align left"
          onClick={() => setAlign('left')}
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          className={`ec-format-btn${selected?.align === 'center' ? ' is-active' : ''}`}
          title="Align center"
          onClick={() => setAlign('center')}
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          className={`ec-format-btn${selected?.align === 'right' ? ' is-active' : ''}`}
          title="Align right"
          onClick={() => setAlign('right')}
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          className="ec-format-btn"
          title="Insert link"
          onClick={() => {
            if (!selected || selected.type !== 'button') return;
            const href = window.prompt('Button URL', selected.href || 'https://');
            if (href !== null) updateBlock(selected.id, { href });
          }}
        >
          <Link2 size={14} />
        </button>
      </div>
      <div className="ec-canvas-scroll">
        <div className={`ec-canvas${device === 'mobile' ? ' is-mobile' : ''}`}>
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`ec-block${selectedId === block.id ? ' is-selected' : ''}`}
              style={{ textAlign: block.align || 'left' }}
              onClick={() => onSelect(block.id)}
            >
              <button
                type="button"
                className="ec-block-remove"
                aria-label="Remove block"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
              >
                <Trash2 size={12} />
              </button>
              <BlockContent
                block={block}
                onChange={(content) => updateBlock(block.id, { content })}
              />
            </div>
          ))}
          {blocks.length === 0 ? (
            <p className="ec-muted" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              Add blocks from the toolbar to design your email.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BlockContent({
  block,
  onChange,
}: {
  block: EmailBlock;
  onChange: (content: string) => void;
}) {
  switch (block.type) {
    case 'logo':
      return (
        <div
          className="ec-logo"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
          {block.content}
        </div>
      );
    case 'heading':
      return (
        <h2
          className="ec-heading"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
          {stripTags(block.content)}
        </h2>
      );
    case 'paragraph':
      return (
        <p
          className="ec-paragraph"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
          {stripTags(block.content)}
        </p>
      );
    case 'image':
      return (
        <div
          className="ec-image-ph"
          style={{ background: `linear-gradient(135deg, ${block.meta?.accent || '#E8F2FF'}, #fff)` }}
        >
          {block.content || 'Image'}
        </div>
      );
    case 'button':
      return (
        <button
          type="button"
          className="ec-cta"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
          onClick={(e) => e.preventDefault()}
        >
          {block.content}
        </button>
      );
    case 'divider':
      return <hr className="ec-divider" />;
    case 'spacer':
      return <div className="ec-spacer" />;
    case 'social':
      return <div className="ec-social">Facebook · Instagram · LinkedIn</div>;
    case 'footer':
      return (
        <div
          className="ec-footer"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
          {block.content}
        </div>
      );
    case 'html':
      return (
        <div
          className="ec-html-block"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
          {block.content}
        </div>
      );
    default:
      return null;
  }
}

function stripTags(s: string) {
  return s.replace(/<\/?[^>]+>/g, '');
}
