'use client';

import { AnimatePresence } from 'framer-motion';
import {
  Mic,
  Paperclip,
  SendHorizontal,
  Smile,
  Sticker,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AttachmentMenu } from './AttachmentMenu';
import { EmojiPicker } from './EmojiPicker';
import type { MessageType, ReplyDraft } from './types';

const MAX = 2000;

type Props = {
  draft: string;
  reply: ReplyDraft;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onClearReply: () => void;
  onAttach: (type: MessageType, label: string) => void;
  onSendVoice: (duration: string) => void;
  onGif: () => void;
  onSticker: () => void;
};

export function MessageInput({
  draft,
  reply,
  onDraftChange,
  onSend,
  onClearReply,
  onAttach,
  onSendVoice,
  onGif,
  onSticker,
}: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!recording) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [recording]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const startRec = () => {
    setRecording(true);
    setSeconds(0);
    setEmojiOpen(false);
    setAttachOpen(false);
  };

  const cancelRec = () => {
    setRecording(false);
    setSeconds(0);
  };

  const sendRec = () => {
    const mm = String(Math.floor(seconds / 60)).padStart(1, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    onSendVoice(`${mm}:${ss}`);
    setRecording(false);
    setSeconds(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      setEmojiOpen((v) => !v);
    }
  };

  return (
    <div className="sm-composer-wrap">
      {reply ? (
        <div className="sm-reply-bar">
          <div>
            <strong>Replying to {reply.senderName}</strong>
            <div style={{ color: 'var(--text-secondary)' }}>{reply.preview}</div>
          </div>
          <button type="button" className="sm-icon-btn" onClick={onClearReply} aria-label="Cancel reply">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="sm-composer" style={{ position: 'relative' }}>
        <AnimatePresence>
          {emojiOpen ? (
            <EmojiPicker
              onPick={(e) => {
                onDraftChange(draft + e);
                setEmojiOpen(false);
                taRef.current?.focus();
              }}
              onClose={() => setEmojiOpen(false)}
            />
          ) : null}
          {attachOpen ? (
            <AttachmentMenu
              onSelect={(type, label) => {
                onAttach(type, label);
                setAttachOpen(false);
              }}
            />
          ) : null}
        </AnimatePresence>

        {recording ? (
          <div className="sm-recording" role="status" aria-live="polite">
            <span className="sm-rec-pulse" aria-hidden />
            <span className="sm-rec-timer">
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
            </span>
            <div className="sm-voice-wave" style={{ color: 'var(--color-accent)' }} aria-hidden>
              {Array.from({ length: 16 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
            <button type="button" className="ui-btn ui-btn-outline" onClick={cancelRec}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={sendRec}>
              Send
            </button>
          </div>
        ) : (
          <>
            <div className="sm-composer-tools">
              <button
                type="button"
                className="sm-icon-btn"
                aria-label="Emoji"
                aria-expanded={emojiOpen}
                onClick={() => {
                  setEmojiOpen((v) => !v);
                  setAttachOpen(false);
                }}
              >
                <Smile size={18} />
              </button>
              <button type="button" className="sm-icon-btn" aria-label="GIF" onClick={onGif}>
                GIF
              </button>
              <button type="button" className="sm-icon-btn" aria-label="Sticker" onClick={onSticker}>
                <Sticker size={18} />
              </button>
              <button
                type="button"
                className="sm-icon-btn"
                aria-label="Attach file"
                aria-expanded={attachOpen}
                onClick={() => {
                  setAttachOpen((v) => !v);
                  setEmojiOpen(false);
                }}
              >
                <Paperclip size={18} />
              </button>
            </div>
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value.slice(0, MAX))}
              onKeyDown={onKeyDown}
              placeholder="Message your colleagues..."
              aria-label="Message input"
              rows={1}
            />
            {draft.trim() ? (
              <button type="button" className="sm-send-btn" onClick={onSend} aria-label="Send message">
                <SendHorizontal size={18} />
              </button>
            ) : (
              <button type="button" className="sm-send-btn" onClick={startRec} aria-label="Record voice message">
                <Mic size={18} />
              </button>
            )}
          </>
        )}
      </div>
      {!recording ? (
        <div className="sm-char-count" aria-live="polite">
          {draft.length}/{MAX}
        </div>
      ) : null}
    </div>
  );
}
