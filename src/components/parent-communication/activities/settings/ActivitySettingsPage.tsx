'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Info,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ACTIVITY_ICON_MAP } from '@/components/parent-communication/activities/ActivitySelector';
import {
  createCustomActivity,
  deleteActivityDefinition,
  loadActivityDefinitions,
  loadActivityGeneralSettings,
  saveActivityDefinitions,
  saveActivityGeneralSettings,
} from '@/lib/parent-communication/activityDefinitionsStore';
import type {
  ActivityCustomField,
  ActivityDefinition,
  ActivityFieldType,
  ActivityGeneralSettings,
} from '@/types/activityDefinition';
import {
  ACTIVITY_COLOR_PRESETS,
  ACTIVITY_FIELD_TYPES,
  parseFieldValues,
} from '@/types/activityDefinition';
import './activity-settings.css';

const ease = [0.22, 1, 0.36, 1] as const;

type ActivityColorId = (typeof ACTIVITY_COLOR_PRESETS)[number]['id'];

type FieldDraft = {
  name: string;
  type: ActivityFieldType;
  mandatory: boolean;
  enableAi: boolean;
  valueList: string[];
  valueInput: string;
};

type ToastState = { message: string; type: 'ok' | 'err' } | null;

function snapshotKey(
  activities: ActivityDefinition[],
  general: ActivityGeneralSettings,
): string {
  return JSON.stringify({ activities, general });
}

function emptyFieldDraft(): FieldDraft {
  return {
    name: '',
    type: 'Text',
    mandatory: false,
    enableAi: false,
    valueList: [],
    valueInput: '',
  };
}

function fieldToDraft(field: ActivityCustomField): FieldDraft {
  return {
    name: field.name,
    type: field.type,
    mandatory: field.mandatory,
    enableAi: field.enableAi,
    valueList: parseFieldValues(field.values),
    valueInput: '',
  };
}

function draftNeedsValues(type: ActivityFieldType) {
  return type === 'Dropdown' || type === 'Multi Select';
}

function CircleCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="acs-check" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="acs-check-dot" aria-hidden>
        {checked ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span>{label}</span>
    </label>
  );
}

function FieldTypePicker({
  value,
  onChange,
  id,
}: {
  value: ActivityFieldType;
  onChange: (next: ActivityFieldType) => void;
  id: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [placeAbove, setPlaceAbove] = useState(false);

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuHeight = Math.min(ACTIVITY_FIELD_TYPES.length * 42 + 16, 280);
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const above = spaceBelow < menuHeight && rect.top > spaceBelow;
    setPlaceAbove(above);
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 180),
      zIndex: 1200,
      ...(above
        ? { bottom: window.innerHeight - rect.top + 6, top: 'auto' }
        : { top: rect.bottom + 6, bottom: 'auto' }),
    });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      const menu = document.getElementById(`${id}-menu`);
      if (menu?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, id]);

  return (
    <div className={`acs-type-picker${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="acs-type-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <ChevronDown size={16} className="acs-type-chevron" aria-hidden />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.ul
                  id={`${id}-menu`}
                  className={`acs-type-menu is-portal${placeAbove ? ' is-above' : ''}`}
                  role="listbox"
                  aria-labelledby={id}
                  style={menuStyle}
                  initial={{ opacity: 0, y: placeAbove ? 6 : -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: placeAbove ? 4 : -4, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  {ACTIVITY_FIELD_TYPES.map((t) => {
                    const selected = t === value;
                    return (
                      <li key={t} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          className={`acs-type-option${selected ? ' is-selected' : ''}`}
                          onClick={() => {
                            onChange(t);
                            setOpen(false);
                          }}
                        >
                          {t}
                          {selected ? <Check size={14} strokeWidth={2.5} aria-hidden /> : null}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

function Toggle({
  on,
  onChange,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      type="button"
      className={`acs-toggle ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      onClick={() => onChange(!on)}
    >
      <span className="acs-toggle-track" aria-hidden>
        <span className="acs-toggle-thumb" />
      </span>
      <span className="acs-toggle-text">{on ? onLabel : offLabel}</span>
    </button>
  );
}

function ActivityGlyph({
  activity,
  size = 18,
}: {
  activity: Pick<ActivityDefinition, 'icon' | 'color' | 'bgColor' | 'imageUrl'>;
  size?: number;
}) {
  if (activity.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activity.imageUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
      />
    );
  }
  const Icon = ACTIVITY_ICON_MAP[activity.icon] ?? Sparkles;
  return <Icon size={size} color={activity.color} strokeWidth={2} />;
}

export function ActivitySettingsPage() {
  const router = useRouter();

  const [activities, setActivities] = useState<ActivityDefinition[]>([]);
  const [general, setGeneral] = useState<ActivityGeneralSettings>({
    checkedInOnly: true,
    disablePhotoDownload: true,
    disableVideoDownload: false,
    allCheckedInIgnoreRoom: false,
    ccEmail: '',
  });
  const [baseline, setBaseline] = useState('');
  const [ready, setReady] = useState(false);

  const [generalOpen, setGeneralOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createColorId, setCreateColorId] = useState<ActivityColorId>(
    ACTIVITY_COLOR_PRESETS[0].id,
  );
  const [createColorFilter, setCreateColorFilter] = useState('');
  const [createImageUrl, setCreateImageUrl] = useState<string | undefined>();
  const [createError, setCreateError] = useState('');

  const [newField, setNewField] = useState<FieldDraft>(emptyFieldDraft());
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FieldDraft>(emptyFieldDraft());
  const [editOpen, setEditOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const [dragFieldId, setDragFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  useEffect(() => {
    const defs = loadActivityDefinitions();
    const gen = loadActivityGeneralSettings();
    setActivities(defs);
    setGeneral(gen);
    setBaseline(snapshotKey(defs, gen));
    setSelectedId(defs[0]?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const dirty = ready && snapshotKey(activities, general) !== baseline;

  const selected = useMemo(
    () => activities.find((a) => a.id === selectedId) ?? null,
    [activities, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => a.name.toLowerCase().includes(q));
  }, [activities, search]);

  const colorPresetsFiltered = useMemo(() => {
    const q = createColorFilter.trim().toLowerCase();
    if (!q) return [...ACTIVITY_COLOR_PRESETS];
    return ACTIVITY_COLOR_PRESETS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.includes(q),
    );
  }, [createColorFilter]);

  const showToast = (message: string, type: 'ok' | 'err' = 'ok') =>
    setToast({ message, type });

  const updateSelected = (patch: Partial<ActivityDefinition>) => {
    if (!selectedId) return;
    setActivities((list) =>
      list.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)),
    );
  };

  const updateEnable = (key: keyof ActivityDefinition['enable'], value: boolean) => {
    if (!selected) return;
    updateSelected({ enable: { ...selected.enable, [key]: value } });
  };

  const confirmLeave = () => {
    if (!dirty) return true;
    return window.confirm('You have unsaved changes. Discard them?');
  };

  const handleBack = () => {
    if (!confirmLeave()) return;
    router.push('/parent-communication/activities');
  };

  const handleCancel = () => {
    if (!dirty) {
      router.push('/parent-communication/activities');
      return;
    }
    if (!window.confirm('Discard unsaved changes?')) return;
    const defs = loadActivityDefinitions();
    const gen = loadActivityGeneralSettings();
    setActivities(defs);
    setGeneral(gen);
    setBaseline(snapshotKey(defs, gen));
    setSelectedId((id) => (defs.some((a) => a.id === id) ? id : defs[0]?.id ?? null));
    setNewField(emptyFieldDraft());
    setEditingFieldId(null);
    setEditOpen(false);
  };

  const handleSave = () => {
    saveActivityDefinitions(activities);
    saveActivityGeneralSettings(general);
    setBaseline(snapshotKey(activities, general));
    showToast('Activity settings saved');
  };

  const openCreate = () => {
    setCreateName('');
    setCreateColorId(ACTIVITY_COLOR_PRESETS[0].id);
    setCreateColorFilter('');
    setCreateImageUrl(undefined);
    setCreateError('');
    setCreateOpen(true);
  };

  const handleCreateActivity = () => {
    const name = createName.trim();
    if (!name) {
      setCreateError('Activity name is required');
      return;
    }
    const preset =
      ACTIVITY_COLOR_PRESETS.find((c) => c.id === createColorId) ?? ACTIVITY_COLOR_PRESETS[0];

    // Sync local edits first so createCustomActivity does not clobber dirty work.
    saveActivityDefinitions(activities);
    saveActivityGeneralSettings(general);

    const created = createCustomActivity({
      name,
      color: preset.hex,
      bgColor: preset.bg,
      imageUrl: createImageUrl,
    });

    const next = loadActivityDefinitions();
    const gen = loadActivityGeneralSettings();
    setActivities(next);
    setGeneral(gen);
    setBaseline(snapshotKey(next, gen));
    setSelectedId(created.id);
    setCreateOpen(false);
    showToast(`“${created.name}” created`);
  };

  const handleDeleteActivity = (id: string) => {
    const target = activities.find((a) => a.id === id);
    if (!target?.deletable) return;
    if (!window.confirm(`Delete “${target.name}”? This cannot be undone.`)) return;

    saveActivityDefinitions(activities);
    saveActivityGeneralSettings(general);
    const next = deleteActivityDefinition(id);
    const gen = loadActivityGeneralSettings();
    setActivities(next);
    setGeneral(gen);
    setBaseline(snapshotKey(next, gen));
    setSelectedId(next[0]?.id ?? null);
    showToast(`“${target.name}” deleted`);
  };

  const moveField = (fieldId: string, dir: -1 | 1) => {
    if (!selected) return;
    const fields = [...selected.fields];
    const idx = fields.findIndex((f) => f.id === fieldId);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= fields.length) return;
    const [item] = fields.splice(idx, 1);
    fields.splice(nextIdx, 0, item);
    updateSelected({ fields });
  };

  const reorderFields = (fromId: string, toId: string) => {
    if (!selected || fromId === toId) return;
    const fields = [...selected.fields];
    const from = fields.findIndex((f) => f.id === fromId);
    const to = fields.findIndex((f) => f.id === toId);
    if (from < 0 || to < 0) return;
    const [item] = fields.splice(from, 1);
    fields.splice(to, 0, item);
    updateSelected({ fields });
  };

  const onFieldDragStart = (e: DragEvent, fieldId: string) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button')) {
      e.preventDefault();
      return;
    }
    setDragFieldId(fieldId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', fieldId);
  };

  const onFieldDragEnd = () => {
    setDragFieldId(null);
    setDragOverFieldId(null);
  };

  const onFieldDragOver = (e: DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFieldId !== fieldId) setDragOverFieldId(fieldId);
  };

  const onFieldDrop = (e: DragEvent, fieldId: string) => {
    e.preventDefault();
    const fromId = dragFieldId || e.dataTransfer.getData('text/plain');
    if (fromId) reorderFields(fromId, fieldId);
    setDragFieldId(null);
    setDragOverFieldId(null);
  };

  const removeField = (fieldId: string) => {
    if (!selected) return;
    updateSelected({ fields: selected.fields.filter((f) => f.id !== fieldId) });
  };

  const addValueToDraft = (
    draft: FieldDraft,
    setDraft: Dispatch<SetStateAction<FieldDraft>>,
  ) => {
    const v = draft.valueInput.trim();
    if (!v) return;
    if (draft.valueList.includes(v)) {
      setDraft((d) => ({ ...d, valueInput: '' }));
      return;
    }
    setDraft((d) => ({
      ...d,
      valueList: [...d.valueList, v],
      valueInput: '',
    }));
  };

  const commitFieldFromDraft = (draft: FieldDraft, existingId?: string) => {
    if (!selected) return false;
    const name = draft.name.trim();
    if (!name) {
      showToast('Field name is required', 'err');
      return false;
    }
    if (draftNeedsValues(draft.type) && draft.valueList.length === 0) {
      showToast('Add at least one value', 'err');
      return false;
    }
    const payload: ActivityCustomField = {
      id: existingId ?? `field-${Date.now()}`,
      name,
      type: draft.type,
      mandatory: draft.mandatory,
      enableAi: draft.enableAi,
      values: draftNeedsValues(draft.type) ? draft.valueList.join(', ') : undefined,
    };
    if (existingId) {
      updateSelected({
        fields: selected.fields.map((f) => (f.id === existingId ? payload : f)),
      });
    } else {
      updateSelected({ fields: [...selected.fields, payload] });
    }
    return true;
  };

  const handleCreateField = () => {
    if (!commitFieldFromDraft(newField)) return;
    setNewField(emptyFieldDraft());
  };

  const openEditField = (field: ActivityCustomField) => {
    setEditingFieldId(field.id);
    setEditDraft(fieldToDraft(field));
    setEditOpen(true);
  };

  const handleSaveEditField = () => {
    if (!editingFieldId) return;
    if (!commitFieldFromDraft(editDraft, editingFieldId)) return;
    setEditOpen(false);
    setEditingFieldId(null);
  };

  const onImagePick = (file: File | null) => {
    if (!file) {
      setCreateImageUrl(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCreateImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderFieldForm = (
    draft: FieldDraft,
    setDraft: Dispatch<SetStateAction<FieldDraft>>,
    opts: { title: string; primaryLabel: string; onPrimary: () => void; onCancel: () => void },
  ) => (
    <motion.div
      className="acs-field-editor"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease }}
    >
      <div className="acs-field-editor-head">
        <span className="acs-field-editor-badge" aria-hidden>
          <Sparkles size={14} />
        </span>
        <div>
          <h3 className="acs-field-editor-title">{opts.title}</h3>
          <p className="acs-field-editor-hint">Build a custom field for this activity type</p>
        </div>
      </div>

      <div className="acs-field-editor-grid">
        <div className="ui-field acs-field-type">
          <label className="ui-label" htmlFor={`type-${opts.title}`}>
            Type
          </label>
          <FieldTypePicker
            id={`type-${opts.title}`}
            value={draft.type}
            onChange={(type) => setDraft((d) => ({ ...d, type }))}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor={`name-${opts.title}`}>
            Field Name
          </label>
          <input
            id={`name-${opts.title}`}
            className="ui-input acs-field-name-input"
            placeholder="Field Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {draftNeedsValues(draft.type) ? (
          <motion.div
            key="values"
            className="acs-values-block"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease }}
          >
            <div className="ui-field">
              <label className="ui-label">Add Values</label>
              <div className="acs-value-add">
                <input
                  className="ui-input"
                  placeholder="Add Value"
                  value={draft.valueInput}
                  onChange={(e) => setDraft((d) => ({ ...d, valueInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValueToDraft(draft, setDraft);
                    }
                  }}
                />
                <button
                  type="button"
                  className="ui-btn ui-btn-primary acs-value-add-btn"
                  onClick={() => addValueToDraft(draft, setDraft)}
                >
                  Add
                </button>
              </div>
              {draft.valueList.length > 0 ? (
                <div className="acs-chip-row">
                  {draft.valueList.map((v) => (
                    <motion.span
                      key={v}
                      className="acs-chip"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {v}
                      <button
                        type="button"
                        aria-label={`Remove ${v}`}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            valueList: d.valueList.filter((x) => x !== v),
                          }))
                        }
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="acs-field-editor-footer">
        <div className="acs-field-editor-checks">
          <CircleCheck
            id={`fld-mandatory-${opts.title}`}
            label="Mandatory"
            checked={draft.mandatory}
            onChange={(n) => setDraft((d) => ({ ...d, mandatory: n }))}
          />
          <CircleCheck
            id={`fld-ai-${opts.title}`}
            label="Enable AI"
            checked={draft.enableAi}
            onChange={(n) => setDraft((d) => ({ ...d, enableAi: n }))}
          />
        </div>

        <div className="acs-field-editor-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={opts.onCancel}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={opts.onPrimary}>
            {opts.primaryLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (!ready) {
    return (
      <div className="acs-page">
        <div className="acs-detail-empty">Loading activity settings…</div>
      </div>
    );
  }

  return (
    <div className={`acs-page${dirty ? ' is-dirty' : ''}${toast ? ' has-toast' : ''}`}>
      <div className="acs-ambient" aria-hidden>
        <span className="acs-blob acs-blob-a" />
        <span className="acs-blob acs-blob-b" />
        <span className="acs-blob acs-blob-c" />
      </div>

      <header className="acs-top">
        <button type="button" className="acs-back" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Activities
        </button>

        <div className="acs-brand">
          <p className="acs-kicker">Parent Communication</p>
          <h1>Activity Settings</h1>
          <p className="acs-sub">
            Customise existing activities or create new ones to match your center’s communication
            preferences.
          </p>
        </div>

        <div className="acs-top-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={handleSave}
            disabled={!dirty}
          >
            Save
          </button>
        </div>
      </header>

      <section className="acs-card">
        <button
          type="button"
          className="acs-general-toggle"
          aria-expanded={generalOpen}
          onClick={() => setGeneralOpen((v) => !v)}
        >
          <Settings2 size={18} color="var(--color-accent)" />
          General Settings
          <ChevronDown
            className={`acs-chevron ${generalOpen ? 'is-open' : ''}`}
            size={16}
          />
          <Info size={14} style={{ marginLeft: 'auto', color: 'var(--acs-muted)' }} />
        </button>

        <AnimatePresence initial={false}>
          {generalOpen ? (
            <motion.div
              key="general"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease }}
              style={{ overflow: 'hidden' }}
            >
              <div className="acs-general-body">
                <div className="acs-checks">
                  <CircleCheck
                    id="gs-checked-in"
                    label="While posting, default to showing only checked-in students (staff can still turn this off)"
                    checked={general.checkedInOnly}
                    onChange={(n) => setGeneral((g) => ({ ...g, checkedInOnly: n }))}
                  />
                  <CircleCheck
                    id="gs-photo"
                    label="Disable photo download for all activities"
                    checked={general.disablePhotoDownload}
                    onChange={(n) => setGeneral((g) => ({ ...g, disablePhotoDownload: n }))}
                  />
                  <CircleCheck
                    id="gs-video"
                    label="Disable video download for all activities"
                    checked={general.disableVideoDownload}
                    onChange={(n) => setGeneral((g) => ({ ...g, disableVideoDownload: n }))}
                  />
                  <CircleCheck
                    id="gs-all-rooms"
                    label="While posting, show all checked-in students (regardless of room)"
                    checked={general.allCheckedInIgnoreRoom}
                    onChange={(n) => setGeneral((g) => ({ ...g, allCheckedInIgnoreRoom: n }))}
                  />
                </div>
                <div className="acs-email-field ui-field">
                  <label className="ui-label" htmlFor="gs-cc-email">
                    Additional Email for CC in Announcement Emails
                  </label>
                  <input
                    id="gs-cc-email"
                    className="ui-input"
                    type="email"
                    placeholder="Enter Email"
                    value={general.ccEmail}
                    onChange={(e) => setGeneral((g) => ({ ...g, ccEmail: e.target.value }))}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <section className="acs-workspace">
        <aside className="acs-list-pane">
          <div className="acs-list-toolbar">
            <div className="acs-search-wrap">
              <input
                className="ui-input"
                type="search"
                placeholder="Search activity"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search activity"
              />
              <Search className="acs-search-icon" size={16} />
            </div>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openCreate}>
              <Plus size={16} />
              Create New Activity
            </button>
          </div>

          <div className="acs-list-scroll" role="list">
            <AnimatePresence initial={false}>
              {filtered.map((a, i) => {
                const active = a.id === selectedId;
                return (
                  <motion.button
                    key={a.id}
                    type="button"
                    role="listitem"
                    className={`acs-list-item ${active ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedId(a.id);
                      setNewField(emptyFieldDraft());
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.24), ease }}
                    whileHover={{ x: 2 }}
                  >
                    <span
                      className="acs-list-icon"
                      style={{ background: a.bgColor }}
                      aria-hidden
                    >
                      <ActivityGlyph activity={a} size={18} />
                    </span>
                    <span className="acs-list-label">{a.name}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 ? (
              <p className="acs-list-empty">No activities match your search.</p>
            ) : null}
          </div>
        </aside>

        <div className="acs-detail-pane">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.p
                key="empty"
                className="acs-detail-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Select an activity to configure.
              </motion.p>
            ) : (
              <motion.div
                key={selected.id}
                className="acs-detail-inner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <div className="acs-detail-head">
                  <span
                    className="acs-list-icon"
                    style={{ background: selected.bgColor, width: 48, height: 48 }}
                    aria-hidden
                  >
                    <ActivityGlyph activity={selected} size={22} />
                  </span>
                  <h2 className="acs-detail-title">{selected.name}</h2>
                  {selected.deletable ? (
                    <button
                      type="button"
                      className="acs-icon-btn is-danger"
                      aria-label={`Delete ${selected.name}`}
                      onClick={() => handleDeleteActivity(selected.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>

                <div className="acs-setting-row">
                  <div className="acs-setting-label">Activity Status</div>
                  <div className="acs-setting-control">
                    <Toggle
                      on={selected.active}
                      onChange={(n) => updateSelected({ active: n })}
                      onLabel="Active"
                      offLabel="Inactive"
                    />
                  </div>
                </div>

                <div className="acs-setting-row">
                  <div className="acs-setting-label">Notify Parents</div>
                  <div className="acs-setting-control">
                    <Toggle
                      on={selected.notifyParents}
                      onChange={(n) => updateSelected({ notifyParents: n })}
                      onLabel="Enabled"
                      offLabel="Disabled"
                    />
                  </div>
                </div>

                <div className="acs-setting-row">
                  <div className="acs-setting-label">Enable Status</div>
                  <div className="acs-setting-control">
                    <div className="acs-enable-grid">
                      <CircleCheck
                        id={`${selected.id}-file`}
                        label="Enable File Upload"
                        checked={selected.enable.fileUpload}
                        onChange={(n) => updateEnable('fileUpload', n)}
                      />
                      <CircleCheck
                        id={`${selected.id}-media`}
                        label="Enable Video/Photo Upload"
                        checked={selected.enable.mediaUpload}
                        onChange={(n) => updateEnable('mediaUpload', n)}
                      />
                      <CircleCheck
                        id={`${selected.id}-draft`}
                        label="Enable draft mode"
                        checked={selected.enable.draftMode}
                        onChange={(n) => updateEnable('draftMode', n)}
                      />
                      <CircleCheck
                        id={`${selected.id}-comments`}
                        label="Enable comments"
                        checked={selected.enable.comments}
                        onChange={(n) => updateEnable('comments', n)}
                      />
                      <CircleCheck
                        id={`${selected.id}-approval`}
                        label="Does not require approval"
                        checked={selected.enable.noApproval}
                        onChange={(n) => updateEnable('noApproval', n)}
                      />
                    </div>
                  </div>
                </div>

                <div className="acs-setting-row">
                  <div className="acs-setting-label">Staff Only</div>
                  <div className="acs-setting-control">
                    <Toggle
                      on={selected.staffOnly}
                      onChange={(n) => updateSelected({ staffOnly: n })}
                      onLabel="Enabled"
                      offLabel="Disabled"
                    />
                  </div>
                </div>

                <div className="acs-setting-row">
                  <div className="acs-setting-label">Form Fields</div>
                  <div className="acs-setting-control">
                    <p className="acs-fields-help">
                      Each activity will contain description and file upload fields as default.
                    </p>

                    <div className="acs-field-list">
                      {selected.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className={`acs-field-card${dragFieldId === field.id ? ' is-dragging' : ''}${
                            dragOverFieldId === field.id && dragFieldId !== field.id
                              ? ' is-drag-over'
                              : ''
                          }`}
                          draggable
                          onDragStart={(e) => onFieldDragStart(e, field.id)}
                          onDragEnd={onFieldDragEnd}
                          onDragOver={(e) => onFieldDragOver(e, field.id)}
                          onDrop={(e) => onFieldDrop(e, field.id)}
                          onDragLeave={() => {
                            if (dragOverFieldId === field.id) setDragOverFieldId(null);
                          }}
                        >
                          <span
                            className="acs-field-drag"
                            aria-hidden
                            title="Drag to reorder"
                          >
                            <GripVertical size={16} />
                          </span>
                          <div className="acs-field-reorder">
                            <button
                              type="button"
                              aria-label="Move up"
                              disabled={idx === 0}
                              onClick={() => moveField(field.id, -1)}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label="Move down"
                              disabled={idx === selected.fields.length - 1}
                              onClick={() => moveField(field.id, 1)}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <div className="acs-field-body">
                            <p className="acs-field-name">
                              {field.name}
                              {field.mandatory ? <span className="acs-req">*</span> : null}
                            </p>
                            <p className="acs-field-meta">
                              Type: {field.type}
                              {draftNeedsValues(field.type) && field.values
                                ? ` · ${field.values}`
                                : ''}
                              {field.enableAi ? ' · AI' : ''}
                            </p>
                          </div>
                          <div className="acs-field-actions">
                            <button
                              type="button"
                              className="acs-icon-btn"
                              aria-label={`Edit ${field.name}`}
                              onClick={() => openEditField(field)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="acs-icon-btn is-danger"
                              aria-label={`Delete ${field.name}`}
                              onClick={() => removeField(field.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {renderFieldForm(newField, setNewField, {
                      title: 'New Field Configuration',
                      primaryLabel: 'Create',
                      onPrimary: handleCreateField,
                      onCancel: () => setNewField(emptyFieldDraft()),
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {dirty ? (
          <motion.div
            className="acs-dirty-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease }}
          >
            <span>Unsaved changes</span>
            <button type="button" className="ui-btn ui-btn-outline" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
              Save
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`acs-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        open={createOpen}
        title="Add Custom Activity"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={handleCreateActivity}>
              Add
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="create-act-name">
              Activity Name
            </label>
            <input
              id="create-act-name"
              className="ui-input"
              placeholder="e.g. Outdoor Play"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value);
                if (createError) setCreateError('');
              }}
            />
            {createError ? (
              <p style={{ margin: '6px 0 0', color: 'var(--color-close)', fontSize: '0.8rem' }}>
                {createError}
              </p>
            ) : null}
          </div>

          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label">Activity Color</label>
            <input
              className="ui-input acs-color-filter"
              type="search"
              placeholder="Search colors…"
              value={createColorFilter}
              onChange={(e) => setCreateColorFilter(e.target.value)}
            />
            <div className="acs-color-grid">
              {colorPresetsFiltered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`acs-color-option ${createColorId === c.id ? 'is-selected' : ''}`}
                  onClick={() => setCreateColorId(c.id)}
                >
                  <span className="acs-swatch" style={{ background: c.hex }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="create-act-image">
              Activity Image (optional)
            </label>
            <input
              id="create-act-image"
              className="ui-input"
              type="file"
              accept="image/*"
              onChange={(e) => onImagePick(e.target.files?.[0] ?? null)}
            />
            {createImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="acs-image-preview" src={createImageUrl} alt="Activity preview" />
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        title="Edit Field"
        onClose={() => {
          setEditOpen(false);
          setEditingFieldId(null);
        }}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setEditOpen(false);
                setEditingFieldId(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={handleSaveEditField}>
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">Type</label>
            <select
              className="ui-select"
              value={editDraft.type}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, type: e.target.value as ActivityFieldType }))
              }
            >
              {ACTIVITY_FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-field">
            <label className="ui-label">Field Name</label>
            <input
              className="ui-input"
              value={editDraft.name}
              onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>
          {draftNeedsValues(editDraft.type) ? (
            <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
              <label className="ui-label">Add Values</label>
              <div className="acs-value-add">
                <input
                  className="ui-input"
                  placeholder="Value"
                  value={editDraft.valueInput}
                  onChange={(e) => setEditDraft((d) => ({ ...d, valueInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValueToDraft(editDraft, setEditDraft);
                    }
                  }}
                />
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => addValueToDraft(editDraft, setEditDraft)}
                >
                  Add
                </button>
              </div>
              {editDraft.valueList.length > 0 ? (
                <div className="acs-chip-row">
                  {editDraft.valueList.map((v) => (
                    <span key={v} className="acs-chip">
                      {v}
                      <button
                        type="button"
                        aria-label={`Remove ${v}`}
                        onClick={() =>
                          setEditDraft((d) => ({
                            ...d,
                            valueList: d.valueList.filter((x) => x !== v),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="acs-field-editor-checks" style={{ gridColumn: '1 / -1' }}>
            <CircleCheck
              id="edit-fld-mandatory"
              label="Mandatory"
              checked={editDraft.mandatory}
              onChange={(n) => setEditDraft((d) => ({ ...d, mandatory: n }))}
            />
            <CircleCheck
              id="edit-fld-ai"
              label="Enable AI"
              checked={editDraft.enableAi}
              onChange={(n) => setEditDraft((d) => ({ ...d, enableAi: n }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
