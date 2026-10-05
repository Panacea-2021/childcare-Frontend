'use client';

import type { FormField } from './types';

type Props = {
  field: FormField;
  interactive?: boolean;
  value?: string | string[] | boolean | number;
  error?: string;
  onChange?: (value: string | string[] | boolean | number) => void;
};

export function FieldPreview({ field, interactive = false, value, error, onChange }: Props) {
  if (field.type === 'hidden') return null;

  if (field.type === 'heading') {
    return <h3 style={{ margin: '8px 0 4px', fontSize: '1.15rem', fontWeight: 700 }}>{field.label}</h3>;
  }
  if (field.type === 'paragraph') {
    return <p className="sfb-help" style={{ marginBottom: 8 }}>{field.label}</p>;
  }
  if (field.type === 'divider') {
    return <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '14px 0' }} />;
  }
  if (field.type === 'spacer') {
    return <div style={{ height: 20 }} aria-hidden />;
  }
  if (field.type === 'progress') {
    return (
      <div className="sf-progress-bar" style={{ margin: '10px 0' }}>
        <div className="sf-progress-fill" style={{ width: '45%' }} />
      </div>
    );
  }
  if (field.type === 'multi-step') {
    return (
      <div className="sf-meta" style={{ marginBottom: 10 }}>
        <span className="sf-badge sf-badge-published">Step 1</span>
        <span className="sf-badge sf-badge-draft">Step 2</span>
        <span className="sf-badge sf-badge-draft">Step 3</span>
      </div>
    );
  }
  if (field.type === 'columns') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '8px 0' }}>
        <div className="sfb-preview-control">Column A</div>
        <div className="sfb-preview-control">Column B</div>
      </div>
    );
  }

  const widthClass = field.width === 'half' ? 'half' : field.width === 'third' ? 'third' : 'full';
  const strVal = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div className={`ui-field sf-w-${widthClass}`}>
      {field.type !== 'terms' ? (
        <label className="sfb-field-label">
          {field.label}
          {field.required ? <span className="sfb-req">*</span> : null}
        </label>
      ) : null}

      {field.type === 'textarea' || field.type === 'address' ? (
        <textarea
          className="ui-textarea"
          rows={3}
          placeholder={field.placeholder}
          disabled={!interactive}
          value={interactive ? strVal : undefined}
          defaultValue={!interactive ? field.defaultValue : undefined}
          onChange={interactive ? (e) => onChange?.(e.target.value) : undefined}
        />
      ) : field.type === 'dropdown' || field.type === 'country' || field.type === 'state' || field.type === 'city' ? (
        <select
          className="ui-select"
          disabled={!interactive}
          value={interactive ? strVal : undefined}
          defaultValue={!interactive ? field.defaultValue || '' : undefined}
          onChange={interactive ? (e) => onChange?.(e.target.value) : undefined}
        >
          <option value="">{field.placeholder || 'Select…'}</option>
          {(field.options ?? ['Option 1', 'Option 2']).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(field.options ?? ['Option 1', 'Option 2']).map((o) => (
            <label key={o} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
              <input
                type="radio"
                name={field.id}
                disabled={!interactive}
                checked={interactive ? strVal === o : undefined}
                onChange={interactive ? () => onChange?.(o) : undefined}
              />
              {o}
            </label>
          ))}
        </div>
      ) : field.type === 'checkbox' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(field.options ?? ['Option A', 'Option B']).map((o) => (
            <label key={o} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
              <input type="checkbox" disabled={!interactive} />
              {o}
            </label>
          ))}
        </div>
      ) : field.type === 'switch' ? (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
          <input type="checkbox" disabled={!interactive} />
          Enabled
        </label>
      ) : field.type === 'terms' ? (
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            disabled={!interactive}
            checked={interactive ? Boolean(value) : undefined}
            onChange={interactive ? (e) => onChange?.(e.target.checked) : undefined}
          />
          <span>{field.label}{field.required ? <span className="sfb-req">*</span> : null}</span>
        </label>
      ) : field.type === 'rating' ? (
        <div style={{ color: '#eab308', letterSpacing: 4, fontSize: '1.2rem' }}>★★★★★</div>
      ) : field.type === 'slider' ? (
        <input type="range" className="ui-input" min={field.min ?? 0} max={field.max ?? 100} disabled={!interactive} defaultValue={field.defaultValue || '50'} />
      ) : field.type === 'signature' ? (
        <div className="sfb-sign-box">Sign using your finger, stylus, or mouse</div>
      ) : field.type === 'upload' || field.type === 'image-upload' ? (
        <div className="sfb-upload-box">
          {field.type === 'image-upload' ? 'Upload image (PNG/JPG)' : 'Upload files'}
        </div>
      ) : (
        <input
          className="ui-input"
          type={
            field.type === 'email'
              ? 'email'
              : field.type === 'number'
                ? 'number'
                : field.type === 'password'
                  ? 'password'
                  : field.type === 'date'
                    ? 'date'
                    : field.type === 'time'
                      ? 'time'
                      : field.type === 'phone'
                        ? 'tel'
                        : 'text'
          }
          placeholder={field.placeholder}
          disabled={!interactive}
          value={interactive ? strVal : undefined}
          defaultValue={!interactive ? field.defaultValue : undefined}
          onChange={interactive ? (e) => onChange?.(e.target.value) : undefined}
        />
      )}

      {field.helpText ? <p className="sfb-help">{field.helpText}</p> : null}
      {error ? <p className="sfb-help" style={{ color: 'var(--color-close)' }}>{error}</p> : null}
    </div>
  );
}
