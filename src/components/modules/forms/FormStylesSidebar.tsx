'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export type FormStyleSettings = {
  showSchoolName: boolean;
  showSchoolLogo: boolean;
  fontFamily: string;
  sectionColor: string;
  sectionFontSize: number;
  labelColor: string;
  labelFontSize: number;
  fieldBorderColor: string;
  fieldBorderRadius: number;
  buttonBg: string;
  buttonColor: string;
  buttonRadius: number;
  buttonFontSize: number;
  bgColor: string;
  bgTemplate: number;
  headerHtml: string;
  footerHtml: string;
};

export const DEFAULT_FORM_STYLES: FormStyleSettings = {
  showSchoolName: true,
  showSchoolLogo: true,
  fontFamily: 'Poppins',
  sectionColor: '#5d5fef',
  sectionFontSize: 18,
  labelColor: '#333333',
  labelFontSize: 16,
  fieldBorderColor: '#D9D9D9',
  fieldBorderRadius: 4,
  buttonBg: '#5d5fef',
  buttonColor: '#FFFFFF',
  buttonRadius: 4,
  buttonFontSize: 16,
  bgColor: '#FFFFFF',
  bgTemplate: 0,
  headerHtml: '',
  footerHtml: '',
};

const FONTS = ['Poppins'];

const BG_TEMPLATES = [
  { id: 0, bg: '#ffffff', accent: '#e8f2ff' },
  { id: 1, bg: '#fffaf5', accent: '#ffe8d6' },
  { id: 2, bg: '#f7fbff', accent: '#d6e8ff' },
  { id: 3, bg: '#faf7ff', accent: '#e8d6ff' },
  { id: 4, bg: '#f5fff9', accent: '#d0edda' },
  { id: 5, bg: '#fff7f9', accent: '#edd0e4' },
  { id: 6, bg: '#f8fafc', accent: '#e2e8f0' },
  { id: 7, bg: '#fffef5', accent: '#ede8d0' },
];

type Props = {
  styles: FormStyleSettings;
  onChange: (next: FormStyleSettings) => void;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="fps-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`fps-switch ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <i />
      </button>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="fps-row fps-color-row">
      <span>{label}</span>
      <span className="fps-color">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </span>
    </label>
  );
}

function SizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="fps-row">
      <span>{label}</span>
      <span className="fps-size">
        <input
          type="number"
          min={10}
          max={48}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 12)}
        />
        <em>px</em>
      </span>
    </label>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fps-acc">
      <button type="button" className="fps-acc-head" onClick={onToggle}>
        <span>{title}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open ? <div className="fps-acc-body">{children}</div> : null}
    </div>
  );
}

export function FormStylesSidebar({ styles, onChange }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    page: true,
    section: true,
    labels: true,
    fields: true,
    buttons: true,
    background: true,
    html: false,
  });

  const set = <K extends keyof FormStyleSettings>(key: K, value: FormStyleSettings[K]) => {
    onChange({ ...styles, [key]: value });
  };

  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  return (
    <aside className="fb-sidebar fps-sidebar">
      <div className="fps-title">Customise Form Styles</div>
      <div className="fb-side-scroll">
        <Accordion title="Page Styling" open={open.page} onToggle={() => toggle('page')}>
          <Toggle
            label="Show School Name"
            checked={styles.showSchoolName}
            onChange={(v) => set('showSchoolName', v)}
          />
          <Toggle
            label="Show School Logo"
            checked={styles.showSchoolLogo}
            onChange={(v) => set('showSchoolLogo', v)}
          />
          <label className="fps-row fps-stack">
            <span>Font Family</span>
            <select value={styles.fontFamily} onChange={(e) => set('fontFamily', e.target.value)}>
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </Accordion>

        <Accordion title="Section Heading" open={open.section} onToggle={() => toggle('section')}>
          <ColorField label="Text Color" value={styles.sectionColor} onChange={(v) => set('sectionColor', v)} />
          <SizeField
            label="Font Size"
            value={styles.sectionFontSize}
            onChange={(v) => set('sectionFontSize', v)}
          />
        </Accordion>

        <Accordion title="Field Labels" open={open.labels} onToggle={() => toggle('labels')}>
          <ColorField label="Text Color" value={styles.labelColor} onChange={(v) => set('labelColor', v)} />
          <SizeField label="Font Size" value={styles.labelFontSize} onChange={(v) => set('labelFontSize', v)} />
        </Accordion>

        <Accordion title="Field Styles" open={open.fields} onToggle={() => toggle('fields')}>
          <ColorField
            label="Border Color"
            value={styles.fieldBorderColor}
            onChange={(v) => set('fieldBorderColor', v)}
          />
          <SizeField
            label="Border Radius"
            value={styles.fieldBorderRadius}
            onChange={(v) => set('fieldBorderRadius', v)}
          />
        </Accordion>

        <Accordion title="Buttons" open={open.buttons} onToggle={() => toggle('buttons')}>
          <ColorField label="Background Color" value={styles.buttonBg} onChange={(v) => set('buttonBg', v)} />
          <ColorField label="Font Color" value={styles.buttonColor} onChange={(v) => set('buttonColor', v)} />
          <SizeField
            label="Border Radius"
            value={styles.buttonRadius}
            onChange={(v) => set('buttonRadius', v)}
          />
          <SizeField label="Font Size" value={styles.buttonFontSize} onChange={(v) => set('buttonFontSize', v)} />
        </Accordion>

        <Accordion title="Background" open={open.background} onToggle={() => toggle('background')}>
          <ColorField label="Background Color" value={styles.bgColor} onChange={(v) => set('bgColor', v)} />
          <div className="fps-stack">
            <span className="fps-sub">Select a template</span>
            <div className="fps-templates">
              {BG_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`fps-tpl ${styles.bgTemplate === t.id ? 'is-active' : ''}`}
                  style={{ background: `linear-gradient(145deg, ${t.bg}, ${t.accent})` }}
                  aria-label={`Background template ${t.id + 1}`}
                  onClick={() => {
                    onChange({ ...styles, bgTemplate: t.id, bgColor: t.bg });
                  }}
                />
              ))}
            </div>
          </div>
        </Accordion>

        <Accordion title="Add HTML Section" open={open.html} onToggle={() => toggle('html')}>
          <label className="fps-stack">
            <span>Enable HTML in the Header</span>
            <textarea
              rows={3}
              value={styles.headerHtml}
              onChange={(e) => set('headerHtml', e.target.value)}
              placeholder="<div>Header HTML…</div>"
            />
          </label>
          <label className="fps-stack">
            <span>Enable HTML in the Footer</span>
            <textarea
              rows={3}
              value={styles.footerHtml}
              onChange={(e) => set('footerHtml', e.target.value)}
              placeholder="<div>Footer HTML…</div>"
            />
          </label>
        </Accordion>
      </div>
    </aside>
  );
}

export { BG_TEMPLATES };
