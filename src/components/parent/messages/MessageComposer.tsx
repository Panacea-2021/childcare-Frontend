'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ImagePlus,
  Languages,
  Mic,
  SendHorizontal,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';

type PendingImage = {
  id: string;
  name: string;
  url: string;
  file: File;
};

type Props = {
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: (payload: { text: string; image?: PendingImage }) => Promise<void> | void;
  onTranslate: () => void;
  onAi: () => void;
  disabled?: boolean;
};

const EMOJIS = ['😀', '😊', '🥰', '👍', '🙏', '❤️', '🎉', '☀️', '🧸', '📚', '🍎', '✨'];

export function MessageComposer({
  draft,
  onDraftChange,
  onSend,
  onTranslate,
  onAi,
  disabled,
}: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pending, setPending] = useState<PendingImage | null>(null);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [voiceNote, setVoiceNote] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  useEffect(() => {
    if (!recording) return undefined;
    const t = window.setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [recording]);

  const canSend = Boolean(draft.trim() || pending) && !sending && !disabled;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await onSend({ text: draft, image: pending ?? undefined });
      setPending(null);
      setEmojiOpen(false);
      setVoiceNote('');
    } finally {
      setSending(false);
    }
  };

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setVoiceNote('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setVoiceNote('Image must be under 8 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setPending({
      id: `img_${Date.now()}`,
      name: file.name,
      url,
      file,
    });
    setVoiceNote('');
  };

  return (
    <div className="pmh-composer">
      {pending ? (
        <div className="pmh-attach-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pending.url} alt="" />
          <div>
            <strong>{pending.name}</strong>
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(pending.url);
                setPending(null);
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      {recording ? (
        <div className="pmh-rec-bar" role="status">
          <span className="pmh-rec-dot" aria-hidden />
          <strong>
            Recording {String(Math.floor(recSec / 60)).padStart(2, '0')}:
            {String(recSec % 60).padStart(2, '0')}
          </strong>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => {
              setRecording(false);
              setRecSec(0);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              setRecording(false);
              setRecSec(0);
              setVoiceNote(
                'Voice messages are ready in the UI. Sending will connect when the voice API is available.',
              );
            }}
          >
            Stop
          </button>
        </div>
      ) : null}

      {voiceNote ? <p className="pmh-voice-note">{voiceNote}</p> : null}

      <textarea
        ref={taRef}
        className="pmh-composer-input"
        rows={1}
        value={draft}
        disabled={disabled || sending}
        placeholder="Type your message here…"
        aria-label="Message"
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
      />

      <div className="pmh-composer-bar">
        <div className="pmh-composer-tools">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onPickImage(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="pmh-icon-btn"
            aria-label="Attach image"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={18} />
          </button>
          <div className="pmh-emoji-wrap">
            <button
              type="button"
              className="pmh-icon-btn"
              aria-label="Emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile size={18} />
            </button>
            <AnimatePresence>
              {emojiOpen ? (
                <motion.div
                  className="pmh-emoji-pop"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  role="listbox"
                  aria-label="Emoji picker"
                >
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        onDraftChange(draft + e);
                        setEmojiOpen(false);
                        taRef.current?.focus();
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <button
            type="button"
            className="pmh-icon-btn"
            aria-label="Voice message"
            onClick={() => {
              setRecording(true);
              setRecSec(0);
              setEmojiOpen(false);
            }}
          >
            <Mic size={18} />
          </button>
        </div>

        <div className="pmh-composer-actions">
          <button type="button" className="pmh-action-chip is-translate" onClick={onTranslate}>
            <Languages size={14} />
            Translate
          </button>
          <button type="button" className="pmh-action-chip is-ai" onClick={onAi}>
            <Sparkles size={14} />
            AI Suggestion
          </button>
          <button
            type="button"
            className="pmh-send"
            aria-label="Send message"
            disabled={!canSend}
            onClick={() => void submit()}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
