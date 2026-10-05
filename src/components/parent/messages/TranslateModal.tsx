'use client';

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { translateParentText } from '@/lib/parent/parentMessagesStore';

const QUICK_LANGS = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'ar', label: 'Arabic' },
] as const;

type Props = {
  open: boolean;
  initialText: string;
  onClose: () => void;
  onAccept: (text: string) => void;
};

export function TranslateModal({ open, initialText, onClose, onAccept }: Props) {
  const [original, setOriginal] = useState(initialText);
  const [lang, setLang] = useState('es');
  const [translated, setTranslated] = useState('');
  const [includeOriginal, setIncludeOriginal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setOriginal(initialText);
    setTranslated('');
    setError('');
    setIncludeOriginal(false);
  }, [open, initialText]);

  useEffect(() => {
    if (!open) return;
    const text = original.trim();
    if (!text) {
      setTranslated('');
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError('');
    const t = window.setTimeout(() => {
      translateParentText(text, lang)
        .then((res) => {
          if (cancelled) return;
          setTranslated(res.translated);
        })
        .catch(() => {
          if (cancelled) return;
          setError('Unable to translate right now. Please try again.');
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, original, lang]);

  const output = includeOriginal
    ? [original.trim(), translated.trim()].filter(Boolean).join('\n')
    : translated.trim();

  return (
    <Modal
      open={open}
      title="Translate text"
      icon={<Languages size={18} />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!output || busy}
            onClick={() => {
              onAccept(output);
              onClose();
            }}
          >
            Accept
          </button>
        </>
      }
    >
      <div className="pmh-modal-stack">
        <div className="ui-field">
          <label className="ui-label" htmlFor="pmh-tr-original">
            Original text
          </label>
          <textarea
            id="pmh-tr-original"
            className="ui-textarea"
            rows={4}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Type or paste text to translate"
          />
        </div>

        <div className="ui-field">
          <span className="ui-label">Translate to</span>
          <div className="pmh-chip-row" role="group" aria-label="Target language">
            {QUICK_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`pmh-chip${lang === l.id ? ' is-active' : ''}`}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
            <label className="pmh-chip pmh-chip-select">
              Select
              <select
                aria-label="More languages"
                value={QUICK_LANGS.some((l) => l.id === lang) ? '' : lang}
                onChange={(e) => {
                  if (e.target.value) setLang(e.target.value);
                }}
              >
                <option value="">…</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </label>
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="pmh-tr-out">
            Translated text
          </label>
          <textarea
            id="pmh-tr-out"
            className="ui-textarea"
            rows={4}
            value={busy ? 'Translating…' : translated}
            readOnly
          />
          {error ? <p className="pmh-field-error">{error}</p> : null}
        </div>

        <label className="pmh-check">
          <input
            type="checkbox"
            checked={includeOriginal}
            onChange={(e) => setIncludeOriginal(e.target.checked)}
          />
          <span>Include original text</span>
        </label>
      </div>
    </Modal>
  );
}
