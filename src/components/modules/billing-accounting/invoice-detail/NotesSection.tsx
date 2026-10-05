'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilLine, Save } from 'lucide-react';
import {
  type CenterInvoice,
  updateCenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { GlassCard, SectionTitle } from './GlassCard';
import { easeOutCubic } from './animations';

type Props = {
  invoice: CenterInvoice;
  onChange: (next: CenterInvoice) => void;
  /** Parent portal: show parent notes only (read-only). */
  readOnly?: boolean;
};

function AutoTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  max = 800,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.max(96, el.scrollHeight)}px`;
  }, [value]);

  return (
    <div className="ui-field ivd-note-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className="ui-textarea"
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="ivd-char-count">
        {value.length}/{max}
      </span>
    </div>
  );
}

export function NotesSection({ invoice, onChange, readOnly = false }: Props) {
  const [open, setOpen] = useState(readOnly);
  const [schoolNotes, setSchoolNotes] = useState(invoice.schoolNotes ?? '');
  const [parentNotes, setParentNotes] = useState(invoice.parentNotes ?? '');
  const [emailParent, setEmailParent] = useState(Boolean(invoice.emailParent));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setSchoolNotes(invoice.schoolNotes ?? '');
    setParentNotes(invoice.parentNotes ?? '');
    setEmailParent(Boolean(invoice.emailParent));
  }, [invoice.id, invoice.schoolNotes, invoice.parentNotes, invoice.emailParent]);

  const save = () => {
    const next = updateCenterInvoice(invoice.id, {
      schoolNotes,
      parentNotes,
      emailParent,
    });
    if (next) onChange(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  if (readOnly) {
    return (
      <GlassCard className="ivd-notes" delay={0.24}>
        <SectionTitle title="Notes" />
        <div className="ui-field ivd-note-field">
          <label className="ui-label">Parent Notes (Visible to parents*)</label>
          <textarea
            className="ui-textarea"
            value={parentNotes || ''}
            readOnly
            placeholder="No parent notes on this invoice."
            rows={4}
          />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="ivd-notes" delay={0.24}>
      <SectionTitle
        title="Notes"
        action={
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? (
              <>
                <ChevronDown size={16} />
                Hide notes
              </>
            ) : (
              <>
                <PencilLine size={16} />
                Edit notes
              </>
            )}
          </button>
        }
      />

      {!open ? (
        <p className="ivd-notes-preview">
          {schoolNotes || parentNotes
            ? 'Notes saved for this invoice. Expand to edit.'
            : 'No notes yet. Add school or parent notes when you are ready.'}
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="ivd-notes-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutCubic }}
          >
            <div className="ivd-email-toggle">
              <span className="ui-label">Send invoice via email to parent</span>
              <div className="ivd-radio-row" role="radiogroup" aria-label="Email parent">
                <label className={`ivd-radio${emailParent ? ' is-on' : ''}`}>
                  <input
                    type="radio"
                    name="email-parent"
                    checked={emailParent}
                    onChange={() => setEmailParent(true)}
                  />
                  Yes
                </label>
                <label className={`ivd-radio${!emailParent ? ' is-on' : ''}`}>
                  <input
                    type="radio"
                    name="email-parent"
                    checked={!emailParent}
                    onChange={() => setEmailParent(false)}
                  />
                  No
                </label>
              </div>
            </div>

            <AutoTextarea
              id="school-notes"
              label="School Notes (Not visible to parents*)"
              value={schoolNotes}
              onChange={setSchoolNotes}
              placeholder="School Notes (Not visible to parents*)"
            />
            <AutoTextarea
              id="parent-notes"
              label="Parent Notes (Visible to parents*)"
              value={parentNotes}
              onChange={setParentNotes}
              placeholder="Parent Notes (Visible to parents*)"
            />

            <div className="ivd-notes-actions">
              <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
                <Save size={16} />
                {savedFlash ? 'Saved' : 'Save notes'}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassCard>
  );
}
