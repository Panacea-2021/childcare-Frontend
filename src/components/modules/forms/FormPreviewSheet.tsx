'use client';

import { type RefObject } from 'react';
import { motion } from 'framer-motion';
import type { CanvasField } from './builderFieldData';
import type { FormStyleSettings } from './FormStylesSidebar';
import './form-builder.css';
import './form-preview-sheet.css';

const FORM_FONT = 'var(--font-body), Poppins, sans-serif';

export type FormPreviewMode = 'preview' | 'fill' | 'blank';

type Props = {
  title: string;
  fields: CanvasField[];
  styles: FormStyleSettings;
  mode?: FormPreviewMode;
  meta?: string;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  /** Ref attached to the printable sheet root (form only). */
  sheetRef?: RefObject<HTMLDivElement | null>;
};

function SchoolLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 40 40" aria-hidden>
      <path d="M20 4 L34 14 L28 32 L12 32 L6 14 Z" fill="none" stroke="#5d5fef" strokeWidth="2.2" />
      <path d="M20 10 L28 16 L20 28 L12 16 Z" fill="none" stroke="#4b51e0" strokeWidth="1.8" />
    </svg>
  );
}

function PreviewControl({
  field,
  styles,
  interactive,
}: {
  field: CanvasField;
  styles: FormStyleSettings;
  interactive: boolean;
}) {
  const labelStyle = {
    color: styles.labelColor,
    fontSize: `${styles.labelFontSize}px`,
    fontFamily: FORM_FONT,
  };
  const controlStyle = {
    borderColor: styles.fieldBorderColor,
    borderRadius: `${styles.fieldBorderRadius}px`,
    fontFamily: FORM_FONT,
  };
  void styles.fontFamily;
  const disabled = !interactive;

  if (field.kind === 'section') {
    return (
      <h3
        className="fb-preview-section"
        style={{
          color: styles.sectionColor,
          fontSize: `${styles.sectionFontSize}px`,
          fontFamily: FORM_FONT,
        }}
      >
        {field.label}
      </h3>
    );
  }
  if (field.kind === 'pagebreak') {
    return <div className="fb-preview-break">— Page break —</div>;
  }
  if (field.kind === 'instruction') {
    return (
      <p className="fb-preview-help" style={{ fontFamily: FORM_FONT }}>
        {field.label}
      </p>
    );
  }
  if (field.kind === 'radio' || field.kind === 'consent') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-opts">
          {(
            field.options ??
            (field.kind === 'consent' ? ['I accept', "I don't accept"] : ['Option 1', 'Option 2'])
          ).map((o) => (
            <label key={o} className="fb-opt" style={{ fontFamily: FORM_FONT }}>
              <input type="radio" name={field.uid} disabled={disabled} /> {o}
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (field.kind === 'checkbox') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-opts">
          {(field.options ?? ['Option A', 'Option B']).map((o) => (
            <label key={o} className="fb-opt" style={{ fontFamily: FORM_FONT }}>
              <input type="checkbox" disabled={disabled} /> {o}
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (field.kind === 'dropdown') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <select disabled={disabled} style={controlStyle} defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {(field.options ?? ['Option 1', 'Option 2']).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (field.kind === 'rating' || field.kind === 'emoji') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-rating">
          {field.kind === 'emoji'
            ? '😞 Unsatisfied · 😕 Bad · 😐 Neutral · 🙂 Good · 😄 Satisfied'
            : '★ ★ ★ ★ ★'}
        </div>
      </div>
    );
  }
  if (field.kind === 'table') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-table" style={controlStyle}>
          {(field.columns?.length ? field.columns : ['Column 1']).map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <p className="fb-preview-help">
          Rows: {field.minRows ?? 1}–{field.maxRows ?? 5}
        </p>
      </div>
    );
  }
  if (field.kind === 'signature') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-sign" style={controlStyle}>
          Sign using your finger, stylus, or mouse
        </div>
      </div>
    );
  }
  if (field.kind === 'upload' || field.kind === 'attachment') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <div className="fb-preview-upload" style={controlStyle}>
          {field.kind === 'upload'
            ? 'Upload Files (Respondents will be able to upload files)'
            : 'Upload Files'}
        </div>
      </div>
    );
  }
  if (field.kind === 'fee') {
    return (
      <div className="fb-preview-field">
        <label style={labelStyle}>{field.label}</label>
        <p className="fb-preview-help">
          Payment: {(field.paymentMode ?? 'offline').replace(/^\w/, (c) => c.toUpperCase())} ·{' '}
          {field.feeLabel ?? 'Add Registration Fee'}
        </p>
      </div>
    );
  }
  const inputType =
    field.kind === 'number'
      ? 'number'
      : field.kind === 'date'
        ? 'date'
        : field.kind === 'time'
          ? 'time'
          : field.kind === 'phone'
            ? 'tel'
            : 'text';
  const placeholder =
    field.kind === 'date' ? 'dd-mm-yyyy' : field.label;

  return (
    <div className="fb-preview-field">
      <label style={labelStyle}>{field.label}</label>
      <input
        type={inputType}
        placeholder={placeholder}
        disabled={disabled}
        style={controlStyle}
        aria-label={field.label}
      />
    </div>
  );
}

export function FormPreviewSheet({
  title,
  fields,
  styles,
  mode = 'fill',
  meta,
  onSaveDraft,
  onSubmit,
  sheetRef,
}: Props) {
  const interactive = mode === 'fill';
  const isBlank = mode === 'blank';
  const isPreview = mode === 'preview';

  return (
    <motion.div
      className="fps-page-sheet-wrap"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={sheetRef}
        className={`fb-preview-sheet fps-live-sheet fps-print-root${isBlank ? ' is-blank' : ''}`}
        style={{
          backgroundColor: styles.bgColor,
          fontFamily: FORM_FONT,
        }}
      >
        {isPreview ? (
          <div className="fb-preview-banner">
            This is just a preview of the actual form and therefore does not allow submission.
          </div>
        ) : null}
        {isBlank ? (
          <div className="fps-blank-ribbon" role="status">
            Blank form — download PDF for offline use
          </div>
        ) : null}

        <header className="fps-sheet-head">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
          >
            {title}
          </motion.h1>
          {meta ? <p className="fps-sheet-meta">{meta}</p> : null}
        </header>

        {styles.headerHtml ? (
          <div className="fb-preview-html" dangerouslySetInnerHTML={{ __html: styles.headerHtml }} />
        ) : null}

        <div className="fb-preview-brand">
          {styles.showSchoolLogo ? <SchoolLogo /> : null}
          {styles.showSchoolName ? <p>Panacea | Childcare</p> : null}
        </div>

        <div className="fb-preview-fields">
          {fields.length === 0 ? (
            <p className="fb-preview-empty-inline">No fields on this form yet.</p>
          ) : (
            fields.map((f, i) => (
              <motion.div
                key={f.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.32 }}
              >
                <PreviewControl field={f} styles={styles} interactive={interactive} />
              </motion.div>
            ))
          )}
        </div>

        {fields.length > 0 ? (
          <div className="fb-preview-actions fb-preview-actions-row">
            <button
              type="button"
              className="fb-preview-draft"
              disabled={!interactive}
              onClick={onSaveDraft}
              style={{
                borderColor: styles.buttonBg,
                color: styles.buttonBg,
                borderRadius: `${styles.buttonRadius}px`,
                fontSize: `${styles.buttonFontSize}px`,
                fontFamily: FORM_FONT,
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="fb-preview-submit"
              disabled={!interactive}
              onClick={onSubmit}
              style={{
                background: styles.buttonBg,
                color: styles.buttonColor,
                borderRadius: `${styles.buttonRadius}px`,
                fontSize: `${styles.buttonFontSize}px`,
                fontFamily: FORM_FONT,
              }}
            >
              Submit
            </button>
          </div>
        ) : null}

        {styles.footerHtml ? (
          <div className="fb-preview-html" dangerouslySetInnerHTML={{ __html: styles.footerHtml }} />
        ) : null}
      </div>
    </motion.div>
  );
}
