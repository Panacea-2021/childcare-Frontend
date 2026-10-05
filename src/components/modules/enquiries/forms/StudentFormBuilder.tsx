'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignLeft,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Columns2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Globe,
  GripVertical,
  Hash,
  Heading,
  Image as ImageIcon,
  Layers,
  List,
  Loader2,
  Lock,
  Mail,
  Map,
  MapPin,
  Minus,
  Monitor,
  MoveVertical,
  PenTool,
  Phone,
  AlignJustify,
  Printer,
  Redo2,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Star,
  Tablet,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { createField, FIELD_PALETTE, type PaletteItem } from './fieldCatalog';
import { FormPreviewModal } from './FormPreviewModal';
import {
  createBlankForm,
  getStudentForm,
  saveTemplateFromForm,
  upsertStudentForm,
} from './formsStore';
import { OfficialFieldRow, OfficialFormDocument } from './OfficialFormDocument';
import { printOfficialForm } from './printOfficialForm';
import type { BuilderView, FormField, StudentForm } from './types';
import './student-forms.css';

type Props = {
  formId?: string;
  initialTitle?: string;
  initialFields?: FormField[];
  source?: StudentForm['source'];
  description?: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  type: <Type size={14} />,
  'align-left': <AlignLeft size={14} />,
  hash: <Hash size={14} />,
  mail: <Mail size={14} />,
  phone: <Phone size={14} />,
  lock: <Lock size={14} />,
  calendar: <Calendar size={14} />,
  clock: <Clock size={14} />,
  list: <List size={14} />,
  'circle-dot': <CircleDot size={14} />,
  'check-square': <CheckSquare size={14} />,
  'toggle-left': <SlidersHorizontal size={14} />,
  star: <Star size={14} />,
  sliders: <SlidersHorizontal size={14} />,
  upload: <Upload size={14} />,
  image: <ImageIcon size={14} />,
  'pen-tool': <PenTool size={14} />,
  'map-pin': <MapPin size={14} />,
  globe: <Globe size={14} />,
  map: <Map size={14} />,
  building: <Building2 size={14} />,
  minus: <Minus size={14} />,
  heading: <Heading size={14} />,
  pilcrow: <AlignJustify size={14} />,
  'move-vertical': <MoveVertical size={14} />,
  columns: <Columns2 size={14} />,
  layers: <Layers size={14} />,
  loader: <Loader2 size={14} />,
  'shield-check': <ShieldCheck size={14} />,
  'eye-off': <EyeOff size={14} />,
};

function SortableField({
  field,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sfb-field ofd-builder-field ${selected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="sfb-field-actions">
        <button type="button" className="sf-icon-btn" aria-label="Drag" {...attributes} {...listeners}>
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          className="sf-icon-btn"
          aria-label="Duplicate field"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          className="sf-icon-btn"
          aria-label="Delete field"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <OfficialFieldRow field={field} />
    </div>
  );
}

export function StudentFormBuilder({
  formId,
  initialTitle,
  initialFields,
  source = 'scratch',
  description,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<StudentForm>(() => {
    if (formId) {
      const existing = getStudentForm(formId);
      if (existing) return existing;
    }
    return createBlankForm({
      id: formId,
      title: initialTitle || 'New Student Form',
      fields: initialFields ?? [],
      source,
      description: description || 'Official form for parents / guardians to complete and return.',
    });
  });
  const [selectedId, setSelectedId] = useState<string | null>(form.fields[0]?.id ?? null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ basic: true, layout: true });
  const [history, setHistory] = useState<FormField[][]>([form.fields]);
  const [histIdx, setHistIdx] = useState(0);
  const [view, setView] = useState<BuilderView>('desktop');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState('Draft saved');
  const [toast, setToast] = useState<string | null>(null);

  // Reload if storage updated after mount (e.g. race with navigation)
  useEffect(() => {
    if (!formId) return;
    const existing = getStudentForm(formId);
    if (existing) {
      setForm(existing);
      setSelectedId(existing.fields[0]?.id ?? null);
      setHistory([existing.fields]);
      setHistIdx(0);
    }
  }, [formId]);

  const selected = form.fields.find((f) => f.id === selectedId) ?? null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const pushHistory = useCallback(
    (fields: FormField[]) => {
      setHistory((h) => {
        const trimmed = h.slice(0, histIdx + 1);
        return [...trimmed, fields].slice(-40);
      });
      setHistIdx((i) => Math.min(i + 1, 39));
    },
    [histIdx],
  );

  const applyFields = useCallback(
    (fields: FormField[], record = true) => {
      setForm((prev) => ({ ...prev, fields, updatedAt: new Date().toISOString() }));
      if (record) pushHistory(fields);
    },
    [pushHistory],
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      upsertStudentForm(form);
      setSavedFlash('Draft saved');
    }, 700);
    return () => window.clearTimeout(t);
  }, [form]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const addField = (item: PaletteItem) => {
    const nextField = createField(item.type);
    const fields = [...form.fields, nextField];
    applyFields(fields);
    setSelectedId(nextField.id);
  };

  const updateSelected = (patch: Partial<FormField>) => {
    if (!selected) return;
    const fields = form.fields.map((f) => (f.id === selected.id ? { ...f, ...patch } : f));
    applyFields(fields);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = form.fields.findIndex((f) => f.id === active.id);
    const newIndex = form.fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    applyFields(arrayMove(form.fields, oldIndex, newIndex));
  };

  const undo = () => {
    if (histIdx <= 0) return;
    const next = histIdx - 1;
    setHistIdx(next);
    setForm((prev) => ({ ...prev, fields: history[next], updatedAt: new Date().toISOString() }));
  };

  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const next = histIdx + 1;
    setHistIdx(next);
    setForm((prev) => ({ ...prev, fields: history[next], updatedAt: new Date().toISOString() }));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '-').toLowerCase() || 'form'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Form downloaded');
  };

  const exportPdf = () => {
    printOfficialForm({
      title: form.title,
      description: form.description,
      fields: form.fields,
    });
    flash('Opening official PDF — use Save as PDF in the print dialog');
  };

  const printForm = () => {
    printOfficialForm({
      title: form.title,
      description: form.description,
      fields: form.fields,
    });
  };

  const publish = () => {
    const next = { ...form, status: 'published' as const, updatedAt: new Date().toISOString() };
    setForm(next);
    upsertStudentForm(next);
    flash('Form published');
  };

  const saveAsTemplate = () => {
    saveTemplateFromForm(form);
    flash('Saved to My Templates');
  };

  const duplicateForm = () => {
    const clone = {
      ...form,
      id: `sf-${Date.now()}`,
      title: `${form.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertStudentForm(clone);
    flash('Form duplicated');
    router.push(`/enquiries/forms/builder?id=${clone.id}`);
  };

  const optionsText = useMemo(() => (selected?.options ?? []).join('\n'), [selected]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.add('sfb-open');
    return () => document.body.classList.remove('sfb-open');
  }, [mounted]);

  const ui = (
    <div className="sfb-root" role="application" aria-label="Student form builder">
      <header className="sfb-toolbar">
        <div className="sfb-toolbar-left">
          <button type="button" className="sf-icon-btn" aria-label="Close builder" onClick={() => router.push('/enquiries/forms')}>
            <X size={16} />
          </button>
          <input
            className="sfb-title-input"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            aria-label="Form title"
          />
        </div>
        <div className="sfb-toolbar-center">
          <button type="button" className="sf-icon-btn" aria-label="Undo" onClick={undo} disabled={histIdx <= 0}>
            <Undo2 size={16} />
          </button>
          <button type="button" className="sf-icon-btn" aria-label="Redo" onClick={redo} disabled={histIdx >= history.length - 1}>
            <Redo2 size={16} />
          </button>
          <div className="sfp-modes">
            {(
              [
                ['desktop', Monitor],
                ['tablet', Tablet],
                ['mobile', Smartphone],
              ] as const
            ).map(([id, Icon]) => (
              <button
                key={id}
                type="button"
                className={`sfp-mode ${view === id ? 'is-active' : ''}`}
                onClick={() => setView(id)}
                aria-label={id}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
        <div className="sfb-toolbar-right">
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPreviewOpen(true)}>
            <Eye size={15} /> Preview
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={saveAsTemplate}>
            <Save size={15} /> Save Template
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={exportPdf}>
            <FileDown size={15} /> Download PDF
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={downloadJson}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={printForm}>
            <Printer size={15} /> Print
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={duplicateForm}>
            <Copy size={15} /> Duplicate
          </button>
          <button type="button" className="sf-icon-btn" aria-label="Settings" onClick={() => setSettingsOpen((v) => !v)}>
            <Settings size={16} />
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={publish}>
            Publish
          </button>
        </div>
      </header>

      <div className="sfb-body">
        <aside className="sfb-panel">
          <div className="sfb-panel-head">Component Library</div>
          {FIELD_PALETTE.map((section) => {
            const open = openSections[section.id] ?? false;
            return (
              <div key={section.id} className="sfb-acc">
                <button
                  type="button"
                  className="sfb-acc-btn"
                  onClick={() => setOpenSections((s) => ({ ...s, [section.id]: !open }))}
                >
                  {section.title}
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="sfb-acc-body"
                    >
                      <div className="sfb-palette-grid">
                        {section.items.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            className="sfb-palette-item"
                            onClick={() => addField(item)}
                          >
                            {ICON_MAP[item.icon] ?? <Type size={14} />}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </aside>

        <main className="sfb-canvas-wrap">
          <div className={`sfb-canvas ofd-canvas is-${view}`}>
            {form.fields.length === 0 ? (
              <>
                <OfficialFormDocument
                  title={form.title || 'New Student Form'}
                  description={form.description || 'Official form for parents / guardians.'}
                  fields={[]}
                />
                <div className="sfb-canvas-empty">
                  <p>
                    <strong>Create from scratch</strong>
                  </p>
                  <p className="sfb-help">
                    Click any field in the Component Library on the left to add it to this official PDF form.
                    Drag to reorder. Select a field to edit its properties on the right.
                  </p>
                </div>
              </>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={form.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <OfficialFormDocument
                    title={form.title}
                    description={form.description}
                    fields={form.fields}
                    renderField={(field) => (
                      <SortableField
                        field={field}
                        selected={selectedId === field.id}
                        onSelect={() => setSelectedId(field.id)}
                        onDelete={() => {
                          const fields = form.fields.filter((f) => f.id !== field.id);
                          applyFields(fields);
                          if (selectedId === field.id) setSelectedId(fields[0]?.id ?? null);
                        }}
                        onDuplicate={() => {
                          const clone = {
                            ...field,
                            id: `fld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          };
                          const idx = form.fields.findIndex((f) => f.id === field.id);
                          const fields = [...form.fields];
                          fields.splice(idx + 1, 0, clone);
                          applyFields(fields);
                          setSelectedId(clone.id);
                        }}
                      />
                    )}
                  />
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>

        <aside className="sfb-panel">
          <div className="sfb-panel-head">Properties</div>
          {!selected ? (
            <div className="sfb-props">
              <p className="sfb-help">Select a field to edit its properties.</p>
              {settingsOpen ? (
                <div className="ui-field">
                  <label className="ui-label">Form description</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="sfb-props">
              <div className="ui-field">
                <label className="ui-label">Label</label>
                <input className="ui-input" value={selected.label} onChange={(e) => updateSelected({ label: e.target.value })} />
              </div>
              <div className="ui-field">
                <label className="ui-label">Placeholder</label>
                <input
                  className="ui-input"
                  value={selected.placeholder ?? ''}
                  onChange={(e) => updateSelected({ placeholder: e.target.value })}
                />
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={Boolean(selected.required)}
                  onChange={(e) => updateSelected({ required: e.target.checked })}
                />
                Required
              </label>
              <div className="ui-field">
                <label className="ui-label">Validation</label>
                <input
                  className="ui-input"
                  value={selected.validation ?? ''}
                  placeholder="e.g. min:2, max:100, email"
                  onChange={(e) => updateSelected({ validation: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Width</label>
                <select
                  className="ui-select"
                  value={selected.width ?? 'full'}
                  onChange={(e) => updateSelected({ width: e.target.value as FormField['width'] })}
                >
                  <option value="full">Full</option>
                  <option value="half">Half</option>
                  <option value="third">Third</option>
                </select>
              </div>
              <div className="ui-field">
                <label className="ui-label">Field Size</label>
                <select
                  className="ui-select"
                  value={selected.size ?? 'md'}
                  onChange={(e) => updateSelected({ size: e.target.value as FormField['size'] })}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              <div className="ui-field">
                <label className="ui-label">Help Text</label>
                <input
                  className="ui-input"
                  value={selected.helpText ?? ''}
                  onChange={(e) => updateSelected({ helpText: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Default Value</label>
                <input
                  className="ui-input"
                  value={selected.defaultValue ?? ''}
                  onChange={(e) => updateSelected({ defaultValue: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Visibility</label>
                <select
                  className="ui-select"
                  value={selected.visibility ?? 'visible'}
                  onChange={(e) => updateSelected({ visibility: e.target.value as FormField['visibility'] })}
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div className="ui-field">
                <label className="ui-label">Conditional Logic</label>
                <textarea
                  className="ui-textarea"
                  rows={2}
                  placeholder="Show if … (mock)"
                  value={selected.conditionalLogic ?? ''}
                  onChange={(e) => updateSelected({ conditionalLogic: e.target.value })}
                />
              </div>
              {selected.options ? (
                <div className="ui-field">
                  <label className="ui-label">Options (one per line)</label>
                  <textarea
                    className="ui-textarea"
                    rows={4}
                    value={optionsText}
                    onChange={(e) =>
                      updateSelected({
                        options: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>

      <footer className="sfb-footer">
        <span className="sfb-autosave">
          <CheckSquare size={14} /> {savedFlash}
        </span>
        <span>
          {form.fields.length} fields · {form.status}
        </span>
      </footer>

      <FormPreviewModal
        open={previewOpen}
        title={form.title}
        description={form.description}
        fields={form.fields}
        onClose={() => setPreviewOpen(false)}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div className="sf-toast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (!mounted) {
    return <div className="shell-loading">Opening form builder…</div>;
  }

  return createPortal(ui, document.body);
}
