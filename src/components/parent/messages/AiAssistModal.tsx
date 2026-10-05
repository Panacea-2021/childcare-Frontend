'use client';

import { useEffect, useState } from 'react';
import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  rewriteParentMessage,
  type AiTone,
} from '@/lib/parent/parentMessagesStore';

type Props = {
  open: boolean;
  initialText: string;
  onClose: () => void;
  onAccept: (text: string) => void;
  premiumUnlocked: boolean;
};

const TONES: { id: AiTone; label: string }[] = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'happy', label: 'Happy' },
  { id: 'formal', label: 'Formal' },
];

export function AiAssistModal({
  open,
  initialText,
  onClose,
  onAccept,
  premiumUnlocked,
}: Props) {
  const [tone, setTone] = useState<AiTone>('friendly');
  const [original, setOriginal] = useState(initialText);
  const [suggestion, setSuggestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'original' | 'suggestion'>('original');

  useEffect(() => {
    if (!open) return;
    setOriginal(initialText);
    setSuggestion('');
    setError('');
    setTab('original');
    setTone('friendly');
  }, [open, initialText]);

  const runRewrite = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await rewriteParentMessage(original, tone);
      setSuggestion(res.suggestion);
      setTab('suggestion');
    } catch {
      setError('AI suggestion failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!premiumUnlocked) return null;

  return (
    <Modal
      open={open}
      title="AI Writing Assistant"
      icon={<Sparkles size={18} />}
      onClose={onClose}
      className="pmh-ai-modal"
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={!original.trim()}
            onClick={() => {
              onAccept(original);
              onClose();
            }}
          >
            <ThumbsDown size={14} />
            Keep Original
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary pmh-ai-rewrite"
            disabled={busy}
            onClick={() => void runRewrite()}
          >
            {busy ? 'Rewriting…' : 'Rewrite'}
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={!suggestion.trim()}
            onClick={() => {
              onAccept(suggestion);
              onClose();
            }}
          >
            <ThumbsUp size={14} />
            Accept
          </button>
        </>
      }
    >
      <div className="pmh-modal-stack">
        <div className="ui-field">
          <span className="ui-label">Tone</span>
          <div className="pmh-chip-row" role="group" aria-label="Writing tone">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`pmh-chip${tone === t.id ? ' is-active' : ''}`}
                aria-pressed={tone === t.id}
                onClick={() => setTone(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pmh-ai-panel">
          <div className="pmh-ai-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'original'}
              className={tab === 'original' ? 'is-active' : ''}
              onClick={() => setTab('original')}
            >
              Original
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'suggestion'}
              className={tab === 'suggestion' ? 'is-active' : ''}
              onClick={() => setTab('suggestion')}
              disabled={!suggestion && !busy}
            >
              Suggestion
            </button>
          </div>
          {tab === 'original' ? (
            <textarea
              className="ui-textarea"
              rows={6}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Write your message…"
            />
          ) : busy ? (
            <div className="pmh-ai-skel" aria-busy="true">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <textarea
              className="ui-textarea"
              rows={6}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
          )}
        </div>
        {error ? <p className="pmh-field-error">{error}</p> : null}
      </div>
    </Modal>
  );
}
