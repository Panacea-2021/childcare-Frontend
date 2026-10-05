'use client';

import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Smile,
  Table2,
  Underline,
  Undo2,
} from 'lucide-react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

function ToolbarBtn({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="les-rte-btn"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your lesson description…',
  disabled = false,
  error,
}: Props) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || syncing.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    syncing.current = true;
    onChange(el.innerHTML);
    queueMicrotask(() => {
      syncing.current = false;
    });
  }, [onChange]);

  const run = (command: string, arg?: string) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL');
    if (!url) return;
    run('createLink', url);
  };

  const insertTable = () => {
    run(
      'insertHTML',
      '<table style="width:100%;border-collapse:collapse"><tr><td style="border:1px solid #E8EDF5;padding:6px">Cell</td><td style="border:1px solid #E8EDF5;padding:6px">Cell</td></tr><tr><td style="border:1px solid #E8EDF5;padding:6px">Cell</td><td style="border:1px solid #E8EDF5;padding:6px">Cell</td></tr></table><p></p>',
    );
  };

  const insertEmoji = () => {
    const emoji = window.prompt('Insert emoji', '✨');
    if (!emoji) return;
    run('insertText', emoji);
  };

  return (
    <div className={`les-rte ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <div className="les-rte-toolbar" role="toolbar" aria-label="Formatting" aria-controls={id}>
        <ToolbarBtn label="Bold" onClick={() => run('bold')} disabled={disabled}>
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Italic" onClick={() => run('italic')} disabled={disabled}>
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Underline" onClick={() => run('underline')} disabled={disabled}>
          <Underline size={15} />
        </ToolbarBtn>
        <span className="les-rte-sep" aria-hidden />
        <ToolbarBtn label="Bulleted list" onClick={() => run('insertUnorderedList')} disabled={disabled}>
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Numbered list" onClick={() => run('insertOrderedList')} disabled={disabled}>
          <ListOrdered size={15} />
        </ToolbarBtn>
        <span className="les-rte-sep" aria-hidden />
        <ToolbarBtn label="Align left" onClick={() => run('justifyLeft')} disabled={disabled}>
          <AlignLeft size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Align center" onClick={() => run('justifyCenter')} disabled={disabled}>
          <AlignCenter size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Align right" onClick={() => run('justifyRight')} disabled={disabled}>
          <AlignRight size={15} />
        </ToolbarBtn>
        <span className="les-rte-sep" aria-hidden />
        <ToolbarBtn label="Insert link" onClick={insertLink} disabled={disabled}>
          <Link2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Insert table" onClick={insertTable} disabled={disabled}>
          <Table2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Insert emoji" onClick={insertEmoji} disabled={disabled}>
          <Smile size={15} />
        </ToolbarBtn>
        <span className="les-rte-sep" aria-hidden />
        <ToolbarBtn label="Undo" onClick={() => run('undo')} disabled={disabled}>
          <Undo2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Redo" onClick={() => run('redo')} disabled={disabled}>
          <Redo2 size={15} />
        </ToolbarBtn>
      </div>
      <div
        id={id}
        ref={ref}
        className="les-rte-editor"
        contentEditable={!disabled}
        role="textbox"
        aria-multiline
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
      />
      {error ? <p className="cal-field-error">{error}</p> : null}
    </div>
  );
}
