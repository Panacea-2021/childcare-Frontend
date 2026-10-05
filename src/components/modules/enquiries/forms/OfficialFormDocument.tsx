'use client';

import { DEFAULT_SCHOOL_BRANDING, type SchoolBranding } from './branding';
import type { FormField } from './types';

type Values = Record<string, string | boolean | number | string[]>;

type Props = {
  title: string;
  description?: string;
  fields: FormField[];
  branding?: SchoolBranding;
  /** Builder: wrap each field for selection / drag chrome */
  renderField?: (field: FormField, index: number) => React.ReactNode;
  interactive?: boolean;
  values?: Values;
  errors?: Record<string, string>;
  onChange?: (id: string, value: string | string[] | boolean | number) => void;
  formNumber?: string;
  className?: string;
};

function OfficialLogo() {
  return (
    <div className="ofd-logo" aria-hidden>
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle cx="32" cy="32" r="30" fill="#5D5FEF" />
        <circle cx="32" cy="32" r="24" fill="none" stroke="#fff" strokeWidth="2" opacity="0.85" />
        <path
          d="M18 38c4-12 10-18 14-20 4 2 10 8 14 20"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="32" cy="26" r="5" fill="#FDE68A" />
        <text x="32" y="48" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Poppins, sans-serif">
          P
        </text>
      </svg>
    </div>
  );
}

function FillLine({
  field,
  interactive,
  value,
  onChange,
}: {
  field: FormField;
  interactive?: boolean;
  value?: string | boolean | number | string[];
  onChange?: (v: string | string[] | boolean | number) => void;
}) {
  const str = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  if (field.type === 'textarea' || field.type === 'address') {
    return (
      <div className="ofd-lines">
        {interactive ? (
          <textarea
            className="ofd-textarea"
            rows={3}
            value={str}
            placeholder=" "
            onChange={(e) => onChange?.(e.target.value)}
          />
        ) : (
          <>
            <span className="ofd-line" />
            <span className="ofd-line" />
            <span className="ofd-line short" />
          </>
        )}
      </div>
    );
  }

  if (field.type === 'radio' || field.type === 'checkbox') {
    const opts = field.options ?? ['Option 1', 'Option 2'];
    return (
      <div className="ofd-checks">
        {opts.map((o) => (
          <label key={o} className="ofd-check">
            <input
              type={field.type === 'radio' ? 'radio' : 'checkbox'}
              name={field.id}
              disabled={!interactive}
              checked={interactive && field.type === 'radio' ? str === o : undefined}
              onChange={
                interactive
                  ? () => {
                      if (field.type === 'radio') onChange?.(o);
                    }
                  : undefined
              }
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === 'terms') {
    return (
      <label className="ofd-check ofd-terms">
        <input
          type="checkbox"
          disabled={!interactive}
          checked={interactive ? Boolean(value) : undefined}
          onChange={interactive ? (e) => onChange?.(e.target.checked) : undefined}
        />
        <span>
          {field.label}
          {field.required ? ' *' : ''}
        </span>
      </label>
    );
  }

  if (field.type === 'signature') {
    return <div className="ofd-sign">{interactive ? 'Sign here' : ''}</div>;
  }

  if (field.type === 'upload' || field.type === 'image-upload') {
    return <div className="ofd-upload">[ Attach / paste documents here ]</div>;
  }

  if (field.type === 'rating') {
    return <div className="ofd-rating">★ ★ ★ ★ ★ &nbsp; (circle one)</div>;
  }

  if (field.type === 'dropdown' || field.type === 'country' || field.type === 'state' || field.type === 'city') {
    if (interactive) {
      return (
        <select className="ofd-input" value={str} onChange={(e) => onChange?.(e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? ['Option 1', 'Option 2']).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    return (
      <span className="ofd-dropdown-line">
        {(field.options ?? []).slice(0, 4).join(' / ') || '________________'}
      </span>
    );
  }

  if (interactive) {
    return (
      <input
        className="ofd-input"
        type={
          field.type === 'email'
            ? 'email'
            : field.type === 'number'
              ? 'number'
              : field.type === 'date'
                ? 'date'
                : field.type === 'time'
                  ? 'time'
                  : field.type === 'phone'
                    ? 'tel'
                    : 'text'
        }
        value={str}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  }

  return <span className="ofd-line" />;
}

function DefaultFieldRow({
  field,
  interactive,
  value,
  error,
  onChange,
}: {
  field: FormField;
  interactive?: boolean;
  value?: string | boolean | number | string[];
  error?: string;
  onChange?: (v: string | string[] | boolean | number) => void;
}) {
  if (field.type === 'hidden' || field.type === 'spacer' || field.type === 'progress' || field.type === 'multi-step' || field.type === 'columns') {
    return null;
  }
  if (field.type === 'heading') {
    return <h3 className="ofd-section-title">{field.label}</h3>;
  }
  if (field.type === 'paragraph') {
    return <p className="ofd-paragraph">{field.label}</p>;
  }
  if (field.type === 'divider') {
    return <hr className="ofd-divider" />;
  }
  if (field.type === 'terms') {
    return (
      <div className={`ofd-field ofd-w-full`}>
        <FillLine field={field} interactive={interactive} value={value} onChange={onChange} />
        {error ? <p className="ofd-error">{error}</p> : null}
      </div>
    );
  }

  const w = field.width === 'half' ? 'half' : field.width === 'third' ? 'third' : 'full';
  return (
    <div className={`ofd-field ofd-w-${w}`}>
      <div className="ofd-label-row">
        <span className="ofd-label">
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        <div className="ofd-fill">
          <FillLine field={field} interactive={interactive} value={value} onChange={onChange} />
        </div>
      </div>
      {field.helpText ? <p className="ofd-help">{field.helpText}</p> : null}
      {error ? <p className="ofd-error">{error}</p> : null}
    </div>
  );
}

export function OfficialFormDocument({
  title,
  description,
  fields,
  branding = DEFAULT_SCHOOL_BRANDING,
  renderField,
  interactive,
  values,
  errors,
  onChange,
  formNumber,
  className,
}: Props) {
  return (
    <article className={`ofd-sheet ${className ?? ''}`}>
      <header className="ofd-header">
        <OfficialLogo />
        <div className="ofd-school">
          <p className="ofd-affiliation">{branding.affiliation}</p>
          <h1 className="ofd-school-name">{branding.schoolName}</h1>
          <p className="ofd-tagline">{branding.tagline}</p>
          <p className="ofd-contact">
            {branding.address}
            <br />
            Tel: {branding.phone} · {branding.email} · {branding.website}
          </p>
        </div>
      </header>

      <div className="ofd-double-rule" aria-hidden />

      <div className="ofd-title-block">
        <h2 className="ofd-form-title">{title}</h2>
        {description ? <p className="ofd-form-desc">{description}</p> : null}
        <div className="ofd-meta-row">
          <span>
            Academic Year: <strong>{branding.academicYear}</strong>
          </span>
          <span>
            Form No.: <strong>{formNumber ?? 'PEL/STU/______'}</strong>
          </span>
          <span>
            Date: <strong>____________</strong>
          </span>
        </div>
      </div>

      <div className="ofd-body">
        {fields.map((field, index) => {
          const slotW =
            field.type === 'heading' ||
            field.type === 'paragraph' ||
            field.type === 'divider' ||
            field.type === 'terms' ||
            field.type === 'textarea' ||
            field.type === 'address'
              ? 'full'
              : field.width === 'half'
                ? 'half'
                : field.width === 'third'
                  ? 'third'
                  : 'full';

          return renderField ? (
            <div key={field.id} className={`ofd-render-slot ofd-w-${slotW}`}>
              {renderField(field, index)}
            </div>
          ) : (
            <DefaultFieldRow
              key={field.id}
              field={field}
              interactive={interactive}
              value={values?.[field.id]}
              error={errors?.[field.id]}
              onChange={onChange ? (v) => onChange(field.id, v) : undefined}
            />
          );
        })}
      </div>

      <footer className="ofd-footer">
        <div className="ofd-footer-grid">
          <div>
            <p className="ofd-footer-label">For Office Use Only</p>
            <p className="ofd-office-line">Application received on: _______________</p>
            <p className="ofd-office-line">Admission status: ☐ Accepted &nbsp; ☐ Waitlist &nbsp; ☐ Denied</p>
            <p className="ofd-office-line">Verified by: _______________ &nbsp; Sign: ________</p>
          </div>
          <div className="ofd-stamp">School Seal</div>
        </div>
        <p className="ofd-footnote">
          This is an official document of {branding.schoolName}. Please fill in BLOCK letters where applicable. Fields marked *
          are mandatory.
        </p>
      </footer>
    </article>
  );
}

export { DefaultFieldRow as OfficialFieldRow };
