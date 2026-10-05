'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { LABEL_COLORS } from './constants';

type AreaProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
};

export function AddDevelopmentAreaPopup({ open, onClose, onSave }: AreaProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setName('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const submit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onSave(name.trim());
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop les-mini-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog les-mini-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  ✦
                </span>
                <div>
                  <h2 id={titleId}>Add Development Area</h2>
                  <p>Create a new area for lessons</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="cal-dialog-body">
              <div className="ui-field">
                <label className="ui-label" htmlFor="dev-area-name">
                  Development Area Name
                </label>
                <input
                  id="dev-area-name"
                  className="ui-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emotional Regulation"
                  autoFocus
                />
                {error ? <p className="cal-field-error">{error}</p> : null}
              </div>
            </div>
            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="cal-btn-save" onClick={submit}>
                <span className="cal-btn-save-shine" aria-hidden />
                Save
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

type LabelProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
};

export function AddLabelPopup({ open, onClose, onSave }: LabelProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setName('');
      setColor(LABEL_COLORS[0]);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const submit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onSave(name.trim(), color);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop les-mini-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog les-mini-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  🏷
                </span>
                <div>
                  <h2 id={titleId}>Add Label</h2>
                  <p>Name and color for quick tagging</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="cal-dialog-body">
              <div className="ui-field">
                <label className="ui-label" htmlFor="label-name">
                  Label Name
                </label>
                <input
                  id="label-name"
                  className="ui-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sensory"
                  autoFocus
                />
                {error ? <p className="cal-field-error">{error}</p> : null}
              </div>
              <div className="ui-field">
                <span className="ui-label">Color</span>
                <div className="les-color-grid" role="group" aria-label="Label color">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`les-color-swatch ${color === c ? 'is-on' : ''}`}
                      style={{ background: c }}
                      aria-label={c}
                      aria-pressed={color === c}
                      onClick={() => setColor(c)}
                    />
                  ))}
                  <label className="les-color-custom">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      aria-label="Custom color"
                    />
                  </label>
                </div>
              </div>
            </div>
            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="cal-btn-save" onClick={submit}>
                <span className="cal-btn-save-shine" aria-hidden />
                Save
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
