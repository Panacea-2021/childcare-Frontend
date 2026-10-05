'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Images } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/settings-section.css';
import styles from './SettingsActivityPostSection.module.css';

type FieldType = 'Text' | 'Number' | 'Dropdown';

type CustomField = {
  id: string;
  name: string;
  type: FieldType;
  mandatory: boolean;
  enableAi: boolean;
  values?: string;
};

type EnableFlags = {
  fileUpload: boolean;
  mediaUpload: boolean;
  draftMode: boolean;
  comments: boolean;
  noApproval: boolean;
};

type Activity = {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  deletable: boolean;
  active: boolean;
  notifyParents: boolean;
  showNotifyParents: boolean;
  staffOnly: boolean;
  enable: EnableFlags;
  tags?: string[];
  showTags?: boolean;
  fields: CustomField[];
};

type GeneralSettings = {
  checkedInOnly: boolean;
  disablePhotoDownload: boolean;
  disableVideoDownload: boolean;
  allCheckedInIgnoreRoom: boolean;
  ccEmail: string;
};

const ACTIVITY_COLORS = [
  { id: 'teal', label: 'Teal', hex: '#0D9488' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'indigo', label: 'Indigo', hex: '#5D5FEF' },
  { id: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { id: 'pink', label: 'Pink', hex: '#EC4899' },
  { id: 'orange', label: 'Orange', hex: '#F59E0B' },
  { id: 'green', label: 'Green', hex: '#22C55E' },
  { id: 'red', label: 'Red', hex: '#EF4444' },
] as const;

const FIELD_TYPES: FieldType[] = ['Text', 'Number', 'Dropdown'];

const DEFAULT_GENERAL: GeneralSettings = {
  checkedInOnly: true,
  disablePhotoDownload: true,
  disableVideoDownload: false,
  allCheckedInIgnoreRoom: false,
  ccEmail: '',
};

function defaultEnable(partial?: Partial<EnableFlags>): EnableFlags {
  return {
    fileUpload: false,
    mediaUpload: false,
    draftMode: false,
    comments: false,
    noApproval: false,
    ...partial,
  };
}

function seedActivities(): Activity[] {
  return [
    {
      id: 'playing',
      name: 'Playing',
      icon: '🧸',
      iconBg: '#E0F2FE',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ fileUpload: true, mediaUpload: true }),
      fields: [],
    },
    {
      id: 'dancing',
      name: 'Dancing',
      icon: '🎵',
      iconBg: '#FCE7F3',
      deletable: true,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ fileUpload: true, mediaUpload: true }),
      fields: [
        {
          id: 'dance-q',
          name: 'Which dance you love',
          type: 'Text',
          mandatory: false,
          enableAi: false,
        },
      ],
    },
    {
      id: 'bottle',
      name: 'Bottle',
      icon: '🍼',
      iconBg: '#DBEAFE',
      deletable: true,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ noApproval: true }),
      fields: [
        {
          id: 'bottle-qty',
          name: 'Bottle Quantity (fluid ounces)',
          type: 'Number',
          mandatory: false,
          enableAi: false,
        },
        {
          id: 'bottle-consumed',
          name: 'Consumed Volume (fluid ounces)',
          type: 'Number',
          mandatory: true,
          enableAi: false,
        },
        {
          id: 'bottle-unit',
          name: 'Unit',
          type: 'Dropdown',
          mandatory: false,
          enableAi: false,
          values: 'oz, ml',
        },
      ],
    },
    {
      id: 'name-to-face',
      name: 'Name to Face',
      icon: '😊',
      iconBg: '#FEF08A',
      deletable: false,
      active: true,
      notifyParents: false,
      showNotifyParents: false,
      staffOnly: true,
      enable: defaultEnable({
        fileUpload: true,
        mediaUpload: true,
        draftMode: true,
      }),
      showTags: true,
      tags: ['Here', 'Outdoor', 'Nap Check', 'Diaper Check'],
      fields: [],
    },
    {
      id: 'photo',
      name: 'Photo',
      icon: '🖼️',
      iconBg: '#BFDBFE',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({
        fileUpload: true,
        mediaUpload: true,
        comments: true,
      }),
      fields: [],
    },
    {
      id: 'video',
      name: 'Video',
      icon: '▶️',
      iconBg: '#BBF7D0',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ mediaUpload: true, comments: true }),
      fields: [],
    },
    {
      id: 'announcement',
      name: 'Announcement',
      icon: '📢',
      iconBg: '#E9D5FF',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: false,
      staffOnly: false,
      enable: defaultEnable({ comments: true }),
      fields: [],
    },
    {
      id: 'diary',
      name: 'Diary',
      icon: '📕',
      iconBg: '#FECACA',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ fileUpload: true, comments: true }),
      fields: [],
    },
    {
      id: 'todays-mood',
      name: "Today's Mood",
      icon: '🙂',
      iconBg: '#BAE6FD',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({
        fileUpload: true,
        mediaUpload: true,
        comments: true,
      }),
      fields: [
        {
          id: 'mood-note',
          name: 'Note',
          type: 'Text',
          mandatory: false,
          enableAi: false,
        },
        {
          id: 'mood-select',
          name: "Today's Mood",
          type: 'Dropdown',
          mandatory: true,
          enableAi: false,
          values: 'Happy 😋, Excited 🥳, Sleepy 😴, Sad 😥, Grumpy 😤, Quiet 🤐, Tired 🥶',
        },
      ],
    },
    {
      id: 'stem',
      name: 'Stem',
      icon: '🧪',
      iconBg: '#FEF08A',
      deletable: false,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ fileUpload: true, mediaUpload: true }),
      fields: [],
    },
  ];
}

function cloneActivities(list: Activity[]): Activity[] {
  return list.map((a) => ({
    ...a,
    enable: { ...a.enable },
    tags: a.tags ? [...a.tags] : undefined,
    fields: a.fields.map((f) => ({ ...f })),
  }));
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
    <label className={styles.check} htmlFor={id}>
      <input
        id={id}
        className={styles.checkInput}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.circle} ${checked ? styles.circleOn : ''}`} aria-hidden>
        {checked ? (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span>{label}</span>
    </label>
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
    <div className={styles.toggleRow}>
      <button
        type="button"
        className={`${styles.switch} ${on ? styles.switchOn : ''}`}
        aria-pressed={on}
        onClick={() => onChange(!on)}
      />
      <span className={styles.toggleLabel}>{on ? onLabel : offLabel}</span>
    </div>
  );
}

export function SettingsActivityPostSection() {
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [baselineGeneral, setBaselineGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [activities, setActivities] = useState<Activity[]>(() => seedActivities());
  const [baselineActivities, setBaselineActivities] = useState<Activity[]>(() => seedActivities());
  const [selectedId, setSelectedId] = useState('name-to-face');
  const [generalOpen, setGeneralOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tagDraft, setTagDraft] = useState('');
  const [fieldEditor, setFieldEditor] = useState<'add' | string | null>(null);
  const [fieldForm, setFieldForm] = useState({
    type: 'Text' as FieldType,
    name: '',
    mandatory: false,
    enableAi: false,
    values: '',
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    color: '',
    imageName: '',
  });
  const [createErrors, setCreateErrors] = useState<{ name?: string; color?: string; image?: string }>(
    {},
  );
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragId = useRef<string | null>(null);

  const dirty = useMemo(() => {
    return (
      JSON.stringify(general) !== JSON.stringify(baselineGeneral) ||
      JSON.stringify(activities) !== JSON.stringify(baselineActivities)
    );
  }, [general, baselineGeneral, activities, baselineActivities]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => a.name.toLowerCase().includes(q));
  }, [activities, search]);

  const selected = activities.find((a) => a.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<Activity> | ((a: Activity) => Activity)) => {
    setActivities((list) =>
      list.map((a) => {
        if (a.id !== selectedId) return a;
        return typeof patch === 'function' ? patch(a) : { ...a, ...patch };
      }),
    );
  };

  const updateEnable = (key: keyof EnableFlags, next: boolean) => {
    updateSelected((a) => ({ ...a, enable: { ...a.enable, [key]: next } }));
  };

  const resetFieldForm = (seed?: Partial<typeof fieldForm>) => {
    setFieldForm({
      type: 'Text',
      name: '',
      mandatory: false,
      enableAi: false,
      values: '',
      ...seed,
    });
  };

  const openAddField = () => {
    resetFieldForm();
    setFieldEditor('add');
  };

  const openEditField = (field: CustomField) => {
    resetFieldForm({
      type: field.type,
      name: field.name,
      mandatory: field.mandatory,
      enableAi: field.enableAi,
      values: field.values ?? '',
    });
    setFieldEditor(field.id);
  };

  const commitField = () => {
    if (!fieldForm.name.trim()) return;
    const payload: CustomField = {
      id: fieldEditor === 'add' ? `f-${Date.now()}` : String(fieldEditor),
      name: fieldForm.name.trim(),
      type: fieldForm.type,
      mandatory: fieldForm.mandatory,
      enableAi: fieldForm.enableAi,
      values: fieldForm.type === 'Dropdown' ? fieldForm.values.trim() : undefined,
    };
    updateSelected((a) => {
      if (fieldEditor === 'add') {
        return { ...a, fields: [...a.fields, payload] };
      }
      return {
        ...a,
        fields: a.fields.map((f) => (f.id === fieldEditor ? payload : f)),
      };
    });
    setFieldEditor(null);
  };

  const removeField = (id: string) => {
    updateSelected((a) => ({ ...a, fields: a.fields.filter((f) => f.id !== id) }));
    if (fieldEditor === id) setFieldEditor(null);
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || !selected) return;
    if ((selected.tags ?? []).includes(value)) {
      setTagDraft('');
      return;
    }
    updateSelected((a) => ({ ...a, tags: [...(a.tags ?? []), value] }));
    setTagDraft('');
  };

  const removeTag = (tag: string) => {
    updateSelected((a) => ({ ...a, tags: (a.tags ?? []).filter((t) => t !== tag) }));
  };

  const onCancel = () => {
    if (!dirty) return;
    setGeneral({ ...baselineGeneral });
    setActivities(cloneActivities(baselineActivities));
    setFieldEditor(null);
    setTagDraft('');
  };

  const onSave = () => {
    if (!dirty) return;
    setBaselineGeneral({ ...general });
    setBaselineActivities(cloneActivities(activities));
    setToast('Activity settings saved');
  };

  const toggleMulti = () => {
    setMultiSelect((v) => {
      if (v) setSelectedIds(new Set());
      return !v;
    });
  };

  const toggleSelectId = (id: string, next: boolean) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (next) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const bulkSetActive = (active: boolean) => {
    if (selectedIds.size === 0) return;
    setActivities((list) =>
      list.map((a) => (selectedIds.has(a.id) ? { ...a, active } : a)),
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((list) => list.filter((a) => a.id !== id));
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (selectedId === id) {
      setSelectedId((prev) => {
        const remaining = activities.filter((a) => a.id !== id);
        return remaining[0]?.id ?? prev;
      });
    }
  };

  const submitCreate = () => {
    const errors: typeof createErrors = {};
    if (!createForm.name.trim()) errors.name = 'Activity name is required';
    if (!createForm.color) errors.color = 'Activity color is required';
    if (!createForm.imageName) errors.image = 'Activity image is required';
    setCreateErrors(errors);
    if (Object.keys(errors).length) return;

    const color = ACTIVITY_COLORS.find((c) => c.id === createForm.color);
    const id = `custom-${Date.now()}`;
    const next: Activity = {
      id,
      name: createForm.name.trim(),
      icon: '✨',
      iconBg: color ? `${color.hex}33` : '#E8F2FF',
      deletable: true,
      active: true,
      notifyParents: true,
      showNotifyParents: true,
      staffOnly: false,
      enable: defaultEnable({ fileUpload: true, mediaUpload: true }),
      fields: [],
    };
    setActivities((list) => [...list, next]);
    setSelectedId(id);
    setCreateOpen(false);
    setCreateForm({ name: '', color: '', imageName: '' });
    setCreateErrors({});
    setToast('Custom activity added');
  };

  const onDragStart = (id: string) => {
    dragId.current = id;
  };

  const onDropField = (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId || !selected) return;
    updateSelected((a) => {
      const fields = [...a.fields];
      const fromIdx = fields.findIndex((f) => f.id === from);
      const toIdx = fields.findIndex((f) => f.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return a;
      const [item] = fields.splice(fromIdx, 1);
      fields.splice(toIdx, 0, item);
      return { ...a, fields };
    });
  };

  return (
    <div className="cm-page cm-page--settings settings-section">
      <CenterManagementPageHeader
        title="Activity Posts"
        description="Configure activity types and posting fields for parent updates."
        icon={<Images size={22} strokeWidth={2.1} />}
        actions={
          <button
            type="button"
            className={`ui-btn ui-btn-primary ${styles.createBtn}`}
            onClick={() => {
              setCreateForm({ name: '', color: '', imageName: '' });
              setCreateErrors({});
              setCreateOpen(true);
            }}
          >
            Create New Activity
          </button>
        }
      />
      <div className="settings-section-body">
    <div className={styles.root}>
      <section className={styles.generalCard}>
        <button
          type="button"
          className={styles.generalToggle}
          aria-expanded={generalOpen}
          onClick={() => setGeneralOpen((v) => !v)}
        >
          <svg
            className={`${styles.chevron} ${generalOpen ? styles.chevronOpen : ''}`}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden
          >
            <path d="M3 5.5 7 9.5 11 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          General Settings
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--ap-muted)' }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 10.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="1" fill="currentColor" />
          </svg>
        </button>
        {generalOpen ? (
          <div className={styles.generalBody}>
            <div className={styles.generalChecks}>
              <CircleCheck
                id="gs-checked-in"
                label="While posting, default to showing only checked-in students (staff can still turn this off)"
                checked={general.checkedInOnly}
                onChange={(next) => setGeneral((g) => ({ ...g, checkedInOnly: next }))}
              />
              <CircleCheck
                id="gs-photo"
                label="Disable photo download for all activities"
                checked={general.disablePhotoDownload}
                onChange={(next) => setGeneral((g) => ({ ...g, disablePhotoDownload: next }))}
              />
              <CircleCheck
                id="gs-video"
                label="Disable video download for all activities"
                checked={general.disableVideoDownload}
                onChange={(next) => setGeneral((g) => ({ ...g, disableVideoDownload: next }))}
              />
              <CircleCheck
                id="gs-all-rooms"
                label="While posting, show all checked-in students (regardless of room assignment)"
                checked={general.allCheckedInIgnoreRoom}
                onChange={(next) => setGeneral((g) => ({ ...g, allCheckedInIgnoreRoom: next }))}
              />
            </div>
            <div className={styles.generalEmail}>
              <label className={styles.emailLabel} htmlFor="gs-cc-email">
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
        ) : null}
      </section>

      <section className={styles.workspace}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={`ui-input ${styles.searchInput}`}
              type="search"
              placeholder="Search activity"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search activity"
            />
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <button type="button" className={styles.selectLink} onClick={toggleMulti}>
            {multiSelect ? 'Done' : 'Select Multiple'}
          </button>
          {multiSelect ? (
            <div className={styles.bulkBar}>
              <span>{selectedIds.size} selected</span>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                disabled={selectedIds.size === 0}
                onClick={() => bulkSetActive(true)}
              >
                Activate
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                disabled={selectedIds.size === 0}
                onClick={() => bulkSetActive(false)}
              >
                Deactivate
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.split}>
          <div className={styles.listPane} role="list">
            {filtered.map((a) => {
              const active = a.id === selectedId;
              return (
                <div key={a.id} role="listitem" style={{ display: 'flex', alignItems: 'stretch' }}>
                  {multiSelect ? (
                    <label
                      className={styles.check}
                      style={{ padding: '12px 0 12px 12px', margin: 0 }}
                      htmlFor={`sel-${a.id}`}
                    >
                      <input
                        id={`sel-${a.id}`}
                        className={styles.checkInput}
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={(e) => toggleSelectId(a.id, e.target.checked)}
                      />
                      <span
                        className={`${styles.circle} ${selectedIds.has(a.id) ? styles.circleOn : ''}`}
                        aria-hidden
                      >
                        {selectedIds.has(a.id) ? (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6.2 4.8 8.5 9.5 3.5"
                              stroke="#fff"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </span>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    className={`${styles.listItem} ${active ? styles.listItemActive : ''}`}
                    onClick={() => {
                      setSelectedId(a.id);
                      setFieldEditor(null);
                      setTagDraft('');
                    }}
                  >
                    <span className={styles.listIcon} style={{ background: a.iconBg }} aria-hidden>
                      {a.icon}
                    </span>
                    <span className={styles.listLabel}>{a.name}</span>
                    <span className={styles.listChevron} aria-hidden>
                      ›
                    </span>
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <p className={styles.emptyDetail}>No activities match your search.</p>
            ) : null}
          </div>

          <div className={styles.detailPane}>
            {!selected ? (
              <p className={styles.emptyDetail}>Select an activity to configure.</p>
            ) : (
              <>
                <div className={styles.detailHead}>
                  <span className={styles.listIcon} style={{ background: selected.iconBg }} aria-hidden>
                    {selected.icon}
                  </span>
                  <h2 className={styles.detailTitle}>{selected.name}</h2>
                  {selected.deletable ? (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={`Delete ${selected.name}`}
                      onClick={() => deleteActivity(selected.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingLabel}>Activity Status</div>
                  <div className={styles.settingControl}>
                    <Toggle
                      on={selected.active}
                      onChange={(next) => updateSelected({ active: next })}
                      onLabel="Active"
                      offLabel="Inactive"
                    />
                  </div>
                </div>

                {selected.showNotifyParents ? (
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>Notify Parents</div>
                    <div className={styles.settingControl}>
                      <Toggle
                        on={selected.notifyParents}
                        onChange={(next) => updateSelected({ notifyParents: next })}
                        onLabel="Enabled"
                        offLabel="Disabled"
                      />
                    </div>
                  </div>
                ) : null}

                <div className={styles.settingRow}>
                  <div className={styles.settingLabel}>Enable Status</div>
                  <div className={styles.settingControl}>
                    <div className={styles.checks}>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingLabel}>Staff Only</div>
                  <div className={styles.settingControl}>
                    <Toggle
                      on={selected.staffOnly}
                      onChange={(next) => updateSelected({ staffOnly: next })}
                      onLabel="Enabled"
                      offLabel="Disabled"
                    />
                  </div>
                </div>

                {selected.showTags ? (
                  <div className={styles.settingRow}>
                    <div className={styles.settingLabel}>Activity Tag</div>
                    <div className={styles.settingControl}>
                      <p className={styles.tagHelp}>
                        You can configure the tags for the {selected.name} activity
                      </p>
                      <div className={styles.tagAddRow}>
                        <input
                          className="ui-input"
                          placeholder="Add Value"
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <button type="button" className="ui-btn ui-btn-primary" onClick={addTag}>
                          Add
                        </button>
                      </div>
                      <div className={styles.tagList}>
                        {(selected.tags ?? []).map((tag) => (
                          <span key={tag} className={styles.tagPill}>
                            {tag}
                            <button
                              type="button"
                              className={styles.tagRemove}
                              aria-label={`Remove ${tag}`}
                              onClick={() => removeTag(tag)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={styles.settingRow}>
                  <div className={styles.settingLabel}>Form Fields</div>
                  <div className={styles.settingControl}>
                    <p className={styles.fieldsHelp}>
                      Each activity will contain description and file upload fields as default
                    </p>

                    {selected.fields.map((field) => (
                      <div
                        key={field.id}
                        className={styles.fieldCard}
                        draggable
                        onDragStart={() => onDragStart(field.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropField(field.id)}
                      >
                        <span className={styles.dragHandle} aria-hidden>
                          ⋮⋮
                        </span>
                        <div className={styles.fieldBody}>
                          <p className={styles.fieldName}>
                            {field.name}
                            {field.mandatory ? <span className={styles.reqStar}>*</span> : null}
                          </p>
                          <p className={styles.fieldMeta}>
                            Type: {field.type}
                            {field.type === 'Dropdown' && field.values ? ` · ${field.values}` : ''}
                          </p>
                        </div>
                        <div className={styles.fieldActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            aria-label={`Edit ${field.name}`}
                            onClick={() => openEditField(field)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            aria-label={`Delete ${field.name}`}
                            onClick={() => removeField(field.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {fieldEditor ? (
                      <div className={styles.fieldEditor}>
                        <div className={styles.fieldEditorRow}>
                          <div className="ui-field">
                            <label className="ui-label">Type</label>
                            <select
                              className="ui-select"
                              value={fieldForm.type}
                              onChange={(e) =>
                                setFieldForm((f) => ({ ...f, type: e.target.value as FieldType }))
                              }
                            >
                              {FIELD_TYPES.map((t) => (
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
                              placeholder="Field Name"
                              value={fieldForm.name}
                              onChange={(e) => setFieldForm((f) => ({ ...f, name: e.target.value }))}
                            />
                          </div>
                        </div>
                        {fieldForm.type === 'Dropdown' ? (
                          <div className="ui-field">
                            <label className="ui-label">Dropdown values</label>
                            <input
                              className="ui-input"
                              placeholder="Comma-separated values"
                              value={fieldForm.values}
                              onChange={(e) => setFieldForm((f) => ({ ...f, values: e.target.value }))}
                            />
                          </div>
                        ) : null}
                        <div className={styles.fieldEditorChecks}>
                          <CircleCheck
                            id="field-mandatory"
                            label="Mandatory"
                            checked={fieldForm.mandatory}
                            onChange={(n) => setFieldForm((f) => ({ ...f, mandatory: n }))}
                          />
                          <CircleCheck
                            id="field-ai"
                            label="Enable AI"
                            checked={fieldForm.enableAi}
                            onChange={(n) => setFieldForm((f) => ({ ...f, enableAi: n }))}
                          />
                        </div>
                        <div className={styles.fieldEditorActions}>
                          <button
                            type="button"
                            className="ui-btn ui-btn-outline"
                            onClick={() => setFieldEditor(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="ui-btn ui-btn-primary"
                            onClick={commitField}
                            disabled={!fieldForm.name.trim()}
                          >
                            {fieldEditor === 'add' ? 'Create' : 'Update'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`ui-btn ui-btn-outline ${styles.addFieldBtn}`}
                        onClick={openAddField}
                      >
                        + Add a custom field
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className={styles.footer}>
        {dirty ? <span className={styles.unsaved}>Unsaved changes</span> : null}
        <div className={styles.footerActions}>
          <button
            type="button"
            className={`ui-btn ui-btn-outline ${styles.footerBtn}`}
            onClick={onCancel}
            disabled={!dirty}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`ui-btn ui-btn-primary ${styles.footerBtn}`}
            onClick={onSave}
            disabled={!dirty}
          >
            Save
          </button>
        </div>
      </div>

      <Modal
        open={createOpen}
        title="Add Custom Activity"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={submitCreate}>
              Add
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">
            <span className={styles.req}>*</span> Activity Name
          </label>
          <div className={styles.nameInputWrap}>
            <svg
              className={styles.nameInputIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M5 19c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="ui-input"
              placeholder="Activity Name"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          {createErrors.name ? (
            <p style={{ margin: '6px 0 0', color: 'var(--ap-danger)', fontSize: '0.8rem' }}>
              {createErrors.name}
            </p>
          ) : null}
        </div>

        <div className="ui-field" style={{ marginTop: 14 }}>
          <label className="ui-label" htmlFor="activity-color">
            <span className={styles.req}>*</span> Activity Color
          </label>
          <select
            id="activity-color"
            className="ui-select"
            value={createForm.color}
            onChange={(e) => setCreateForm((f) => ({ ...f, color: e.target.value }))}
          >
            <option value="">Please select favourite colors</option>
            {ACTIVITY_COLORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {createForm.color ? (
            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--ap-muted)' }}>
              <span
                className={styles.colorSwatch}
                style={{
                  background: ACTIVITY_COLORS.find((c) => c.id === createForm.color)?.hex,
                }}
              />
              {ACTIVITY_COLORS.find((c) => c.id === createForm.color)?.label}
            </p>
          ) : null}
          {createErrors.color ? (
            <p style={{ margin: '6px 0 0', color: 'var(--ap-danger)', fontSize: '0.8rem' }}>
              {createErrors.color}
            </p>
          ) : null}
        </div>

        <div className="ui-field" style={{ marginTop: 14 }}>
          <label className="ui-label">
            <span className={styles.req}>*</span> Activity Image
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              setCreateForm((f) => ({ ...f, imageName: file?.name ?? '' }));
            }}
          />
          <button type="button" className={styles.uploadZone} onClick={() => fileRef.current?.click()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5M5 18h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Click to upload
          </button>
          {createForm.imageName ? (
            <p className={styles.uploadPreview} style={{ marginTop: 8 }}>
              Selected: {createForm.imageName}
            </p>
          ) : null}
          {createErrors.image ? (
            <p style={{ margin: '6px 0 0', color: 'var(--ap-danger)', fontSize: '0.8rem' }}>
              {createErrors.image}
            </p>
          ) : null}
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}
    </div>
      </div>
    </div>
  );
}
