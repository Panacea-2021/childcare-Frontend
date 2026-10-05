'use client';

import { ChevronDown } from 'lucide-react';
import { CertificateSignaturePad } from './CertificateSignaturePad';
import {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  type CertificateStyleState,
  type SignatureType,
} from './certificateStyles';

export type SectionKey = keyof CertificateStyleState;

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'header', label: 'Header' },
  { key: 'subheader', label: 'Subheader' },
  { key: 'name', label: 'Name' },
  { key: 'body', label: 'Body Text' },
  { key: 'date', label: 'Add Date' },
  { key: 'signature', label: 'Add Signature (optional)' },
];

type Props = {
  styles: CertificateStyleState;
  openSection: SectionKey;
  onOpenSection: (key: SectionKey) => void;
  onChange: (next: CertificateStyleState) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveNew: () => void;
};

function StyleFields({
  idPrefix,
  color,
  fontSize,
  fontFamily,
  fontWeight,
  text,
  textLabel,
  textMultiline,
  enabled,
  showEnable,
  outlined,
  showOutlined,
  onPatch,
}: {
  idPrefix: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  text: string;
  textLabel: string;
  textMultiline?: boolean;
  enabled?: boolean;
  showEnable?: boolean;
  outlined?: boolean;
  showOutlined?: boolean;
  onPatch: (patch: Record<string, string | number | boolean>) => void;
}) {
  return (
    <div className="cert-style-fields">
      {showEnable ? (
        <label className="cert-style-check">
          <input
            type="checkbox"
            checked={Boolean(enabled)}
            onChange={(e) => onPatch({ enabled: e.target.checked })}
          />
          <span>Enable</span>
        </label>
      ) : null}

      <div className="ui-field">
        <label className="ui-label" htmlFor={`${idPrefix}-text`}>
          {textLabel}
        </label>
        {textMultiline ? (
          <textarea
            id={`${idPrefix}-text`}
            className="ui-textarea"
            rows={4}
            value={text}
            onChange={(e) => onPatch({ text: e.target.value })}
          />
        ) : (
          <input
            id={`${idPrefix}-text`}
            className="ui-input"
            value={text}
            onChange={(e) => onPatch({ text: e.target.value })}
          />
        )}
      </div>

      {showOutlined ? (
        <label className="cert-style-check">
          <input
            type="checkbox"
            checked={Boolean(outlined)}
            onChange={(e) => onPatch({ outlined: e.target.checked })}
          />
          <span>Outlined name</span>
        </label>
      ) : null}

      <div className="ui-field">
        <label className="ui-label" htmlFor={`${idPrefix}-color`}>
          Text Color
        </label>
        <div className="cert-color-row">
          <input
            type="color"
            className="cert-color-swatch"
            value={color}
            onChange={(e) => onPatch({ color: e.target.value })}
            aria-label="Pick color"
          />
          <input
            id={`${idPrefix}-color`}
            className="ui-input"
            value={color}
            onChange={(e) => onPatch({ color: e.target.value })}
          />
        </div>
      </div>

      <div className="ui-grid-2">
        <div className="ui-field">
          <label className="ui-label" htmlFor={`${idPrefix}-size`}>
            Font Size
          </label>
          <input
            id={`${idPrefix}-size`}
            className="ui-input"
            type="number"
            min={8}
            max={96}
            value={fontSize}
            onChange={(e) => onPatch({ fontSize: Number(e.target.value) || 12 })}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor={`${idPrefix}-weight`}>
            Font Weight
          </label>
          <select
            id={`${idPrefix}-weight`}
            className="ui-input ui-select"
            value={fontWeight}
            onChange={(e) => onPatch({ fontWeight: e.target.value })}
          >
            {FONT_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor={`${idPrefix}-family`}>
          Font Family
        </label>
        <select
          id={`${idPrefix}-family`}
          className="ui-input ui-select"
          value={fontFamily}
          onChange={(e) => onPatch({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CertificateStylePanel({
  styles,
  openSection,
  onOpenSection,
  onChange,
  onPrevious,
  onNext,
  onSaveNew,
}: Props) {
  const patchSection = (key: SectionKey, patch: Record<string, string | number | boolean | null>) => {
    if (key === 'date' || key === 'signature') {
      const mapped: Record<string, string | number | boolean | null> = { ...patch };
      if ('text' in mapped) {
        mapped.label = mapped.text as string;
        delete mapped.text;
      }
      onChange({ ...styles, [key]: { ...styles[key], ...mapped } });
      return;
    }
    onChange({ ...styles, [key]: { ...styles[key], ...patch } });
  };

  return (
    <aside className="cert-style-panel">
      <div className="cert-style-actions">
        <button type="button" className="ui-btn ui-btn-outline cert-nav-btn" onClick={onPrevious}>
          « Previous
        </button>
        <button type="button" className="ui-btn ui-btn-outline cert-nav-btn" onClick={onSaveNew}>
          Save as New
        </button>
        <button type="button" className="ui-btn ui-btn-outline cert-nav-btn" disabled>
          Save Existing
        </button>
        <button type="button" className="ui-btn ui-btn-primary cert-nav-btn" onClick={onNext}>
          Next »
        </button>
      </div>

      <div className="cert-style-card">
        <h2>Customize Style</h2>
        <div className="cert-accordion">
          {SECTIONS.map(({ key, label }) => {
            const open = openSection === key;
            const section = styles[key];
            const isFooter = key === 'date' || key === 'signature';
            const textValue = isFooter
              ? styles[key].label
              : 'text' in section
                ? section.text
                : '';

            return (
              <div key={key} className={`cert-acc-item ${open ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="cert-acc-trigger"
                  aria-expanded={open}
                  onClick={() => onOpenSection(key)}
                >
                  <span>{label}</span>
                  <ChevronDown size={16} />
                </button>
                {open ? (
                  <div className="cert-acc-body">
                    <StyleFields
                      idPrefix={`cert-${key}`}
                      color={section.color}
                      fontSize={section.fontSize}
                      fontFamily={section.fontFamily}
                      fontWeight={section.fontWeight}
                      text={textValue}
                      textLabel={isFooter ? 'Modify Text' : 'Text'}
                      textMultiline={key === 'body'}
                      showEnable={isFooter}
                      enabled={isFooter ? styles[key].enabled : undefined}
                      showOutlined={key === 'name'}
                      outlined={key === 'name' ? styles.name.outlined : undefined}
                      onPatch={(patch) => patchSection(key, patch)}
                    />
                    {key === 'signature' ? (
                      <CertificateSignaturePad
                        signatureType={styles.signature.signatureType}
                        imageDataUrl={styles.signature.imageDataUrl}
                        onTypeChange={(type: SignatureType) =>
                          patchSection('signature', { signatureType: type })
                        }
                        onImageChange={(dataUrl) =>
                          patchSection('signature', { imageDataUrl: dataUrl })
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
