'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  FileText,
  Info,
  Link2,
  List,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Signature,
  Smile,
  SquareSplitVertical,
  Star,
  Table2,
  Type,
  Upload,
  X,
  DollarSign,
} from 'lucide-react';
import {
  NEW_FIELD_GROUPS,
  SYSTEM_FIELD_GROUPS,
  estimateMinutes,
  type BuilderFieldKind,
  type CanvasField,
  type PaletteItem,
} from './builderFieldData';
import {
  DEFAULT_FORM_STYLES,
  FormStylesSidebar,
  type FormStyleSettings,
} from './FormStylesSidebar';
import { SavePublishModal, type SavePublishPayload } from './SavePublishModal';
import { PublishedSuccessModal } from './PublishedSuccessModal';
import { BuildFieldCard } from './BuildFieldCard';
import { createBlankAnalytics, getFormById, upsertForm } from './formsStore';
import { getFormBuilderSchema, saveFormBuilderSchema } from './formBuilderSchemaStore';
import type { FormCategory } from './types';
import './form-builder.css';

type Props = {
  initialTitle?: string;
  audience?: string;
  formId?: string;
  initialMode?: 'build' | 'preview';
};

function FieldIcon({ icon }: { icon: string }) {
  const p = { size: 16, strokeWidth: 1.75 } as const;
  switch (icon) {
    case 'text':
      return <Type {...p} />;
    case 'number':
      return <Calculator {...p} />;
    case 'date':
      return <Calendar {...p} />;
    case 'time':
      return <Clock {...p} />;
    case 'phone':
      return <Phone {...p} />;
    case 'radio':
      return <CircleDot {...p} />;
    case 'checkbox':
      return <CheckSquare {...p} />;
    case 'dropdown':
      return <List {...p} />;
    case 'table':
      return <Table2 {...p} />;
    case 'rating':
      return <Star {...p} />;
    case 'emoji':
      return <Smile {...p} />;
    case 'section':
      return <SquareSplitVertical {...p} />;
    case 'pagebreak':
      return <FileText {...p} />;
    case 'signature':
      return <Signature {...p} />;
    case 'upload':
      return <Upload {...p} />;
    case 'attachment':
      return <Paperclip {...p} />;
    case 'fee':
      return <DollarSign {...p} />;
    case 'consent':
      return <ShieldCheck {...p} />;
    case 'instruction':
      return <Info {...p} />;
    default:
      return <Type {...p} />;
  }
}

const FORM_FONT = 'var(--font-body), Poppins, sans-serif';

function PreviewControl({ field, styles }: { field: CanvasField; styles: FormStyleSettings }) {
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
              <input type="radio" name={field.uid} disabled /> {o}
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
              <input type="checkbox" disabled /> {o}
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
        <select disabled style={controlStyle}>
          <option>Select…</option>
          {(field.options ?? ['Option 1', 'Option 2']).map((o) => (
            <option key={o}>{o}</option>
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
          {field.kind === 'emoji' ? '😞 Unsatisfied · 😕 Bad · 😐 Neutral · 🙂 Good · 😄 Satisfied' : '★ ★ ★ ★ ★'}
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
  return (
    <div className="fb-preview-field">
      <label style={labelStyle}>{field.label}</label>
      <input type={inputType} placeholder={field.label} disabled style={controlStyle} />
    </div>
  );
}

function SchoolLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 40 40" aria-hidden>
      <path d="M20 4 L34 14 L28 32 L12 32 L6 14 Z" fill="none" stroke="#5d5fef" strokeWidth="2.2" />
      <path d="M20 10 L28 16 L20 28 L12 16 Z" fill="none" stroke="#4b51e0" strokeWidth="1.8" />
    </svg>
  );
}

export function FormBuilder({
  initialTitle = 'New Form',
  audience,
  formId: formIdProp,
  initialMode = 'build',
}: Props) {
  const router = useRouter();
  const [formId] = useState(() => formIdProp || `frm-${Date.now()}`);
  const [title, setTitle] = useState(initialTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tab, setTab] = useState<'new' | 'system'>('new');
  const [mode, setMode] = useState<'build' | 'preview'>(initialMode);
  const [fields, setFields] = useState<CanvasField[]>([]);
  const [insertMenuAt, setInsertMenuAt] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [styles, setStyles] = useState<FormStyleSettings>(DEFAULT_FORM_STYLES);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'save' | 'publish'>('publish');
  const [successOpen, setSuccessOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    input: true,
    choices: true,
    page: false,
    advanced: false,
    compliance: false,
    student: true,
    mother: false,
    father: false,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!formIdProp) return;
    const existing = getFormById(formIdProp);
    if (existing) {
      setTitle(existing.name);
      setIsLive(existing.status === 'Live');
    }
    const schema = getFormBuilderSchema(formIdProp);
    if (schema) {
      setFields(schema.fields);
      setStyles({ ...DEFAULT_FORM_STYLES, ...schema.styles });
    }
  }, [formIdProp]);

  const persistSchema = (nextFields = fields, nextStyles = styles) => {
    saveFormBuilderSchema(formId, nextFields, nextStyles);
  };

  const minutes = useMemo(() => (fields.length ? estimateMinutes(fields) : 0), [fields]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  };

  const addField = (
    label: string,
    kind: BuilderFieldKind,
    sourceId: string,
    system = false,
    atIndex?: number,
  ) => {
    const uid = `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: CanvasField = {
      uid,
      sourceId,
      label: kind === 'fee' ? 'Payments' : label,
      kind,
      system,
      required: false,
      disabled: false,
      options:
        kind === 'radio' || kind === 'checkbox' || kind === 'dropdown'
          ? ['Option 1', 'Option 2']
          : kind === 'consent'
            ? ['I accept', "I don't accept"]
            : undefined,
      minRows: kind === 'table' ? 1 : undefined,
      maxRows: kind === 'table' ? 5 : undefined,
      columns: kind === 'table' ? [] : undefined,
      paymentMode: kind === 'fee' ? 'offline' : undefined,
      feeLabel: kind === 'fee' ? 'Add Registration Fee' : undefined,
      bodyText: undefined,
    };
    setFields((prev) => {
      if (atIndex == null || atIndex < 0 || atIndex > prev.length) return [...prev, next];
      const copy = [...prev];
      copy.splice(atIndex, 0, next);
      return copy;
    });
    setSelectedId(uid);
    setInsertMenuAt(null);
    setMode('build');
    setDirty(true);
  };

  const addPaletteItem = (item: PaletteItem) => addField(item.label, item.kind, item.id, false);
  const addSystemField = (id: string, label: string) => addField(label, 'system', id, true);

  const removeField = (uid: string) => {
    setFields((prev) => prev.filter((f) => f.uid !== uid));
    if (selectedId === uid) setSelectedId(null);
    setDirty(true);
  };

  const onDragStartPalette = (e: React.DragEvent, payload: string) => {
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { type: string; id: string; label: string; kind?: BuilderFieldKind };
      if (data.type === 'palette' && data.kind) addField(data.label, data.kind, data.id, false);
      if (data.type === 'system') addField(data.label, 'system', data.id, true);
    } catch {
      /* ignore */
    }
  };

  const close = () => router.push(isLive ? `/forms/${formId}` : '/forms');
  const save = () => {
    setSaveMode('save');
    setSaveOpen(true);
  };
  const publish = () => {
    setSaveMode('publish');
    setSaveOpen(true);
  };

  const unpublish = () => {
    const item = getFormById(formId);
    if (item) {
      upsertForm({ ...item, status: 'Draft' });
      setIsLive(false);
      flash('Form unpublished');
    }
  };

  const onSavePublish = (payload: SavePublishPayload) => {
    const openUntil = payload.disableAfter
      ? payload.disableAfter.split('-').reverse().join('/')
      : undefined;
    upsertForm({
      id: formId,
      name: payload.name,
      status: 'Live',
      date: new Date().toLocaleDateString('en-GB'),
      durationMin: minutes || undefined,
      type: (audience as 'Student' | 'Staff' | 'Enquiry') || 'Student',
      category: (payload.categories[0] || 'Admissions') as FormCategory,
      analytics: createBlankAnalytics(),
      sharedWith: 0,
      openUntil,
    });
    persistSchema(fields, styles);
    setTitle(payload.name);
    setIsLive(true);
    setSaveOpen(false);
    setSuccessOpen(true);
    setDirty(false);
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/forms/fill/${formId}`
      : `/forms/fill/${formId}`;

  const modeToggle = (
    <div className="fb-mode">
      <button type="button" className={mode === 'build' ? 'is-active' : undefined} onClick={() => setMode('build')}>
        Build
      </button>
      <button
        type="button"
        className={mode === 'preview' ? 'is-active' : undefined}
        onClick={() => setMode('preview')}
      >
        Preview
      </button>
    </div>
  );

  return (
    <div className={`fb-root ${mode === 'preview' ? 'is-preview' : ''}`}>
      <header className="fb-header">
        <div className="fb-title-block">
          <div className="fb-title-row">
            {editingTitle ? (
              <input
                className="fb-title-input"
                value={title}
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                }}
              />
            ) : (
              <h1>{title || 'New Form'}</h1>
            )}
            <button
              type="button"
              className="fb-icon-btn"
              aria-label="Edit form title"
              onClick={() => setEditingTitle(true)}
            >
              <Pencil size={15} />
            </button>
          </div>
          <p className="fb-meta">
            Time to Complete: {minutes} minute(s)
            {audience ? ` · Audience: ${audience}` : null}
          </p>
        </div>
        <div className="fb-header-actions">
          {dirty ? <span className="fb-unsaved">Unsaved Changes</span> : null}
          {isLive ? (
            <button type="button" className="fb-btn fb-btn-outline" onClick={unpublish}>
              Unpublish
            </button>
          ) : (
            <button type="button" className="fb-btn fb-btn-outline" onClick={save}>
              Save
            </button>
          )}
          <button type="button" className="fb-btn fb-btn-primary" onClick={publish}>
            Publish
          </button>
          <button type="button" className="fb-btn fb-btn-icon" aria-label="Close" onClick={close}>
            <X size={16} />
          </button>
        </div>
      </header>

      {mode === 'build' ? (
        <div className="fb-body">
          <aside className="fb-sidebar">
            <div className="fb-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'new'}
                className={tab === 'new' ? 'is-active' : undefined}
                onClick={() => setTab('new')}
              >
                New Field
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'system'}
                className={tab === 'system' ? 'is-active' : undefined}
                onClick={() => setTab('system')}
              >
                System Field
              </button>
            </div>

            {tab === 'new' ? (
              <div className="fb-side-scroll">
                <p className="fb-side-hint">Select the fields that match your form.</p>
                {NEW_FIELD_GROUPS.map((group) => {
                  const open = openGroups[group.id] ?? false;
                  return (
                    <div key={group.id} className="fb-group">
                      <button type="button" className="fb-group-toggle" onClick={() => toggleGroup(group.id)}>
                        <span>{group.title}</span>
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {open ? (
                        <div className="fb-palette">
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="fb-palette-item"
                              draggable
                              onDragStart={(e) =>
                                onDragStartPalette(
                                  e,
                                  JSON.stringify({
                                    type: 'palette',
                                    id: item.id,
                                    label: item.label,
                                    kind: item.kind,
                                  }),
                                )
                              }
                              onDoubleClick={() => addPaletteItem(item)}
                              onClick={() => addPaletteItem(item)}
                              title="Click or drag to canvas"
                            >
                              <span className="fb-palette-icon">
                                <FieldIcon icon={item.icon} />
                              </span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="fb-side-scroll">
                <p className="fb-side-hint">
                  Select from the fields added to the system. Responses will be automatically synced to the profiles
                  upon form submission.
                </p>
                {SYSTEM_FIELD_GROUPS.map((group) => {
                  const open = openGroups[group.id] ?? false;
                  return (
                    <div key={group.id} className="fb-group">
                      <button type="button" className="fb-group-toggle" onClick={() => toggleGroup(group.id)}>
                        <span>{group.title}</span>
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {open ? (
                        <div className="fb-palette">
                          {group.fields.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              className="fb-palette-item fb-system-item"
                              draggable
                              onDragStart={(e) =>
                                onDragStartPalette(
                                  e,
                                  JSON.stringify({ type: 'system', id: f.id, label: f.label }),
                                )
                              }
                              onDoubleClick={() => addSystemField(f.id, f.label)}
                              onClick={() => addSystemField(f.id, f.label)}
                              title="Click or drag to canvas"
                            >
                              <span>{f.label}</span>
                              <Link2 size={14} className="fb-link-ico" aria-hidden />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="fb-canvas-col">
            {modeToggle}
            <div
              className={`fb-canvas ${dragOver ? 'is-drag' : ''} ${fields.length ? 'has-fields' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDropCanvas}
            >
              {!fields.length ? (
                <div className="fb-empty">
                  <div className="fb-empty-art" aria-hidden>
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                      <path
                        d="M28 18c8 0 14 6 14 14v4l10 8-4 6-10-6v10c0 6-5 10-12 10s-12-4-12-10V32c0-8 6-14 14-14Z"
                        fill="url(#fbCursor)"
                        opacity="0.95"
                      />
                      <path d="M42 14l3 8 8 2-7 5 2 8-6-5-7 4 2-8-6-5 8-1 3-8Z" fill="#c4b5fd" />
                      <defs>
                        <linearGradient id="fbCursor" x1="16" y1="16" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8b5cf6" />
                          <stop offset="1" stopColor="#5d5fef" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p>Double click form fields or Drag them from the left panel to create your form.</p>
                </div>
              ) : (
                <ul className="fb-field-list">
                  {fields.map((field, index) => (
                    <li key={field.uid} className="fb-field-slot">
                      <BuildFieldCard
                        field={field}
                        selected={selectedId === field.uid}
                        onSelect={() => {
                          setSelectedId(field.uid);
                          setInsertMenuAt(null);
                        }}
                        onChange={(next) => {
                          setFields((prev) => prev.map((f) => (f.uid === next.uid ? next : f)));
                          setDirty(true);
                        }}
                        onRemove={() => removeField(field.uid)}
                      />
                      <div className="fb-insert-gap">
                        <button
                          type="button"
                          className="fb-insert-btn"
                          aria-label="Insert field"
                          aria-expanded={insertMenuAt === index + 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInsertMenuAt((v) => (v === index + 1 ? null : index + 1));
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                        {insertMenuAt === index + 1 ? (
                          <div className="fb-insert-menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => addField('Section', 'section', 'section', false, index + 1)}
                            >
                              Add section
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => addField('Page Break', 'pagebreak', 'pagebreak', false, index + 1)}
                            >
                              Add page break
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                  <li className="fb-canvas-hint" aria-hidden>
                    Double click form fields or Drag them from the left panel to create your form.
                  </li>
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="fb-body fb-body-preview">
          <FormStylesSidebar styles={styles} onChange={setStyles} />

          <section className="fb-canvas-col fb-preview-col">
            {modeToggle}
            <div className="fb-preview-stage">
              <div
                className="fb-preview-sheet"
                style={{
                  backgroundColor: styles.bgColor,
                  fontFamily: FORM_FONT,
                }}
              >
                <div className="fb-preview-banner">
                  This is just a preview of the actual form and therefore does not allow submission.
                </div>

                {styles.headerHtml ? (
                  <div
                    className="fb-preview-html"
                    dangerouslySetInnerHTML={{ __html: styles.headerHtml }}
                  />
                ) : null}

                <div className="fb-preview-brand">
                  {styles.showSchoolLogo ? <SchoolLogo /> : null}
                  {styles.showSchoolName ? <p>Panacea | Childcare</p> : null}
                </div>

                <div className="fb-preview-fields">
                  {fields.length === 0 ? (
                    <p className="fb-preview-empty-inline">No fields yet — switch to Build to add fields.</p>
                  ) : (
                    fields.map((f) => <PreviewControl key={f.uid} field={f} styles={styles} />)
                  )}
                </div>

                {fields.length > 0 ? (
                  <div className="fb-preview-actions fb-preview-actions-row">
                    <button
                      type="button"
                      className="fb-preview-draft"
                      disabled
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
                      disabled
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
                  <div
                    className="fb-preview-html"
                    dangerouslySetInnerHTML={{ __html: styles.footerHtml }}
                  />
                ) : null}
              </div>

              <aside className="fb-sync">
                <h3>Sync Form Fields</h3>
                <p>Sync form fields with entity profiles, all responses will be auto-synced with entity profile fields.</p>
                <button type="button" className="fb-sync-btn" onClick={() => flash('Fields synced with profiles')}>
                  <RefreshCw size={14} />
                  Sync
                </button>
              </aside>
            </div>
          </section>
        </div>
      )}

      <SavePublishModal
        open={saveOpen}
        formName={title || 'New Form'}
        mode={saveMode}
        onClose={() => setSaveOpen(false)}
        onSave={onSavePublish}
      />
      <PublishedSuccessModal
        open={successOpen}
        shareUrl={shareUrl}
        onClose={() => setSuccessOpen(false)}
        onOk={() => {
          setSuccessOpen(false);
          router.push(`/forms/${formId}`);
        }}
        onCopy={() => {
          void navigator.clipboard?.writeText(shareUrl);
          flash('Share URL copied');
        }}
        onQr={() => flash('QR code download started')}
      />

      {toast ? (
        <div className="fb-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
