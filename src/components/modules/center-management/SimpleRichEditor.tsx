'use client';

import { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  Quote,
  Underline,
} from 'lucide-react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: 'full' | 'simple';
  minHeight?: number;
};

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

export function SimpleRichEditor({
  value,
  onChange,
  placeholder = 'Write a message',
  variant = 'full',
  minHeight = 160,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emit = () => {
    onChange(ref.current?.innerHTML ?? '');
  };

  const heading = (level: number) => {
    exec('formatBlock', `H${level}`);
    emit();
  };

  return (
    <div className="et-editor">
      <div className="et-editor-toolbar" role="toolbar" aria-label="Formatting">
        {variant === 'full' ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" className="et-tool" onMouseDown={(e) => { e.preventDefault(); heading(n); }}>
                H{n}
              </button>
            ))}
            <span className="et-tool-sep" />
            <button type="button" className="et-tool" title="Blockquote" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'BLOCKQUOTE'); emit(); }}>
              <Quote size={14} />
            </button>
            <button type="button" className="et-tool" title="List" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); emit(); }}>
              <List size={14} />
            </button>
            <span className="et-tool-sep" />
          </>
        ) : (
          <>
            <button type="button" className="et-tool" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'P'); emit(); }}>
              Normal
            </button>
            <span className="et-tool-sep" />
          </>
        )}
        <button type="button" className="et-tool" title="Bold" onMouseDown={(e) => { e.preventDefault(); exec('bold'); emit(); }}>
          <Bold size={14} />
        </button>
        <button type="button" className="et-tool" title="Italic" onMouseDown={(e) => { e.preventDefault(); exec('italic'); emit(); }}>
          <Italic size={14} />
        </button>
        <button type="button" className="et-tool" title="Underline" onMouseDown={(e) => { e.preventDefault(); exec('underline'); emit(); }}>
          <Underline size={14} />
        </button>
        {variant === 'simple' ? (
          <>
            <span className="et-tool-sep" />
            <button type="button" className="et-tool" title="Align left" onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); emit(); }}>
              <AlignLeft size={14} />
            </button>
            <button type="button" className="et-tool" title="Align center" onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); emit(); }}>
              <AlignCenter size={14} />
            </button>
            <button type="button" className="et-tool" title="Align right" onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); emit(); }}>
              <AlignRight size={14} />
            </button>
            <button type="button" className="et-tool" title="Justify" onMouseDown={(e) => { e.preventDefault(); exec('justifyFull'); emit(); }}>
              <AlignJustify size={14} />
            </button>
          </>
        ) : null}
      </div>
      <div
        ref={ref}
        className="et-editor-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
