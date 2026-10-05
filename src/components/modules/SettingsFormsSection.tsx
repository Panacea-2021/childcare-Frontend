'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import '@/components/ui/module.css';
import styles from './SettingsFormsSection.module.css';

type FieldType = 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Checkbox' | 'Text Area' | 'Yes/No Checkbox';

type FormField = {
  id: string;
  type: FieldType;
  name: string;
  mandatory: boolean;
  values?: string;
  options?: string[];
  hideFromParent?: boolean;
  disableTeacherEdit?: boolean;
  disableTeacherView?: boolean;
  exceptionRoles?: string[];
  autoIncrement?: boolean;
  autoPrefix?: string;
  autoStart?: string;
};

type CategoryId =
  | 'profile-fields'
  | 'checkin'
  | 'checkout'
  | 'staff-checkin'
  | 'staff-checkout'
  | 'lesson'
  | 'appointment'
  | 'program';

type Category = {
  id: CategoryId;
  label: string;
  detailTitle: string;
};

const FIELD_TYPES: FieldType[] = ['Text', 'Number', 'Date', 'Dropdown', 'Checkbox', 'Text Area'];

const PROFILE_FIELD_TYPES: FieldType[] = ['Text', 'Number', 'Dropdown', 'Yes/No Checkbox', 'Date'];

const EXCEPTION_ROLE_OPTIONS = [
  'Center Admin',
  'Principal',
  'Teacher',
  'Coordinator',
  'Accountant',
];

const PROFILE_STORAGE_KEY = 'panacea.settings.forms.profile.v1';

type ProfileFieldForm = {
  type: '' | FieldType;
  name: string;
  mandatory: boolean;
  options: string[];
  hideFromParent: boolean;
  disableTeacherEdit: boolean;
  disableTeacherView: boolean;
  exceptionRoles: string[];
  autoIncrement: boolean;
  autoPrefix: string;
  autoStart: string;
};

const EMPTY_PROFILE_FORM: ProfileFieldForm = {
  type: '',
  name: '',
  mandatory: false,
  options: [''],
  hideFromParent: false,
  disableTeacherEdit: false,
  disableTeacherView: false,
  exceptionRoles: [],
  autoIncrement: false,
  autoPrefix: '',
  autoStart: '1',
};

const CATEGORIES: Category[] = [
  {
    id: 'profile-fields',
    label: 'Student, parent and teacher profile fields',
    detailTitle: 'Student, parent and teacher profile fields',
  },
  { id: 'checkin', label: 'Check-in form', detailTitle: 'Check-in form' },
  { id: 'checkout', label: 'Check-out form', detailTitle: 'Check-out form' },
  { id: 'staff-checkin', label: 'Staff check-in form', detailTitle: 'Staff check-in form' },
  { id: 'staff-checkout', label: 'Staff check-out form', detailTitle: 'Staff check-out form' },
  { id: 'lesson', label: 'Lesson additional fields', detailTitle: 'Lesson additional fields' },
  { id: 'appointment', label: 'Parent–teacher meeting fields', detailTitle: 'Parent–teacher meeting fields' },
  { id: 'program', label: 'Program additional fields', detailTitle: 'Program Additional Fields' },
];

const CATEGORY_META: Record<CategoryId, { blurb: string; tone: string }> = {
  'profile-fields': {
    blurb: 'Custom fields shown on student, parent, and teacher profiles.',
    tone: 'purple',
  },
  checkin: {
    blurb: 'Morning arrival questions and health checks for students.',
    tone: 'green',
  },
  checkout: {
    blurb: 'End-of-day notes and pickup confirmations for parents.',
    tone: 'coral',
  },
  'staff-checkin': {
    blurb: 'Staff clock-in questions and shift notes.',
    tone: 'blue',
  },
  'staff-checkout': {
    blurb: 'Staff clock-out checklist and handover comments.',
    tone: 'mint',
  },
  lesson: {
    blurb: 'Extra fields captured while logging lessons.',
    tone: 'amber',
  },
  appointment: {
    blurb: 'Parent–teacher meeting form questions and topics.',
    tone: 'pink',
  },
  program: {
    blurb: 'Program enrollment extras and preferences.',
    tone: 'violet',
  },
};

const EMPTY_FIELDS: Record<CategoryId, FormField[]> = {
  'profile-fields': [
    { id: 'pf-nickname', type: 'Text', name: 'Preferred nickname', mandatory: false },
    { id: 'pf-allergies', type: 'Text Area', name: 'Allergy notes', mandatory: false },
    { id: 'pf-language', type: 'Dropdown', name: 'Home language', mandatory: false, options: ['English', 'Hindi', 'Kannada', 'Tamil'] },
  ],
  checkin: [
    { id: 'ci-mood', type: 'Dropdown', name: 'Child mood', mandatory: true, options: ['Happy', 'Tired', 'Upset', 'Sick'] },
    { id: 'ci-temp', type: 'Number', name: 'Temperature (°F)', mandatory: false },
    { id: 'ci-meds', type: 'Yes/No Checkbox', name: 'Medication given today?', mandatory: true },
    { id: 'ci-notes', type: 'Text Area', name: 'Parent notes', mandatory: false },
  ],
  checkout: [
    { id: 'co-pickup', type: 'Text', name: 'Picked up by', mandatory: true },
    { id: 'co-summary', type: 'Text Area', name: 'Day summary', mandatory: false },
    { id: 'co-items', type: 'Checkbox', name: 'Items sent home', mandatory: false },
  ],
  'staff-checkin': [
    { id: 'sci-room', type: 'Dropdown', name: 'Assigned room', mandatory: true, options: loadActiveCenterRooms().map((room) => room.name) },
    { id: 'sci-shift', type: 'Dropdown', name: 'Shift', mandatory: true, options: ['Morning', 'Afternoon', 'Full day'] },
  ],
  'staff-checkout': [
    { id: 'sco-handover', type: 'Text Area', name: 'Handover notes', mandatory: true },
    { id: 'sco-overtime', type: 'Yes/No Checkbox', name: 'Overtime claimed?', mandatory: false },
  ],
  lesson: [
    { id: 'ls-objective', type: 'Text', name: 'Learning objective', mandatory: false },
    { id: 'ls-materials', type: 'Text Area', name: 'Materials used', mandatory: false },
  ],
  appointment: [
    { id: 'ap-topic', type: 'Dropdown', name: 'Meeting topic', mandatory: true, options: ['Progress', 'Behaviour', 'Health', 'Enrollment'] },
    { id: 'ap-concern', type: 'Text Area', name: 'Parent concerns', mandatory: false },
    { id: 'ap-followup', type: 'Date', name: 'Follow-up date', mandatory: false },
  ],
  program: [
    { id: 'pr-start', type: 'Date', name: 'Program start preference', mandatory: false },
    { id: 'pr-meal', type: 'Dropdown', name: 'Meal plan', mandatory: false, options: ['Full', 'Half', 'None'] },
  ],
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

type ProfileTab = 'student' | 'parent' | 'teacher';

type AllergyCategory = { id: string; name: string };
type AllergySeverityLevel = { id: string; name: string; color: string };

type AllergyConfig = {
  categories: AllergyCategory[];
  severities: AllergySeverityLevel[];
};

const ALLERGY_STORAGE_KEY = 'panacea.settings.forms.allergy.v1';

const SEVERITY_COLORS = ['#14b8a6', '#5D5FEF', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

const EMPTY_ALLERGY: AllergyConfig = { categories: [], severities: [] };

function loadAllergyConfig(): AllergyConfig {
  if (typeof window === 'undefined') return EMPTY_ALLERGY;
  try {
    const raw = sessionStorage.getItem(ALLERGY_STORAGE_KEY);
    if (!raw) return EMPTY_ALLERGY;
    const parsed = JSON.parse(raw) as AllergyConfig;
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      severities: Array.isArray(parsed.severities) ? parsed.severities : [],
    };
  } catch {
    return EMPTY_ALLERGY;
  }
}

function saveAllergyConfig(config: AllergyConfig) {
  try {
    sessionStorage.setItem(ALLERGY_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore quota */
  }
}

type ProfileSection = {
  id: string;
  name: string;
  fields: FormField[];
};

type ProfileTabState = {
  unsectioned: FormField[];
  sections: ProfileSection[];
};

type ProfileState = Record<ProfileTab, ProfileTabState>;

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'student', label: 'Student' },
  { id: 'parent', label: 'Parent' },
  { id: 'teacher', label: 'Teacher' },
];

const EMPTY_PROFILE: ProfileState = {
  student: { unsectioned: [], sections: [] },
  parent: { unsectioned: [], sections: [] },
  teacher: { unsectioned: [], sections: [] },
};

function loadProfileState(): ProfileState {
  if (typeof window === 'undefined') return EMPTY_PROFILE;
  try {
    const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as ProfileState;
    return {
      student: parsed.student ?? EMPTY_PROFILE.student,
      parent: parsed.parent ?? EMPTY_PROFILE.parent,
      teacher: parsed.teacher ?? EMPTY_PROFILE.teacher,
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

function saveProfileState(next: ProfileState) {
  try {
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function fieldTypeLabel(type: FieldType) {
  return type === 'Checkbox' ? 'Yes/No Checkbox' : type;
}

function DragHandle() {
  return (
    <span className={styles.dragHandle} aria-hidden>
      <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
        <circle cx="4" cy="3" r="1.35" fill="currentColor" />
        <circle cx="10" cy="3" r="1.35" fill="currentColor" />
        <circle cx="4" cy="9" r="1.35" fill="currentColor" />
        <circle cx="10" cy="9" r="1.35" fill="currentColor" />
        <circle cx="4" cy="15" r="1.35" fill="currentColor" />
        <circle cx="10" cy="15" r="1.35" fill="currentColor" />
      </svg>
    </span>
  );
}

function CategoryIcon({ id }: { id: CategoryId }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' as const, 'aria-hidden': true };
  switch (id) {
    case 'profile-fields':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M5.5 19c.8-3.2 3-5 6.5-5s5.7 1.8 6.5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'checkin':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 12h7M18 9l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'checkout':
      return (
        <svg {...common}>
          <rect x="8" y="5" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 12H3M6 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'staff-checkin':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13 12h8M18 9l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'staff-checkout':
      return (
        <svg {...common}>
          <rect x="10" y="5" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 12H3M6 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'lesson':
      return (
        <svg {...common}>
          <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'appointment':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9.5 15.5 11.2 17l3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'program':
    default:
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 8h6M9 12h6M9 16h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 15.2 16.2 16.4 18.5 13.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function SettingsFormsSection() {
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<CategoryId | null>(null);
  const [fieldsByCategory, setFieldsByCategory] = useState(EMPTY_FIELDS);
  const [profile, setProfile] = useState<ProfileState>(EMPTY_PROFILE);
  const [profileTab, setProfileTab] = useState<ProfileTab>('student');
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyConfig, setAllergyConfig] = useState<AllergyConfig>(EMPTY_ALLERGY);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [severityDraft, setSeverityDraft] = useState('');
  const [fieldTarget, setFieldTarget] = useState<'unsectioned' | string>('unsectioned');
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: '' as '' | FieldType,
    name: '',
    mandatory: false,
    values: '',
  });
  const [profileForm, setProfileForm] = useState<ProfileFieldForm>(EMPTY_PROFILE_FORM);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setAllergyConfig(loadAllergyConfig());
    setProfile(loadProfileState());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const persistProfile = (updater: (prev: ProfileState) => ProfileState) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveProfileState(next);
      return next;
    });
  };

  const updateAllergy = (next: AllergyConfig) => {
    setAllergyConfig(next);
    saveAllergyConfig(next);
  };

  const addAllergyCategory = () => {
    const name = categoryDraft.trim();
    if (!name) {
      setToast({ type: 'err', message: 'Enter an allergy category' });
      return;
    }
    if (allergyConfig.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Category already exists' });
      return;
    }
    updateAllergy({
      ...allergyConfig,
      categories: [...allergyConfig.categories, { id: `ac-${Date.now()}`, name }],
    });
    setCategoryDraft('');
  };

  const removeAllergyCategory = (id: string) => {
    updateAllergy({
      ...allergyConfig,
      categories: allergyConfig.categories.filter((c) => c.id !== id),
    });
  };

  const addAllergySeverity = () => {
    const name = severityDraft.trim();
    if (!name) {
      setToast({ type: 'err', message: 'Enter a severity level name' });
      return;
    }
    if (allergyConfig.severities.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Severity level already exists' });
      return;
    }
    const color = SEVERITY_COLORS[allergyConfig.severities.length % SEVERITY_COLORS.length];
    updateAllergy({
      ...allergyConfig,
      severities: [...allergyConfig.severities, { id: `as-${Date.now()}`, name, color }],
    });
    setSeverityDraft('');
  };

  const removeAllergySeverity = (id: string) => {
    updateAllergy({
      ...allergyConfig,
      severities: allergyConfig.severities.filter((s) => s.id !== id),
    });
  };

  const allergyCategoriesSummary =
    allergyConfig.categories.length === 0
      ? 'None configured'
      : allergyConfig.categories.map((c) => c.name).join(', ');

  const allergySeveritySummary =
    allergyConfig.severities.length === 0
      ? 'None configured'
      : `${allergyConfig.severities.length} level${allergyConfig.severities.length === 1 ? '' : 's'}`;

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === activeId) ?? null,
    [activeId],
  );

  const activeFields = activeId && activeId !== 'profile-fields' ? fieldsByCategory[activeId] : [];
  const profileTabData = profile[profileTab];

  const openAdd = () => {
    setEditingId(null);
    setForm({ type: '', name: '', mandatory: false, values: '' });
    setModalOpen(true);
  };

  const openAddProfileField = (target: 'unsectioned' | string = 'unsectioned') => {
    setFieldTarget(target);
    setEditingId(null);
    setProfileForm(EMPTY_PROFILE_FORM);
    setModalOpen(true);
  };

  const openEdit = (field: FormField) => {
    setEditingId(field.id);
    setForm({
      type: field.type,
      name: field.name,
      mandatory: field.mandatory,
      values: field.values ?? '',
    });
    setModalOpen(true);
  };

  const openEditProfileField = (field: FormField, target: 'unsectioned' | string) => {
    setFieldTarget(target);
    setEditingId(field.id);
    const opts =
      field.options && field.options.length > 0
        ? field.options
        : field.values
          ? field.values.split(',').map((v) => v.trim()).filter(Boolean)
          : [''];
    setProfileForm({
      type: field.type === 'Checkbox' ? 'Yes/No Checkbox' : field.type,
      name: field.name,
      mandatory: field.mandatory,
      options: opts.length > 0 ? opts : [''],
      hideFromParent: Boolean(field.hideFromParent),
      disableTeacherEdit: Boolean(field.disableTeacherEdit),
      disableTeacherView: Boolean(field.disableTeacherView),
      exceptionRoles: field.exceptionRoles ?? [],
      autoIncrement: Boolean(field.autoIncrement),
      autoPrefix: field.autoPrefix ?? '',
      autoStart: field.autoStart ?? '1',
    });
    setModalOpen(true);
  };

  const submitProfileField = () => {
    if (!profileForm.type || !profileForm.name.trim()) {
      setToast({ type: 'err', message: 'Please fill out all details' });
      return;
    }
    if (profileForm.type === 'Dropdown') {
      const cleaned = profileForm.options.map((o) => o.trim()).filter(Boolean);
      if (cleaned.length === 0) {
        setToast({ type: 'err', message: 'Dropdown options cannot be empty' });
        return;
      }
    }
    if (profileForm.type === 'Text' && profileForm.autoIncrement) {
      if (!profileForm.autoPrefix.trim() || !profileForm.autoStart.trim()) {
        setToast({ type: 'err', message: 'Prefix and Starting Counter are required' });
        return;
      }
    }

    const cleanedOptions =
      profileForm.type === 'Dropdown'
        ? profileForm.options.map((o) => o.trim()).filter(Boolean)
        : undefined;

    const next: FormField = {
      id: editingId ?? `field-${Date.now()}`,
      type: profileForm.type,
      name: profileForm.name.trim(),
      mandatory: profileForm.mandatory,
      options: cleanedOptions,
      values: cleanedOptions ? cleanedOptions.join(', ') : undefined,
      hideFromParent: profileForm.hideFromParent,
      disableTeacherEdit: profileForm.disableTeacherEdit,
      disableTeacherView: profileForm.disableTeacherView,
      exceptionRoles: profileForm.exceptionRoles,
      autoIncrement: profileForm.type === 'Text' ? profileForm.autoIncrement : false,
      autoPrefix:
        profileForm.type === 'Text' && profileForm.autoIncrement
          ? profileForm.autoPrefix.trim()
          : undefined,
      autoStart:
        profileForm.type === 'Text' && profileForm.autoIncrement
          ? profileForm.autoStart.trim()
          : undefined,
    };

    persistProfile((prev) => {
      const tab = prev[profileTab];
      if (fieldTarget === 'unsectioned') {
        const unsectioned = editingId
          ? tab.unsectioned.map((f) => (f.id === editingId ? next : f))
          : [...tab.unsectioned, next];
        return { ...prev, [profileTab]: { ...tab, unsectioned } };
      }
      const sections = tab.sections.map((s) => {
        if (s.id !== fieldTarget) return s;
        const fields = editingId
          ? s.fields.map((f) => (f.id === editingId ? next : f))
          : [...s.fields, next];
        return { ...s, fields };
      });
      return { ...prev, [profileTab]: { ...tab, sections } };
    });
    setModalOpen(false);
    setToast({ type: 'ok', message: editingId ? 'Field updated successfully!' : 'Field added successfully!' });
  };

  const submitField = () => {
    if (activeId === 'profile-fields') {
      submitProfileField();
      return;
    }
    if (!form.type || !form.name.trim()) {
      setToast({ type: 'err', message: 'Please fill out all details' });
      return;
    }

    const next: FormField = {
      id: editingId ?? `field-${Date.now()}`,
      type: form.type,
      name: form.name.trim(),
      mandatory: form.mandatory,
      values: form.type === 'Dropdown' ? form.values.trim() : undefined,
    };

    if (!activeId) return;
    setFieldsByCategory((prev) => {
      const list = prev[activeId];
      if (editingId) {
        return { ...prev, [activeId]: list.map((f) => (f.id === editingId ? next : f)) };
      }
      return { ...prev, [activeId]: [...list, next] };
    });
    setModalOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const deleteField = (id: string) => {
    if (!activeId || activeId === 'profile-fields') return;
    setFieldsByCategory((prev) => ({
      ...prev,
      [activeId]: prev[activeId].filter((f) => f.id !== id),
    }));
    setToast({ type: 'ok', message: 'Saved' });
  };

  const deleteProfileField = (id: string, target: 'unsectioned' | string) => {
    persistProfile((prev) => {
      const tab = prev[profileTab];
      if (target === 'unsectioned') {
        return {
          ...prev,
          [profileTab]: { ...tab, unsectioned: tab.unsectioned.filter((f) => f.id !== id) },
        };
      }
      return {
        ...prev,
        [profileTab]: {
          ...tab,
          sections: tab.sections.map((s) =>
            s.id === target ? { ...s, fields: s.fields.filter((f) => f.id !== id) } : s,
          ),
        },
      };
    });
    setToast({ type: 'ok', message: 'Field deleted' });
  };

  const submitSection = () => {
    if (!sectionName.trim()) {
      setToast({ type: 'err', message: 'Please fill out all details' });
      return;
    }
    if (profileTab === 'parent') return;
    persistProfile((prev) => {
      const tab = prev[profileTab];
      return {
        ...prev,
        [profileTab]: {
          ...tab,
          sections: [
            ...tab.sections,
            { id: `sec-${Date.now()}`, name: sectionName.trim(), fields: [] },
          ],
        },
      };
    });
    setSectionModalOpen(false);
    setSectionName('');
    setToast({ type: 'ok', message: 'Section added successfully!' });
  };

  const ToggleRow = ({
    title,
    description,
    on,
    onToggle,
    tone,
  }: {
    title: string;
    description: string;
    on: boolean;
    onToggle: () => void;
    tone: 'purple' | 'green' | 'pink' | 'amber';
  }) => {
    const toneClass =
      tone === 'purple'
        ? styles.tone_purple
        : tone === 'green'
          ? styles.tone_green
          : tone === 'pink'
            ? styles.tone_pink
            : styles.tone_amber;
    return (
      <div className={`${styles.toggleCard} ${toneClass}`}>
        <div className={styles.toggleText}>
          <div className={styles.toggleTitle}>{title}</div>
          <div className={styles.toggleDesc}>{description}</div>
        </div>
        <button
          type="button"
          className={`${styles.switch} ${on ? styles.switchOn : ''}`}
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={onToggle}
        >
          <span className={styles.switchThumb} aria-hidden />
        </button>
      </div>
    );
  };

  const profileFieldModal = (
    <Modal
      open={modalOpen && activeId === 'profile-fields'}
      title={editingId ? 'Edit Field' : 'Add Field'}
      onClose={() => setModalOpen(false)}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submitProfileField}>
            {editingId ? 'Save Field' : 'Add Field'}
          </button>
        </>
      }
    >
      <div className={styles.modalStack}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="profile-field-name">
            <span className={styles.req}>*</span> Field Name
          </label>
          <input
            id="profile-field-name"
            className="ui-input"
            placeholder="Enter field name..."
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="profile-field-type">
            <span className={styles.req}>*</span> Field Type
          </label>
          <select
            id="profile-field-type"
            className="ui-select"
            value={profileForm.type}
            onChange={(e) => {
              const type = e.target.value as '' | FieldType;
              setProfileForm((f) => ({
                ...f,
                type,
                options: type === 'Dropdown' ? (f.options.length ? f.options : ['']) : f.options,
                autoIncrement: type === 'Text' ? f.autoIncrement : false,
              }));
            }}
          >
            <option value="">Select Type</option>
            {PROFILE_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {profileForm.type === 'Dropdown' ? (
          <div className={styles.optionsBox}>
            <div className={styles.optionsTitle}>Dropdown Options</div>
            <div className={styles.optionsList}>
              {profileForm.options.map((opt, idx) => (
                <div key={`opt-${idx}`} className={styles.optionRow}>
                  <input
                    className="ui-input"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) =>
                      setProfileForm((f) => {
                        const options = [...f.options];
                        options[idx] = e.target.value;
                        return { ...f, options };
                      })
                    }
                  />
                  <button
                    type="button"
                    className={styles.optionRemove}
                    aria-label={`Remove option ${idx + 1}`}
                    onClick={() =>
                      setProfileForm((f) => ({
                        ...f,
                        options: f.options.length <= 1 ? [''] : f.options.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addOptionBtn}
              onClick={() => setProfileForm((f) => ({ ...f, options: [...f.options, ''] }))}
            >
              + Add Option
            </button>
            <p className={styles.optionsHint}>Dropdown options cannot be empty</p>
          </div>
        ) : null}

        <ToggleRow
          title="Required Field"
          description="Make this field mandatory"
          tone="purple"
          on={profileForm.mandatory}
          onToggle={() => setProfileForm((f) => ({ ...f, mandatory: !f.mandatory }))}
        />

        {profileForm.type === 'Text' ? (
          <>
            <ToggleRow
              title="Auto Increment"
              description="Automatically generate incremental values"
              tone="green"
              on={profileForm.autoIncrement}
              onToggle={() => setProfileForm((f) => ({ ...f, autoIncrement: !f.autoIncrement }))}
            />
            {profileForm.autoIncrement ? (
              <div className={styles.autoIncBox}>
                <div className={styles.autoIncTitle}>Auto Increment Settings</div>
                <div className={styles.autoIncGrid}>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="auto-prefix">
                      <span className={styles.req}>*</span> Prefix
                    </label>
                    <input
                      id="auto-prefix"
                      className="ui-input"
                      value={profileForm.autoPrefix}
                      onChange={(e) => setProfileForm((f) => ({ ...f, autoPrefix: e.target.value }))}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="auto-start">
                      <span className={styles.req}>*</span> Starting Counter
                    </label>
                    <input
                      id="auto-start"
                      className="ui-input"
                      value={profileForm.autoStart}
                      onChange={(e) => setProfileForm((f) => ({ ...f, autoStart: e.target.value }))}
                    />
                  </div>
                </div>
                <p className={styles.optionsHint}>
                  Example: Prefix &apos;STU&apos; with counter &apos;1001&apos; will generate STU1001, STU1002, etc.
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        <div className={styles.permSection}>
          <div className={styles.permHeading}>Parent Permissions</div>
          <ToggleRow
            title="Hide from Parent"
            description="Hide this field from parent view"
            tone="pink"
            on={profileForm.hideFromParent}
            onToggle={() => setProfileForm((f) => ({ ...f, hideFromParent: !f.hideFromParent }))}
          />
        </div>

        <div className={styles.permSection}>
          <div className={styles.permHeading}>Teacher Permissions</div>
          <div className={styles.permStack}>
            <ToggleRow
              title="Disable Teacher Edit"
              description="Prevent teachers from editing this field"
              tone="amber"
              on={profileForm.disableTeacherEdit}
              onToggle={() =>
                setProfileForm((f) => ({ ...f, disableTeacherEdit: !f.disableTeacherEdit }))
              }
            />
            <ToggleRow
              title="Disable Teacher View"
              description="Prevent teachers from viewing this field"
              tone="amber"
              on={profileForm.disableTeacherView}
              onToggle={() =>
                setProfileForm((f) => ({ ...f, disableTeacherView: !f.disableTeacherView }))
              }
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="exception-roles">
            Exception Roles (who can edit/view despite restrictions)
          </label>
          <select
            id="exception-roles"
            className="ui-select"
            value=""
            onChange={(e) => {
              const role = e.target.value;
              if (!role) return;
              setProfileForm((f) =>
                f.exceptionRoles.includes(role)
                  ? f
                  : { ...f, exceptionRoles: [...f.exceptionRoles, role] },
              );
            }}
          >
            <option value="">Select roles with exceptions</option>
            {EXCEPTION_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {profileForm.exceptionRoles.length > 0 ? (
            <div className={styles.allergyChips}>
              {profileForm.exceptionRoles.map((role) => (
                <span key={role} className={styles.allergyChip}>
                  {role}
                  <button
                    type="button"
                    className={styles.allergyChipRemove}
                    aria-label={`Remove ${role}`}
                    onClick={() =>
                      setProfileForm((f) => ({
                        ...f,
                        exceptionRoles: f.exceptionRoles.filter((r) => r !== role),
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
      </div>
    </Modal>
  );

  const fieldModal = (
    <Modal
      open={modalOpen && activeId !== 'profile-fields'}
      title={editingId ? 'Edit Form Item' : 'Add Form Item'}
      onClose={() => setModalOpen(false)}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submitField}>
            Submit
          </button>
        </>
      }
    >
      <div className={styles.modalStack}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="forms-type">
            <span className={styles.req}>*</span> Type
          </label>
          <select
            id="forms-type"
            className="ui-select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as '' | FieldType }))}
          >
            <option value="">Select Type</option>
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor="forms-name">
            <span className={styles.req}>*</span> Field Name
          </label>
          <input
            id="forms-name"
            className="ui-input"
            placeholder="Field Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        {form.type === 'Dropdown' ? (
          <div className="ui-field">
            <label className="ui-label" htmlFor="forms-values">
              Dropdown values
            </label>
            <input
              id="forms-values"
              className="ui-input"
              placeholder="Comma-separated values"
              value={form.values}
              onChange={(e) => setForm((f) => ({ ...f, values: e.target.value }))}
            />
          </div>
        ) : null}
        <label className={styles.mandatory} htmlFor="forms-mandatory">
          <input
            id="forms-mandatory"
            type="checkbox"
            className={styles.mandatoryInput}
            checked={form.mandatory}
            onChange={(e) => setForm((f) => ({ ...f, mandatory: e.target.checked }))}
          />
          <span className={`${styles.box} ${form.mandatory ? styles.boxOn : ''}`} aria-hidden>
            {form.mandatory ? '✓' : ''}
          </span>
          Mandatory
        </label>
      </div>
    </Modal>
  );

  const toastEl = toast ? (
    <div className={styles.toast} role="status">
      <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
        {toast.type === 'ok' ? '✓' : '×'}
      </span>
      <span>{toast.message}</span>
      <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
        ×
      </button>
    </div>
  ) : null;

  const renderFieldRows = (fields: FormField[], target: 'unsectioned' | string) =>
    fields.map((field) => (
      <div key={field.id} className={styles.profileFieldItem}>
        <DragHandle />
        <div className={styles.profileFieldMeta}>
          <div className={styles.profileFieldName}>{field.name}</div>
          <div className={styles.profileFieldTags}>
            <span className={styles.fieldTag}>{fieldTypeLabel(field.type)}</span>
            {field.mandatory ? <span className={styles.fieldTag}>Required</span> : null}
            {field.autoIncrement ? <span className={styles.fieldTag}>Auto Increment</span> : null}
            {field.hideFromParent ? <span className={styles.fieldTag}>Hidden from Parent</span> : null}
          </div>
        </div>
        <div className={styles.profileFieldActions}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={`Edit ${field.name}`}
            onClick={() => openEditProfileField(field, target)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M13 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            aria-label={`Delete ${field.name}`}
            onClick={() => deleteProfileField(field.id, target)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    ));

  const renderFieldsCard = (
    fields: FormField[],
    target: 'unsectioned' | string,
    title: string,
    description: string,
    showAddButton: boolean,
  ) => (
    <div className={styles.fieldsCard}>
      <div className={styles.fieldsCardHead}>
        <div className={styles.fieldsCardHeadText}>
          <div className={styles.fieldsCardTitleRow}>
            <h3 className={styles.fieldsCardTitle}>{title}</h3>
            <span className={styles.fieldsBadge}>
              {fields.length} {fields.length === 1 ? 'field' : 'fields'}
            </span>
          </div>
          <p className={styles.fieldsCardDesc}>{description}</p>
        </div>
      </div>

      {fields.length === 0 ? (
        <button
          type="button"
          className={styles.fieldsEmpty}
          onClick={() => openAddProfileField(target)}
        >
          <span className={styles.fieldsEmptyIcon} aria-hidden>
            +
          </span>
          <span className={styles.fieldsEmptyTitle}>No fields yet</span>
          <span className={styles.fieldsEmptyHint}>Add a field or drag one here</span>
        </button>
      ) : (
        <div className={styles.profileFieldList}>{renderFieldRows(fields, target)}</div>
      )}

      {showAddButton ? (
        <button type="button" className={styles.addFieldBtn} onClick={() => openAddProfileField(target)}>
          + Add Field
        </button>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading} role="status" aria-label="Loading">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    );
  }

  if (activeId === 'profile-fields') {
    const showAddSection = profileTab === 'student' || profileTab === 'teacher';
    const addSectionLabel = profileTab === 'student' ? 'Add Student Section' : 'Add Teacher Section';
    const addSectionHint =
      profileTab === 'student'
        ? 'Create a new section for student profile'
        : 'Create a new section for teacher profile';
    const addSectionTone = profileTab === 'student' ? styles.addSectionPurple : styles.addSectionPeach;

    return (
      <div className={styles.root}>
        <div className={styles.profileHead}>
          <button type="button" className={styles.goBack} onClick={() => setActiveId(null)}>
            ← Go Back
          </button>
          <span className={styles.titleSep} aria-hidden>
            |
          </span>
          <h1 className={styles.detailTitle}>Profile</h1>
        </div>

        <div className={styles.profileTabs} role="tablist" aria-label="Profile field types">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={profileTab === tab.id}
              className={`${styles.profileTab} ${profileTab === tab.id ? styles.profileTabActive : ''}`}
              onClick={() => setProfileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {profileTab === 'student' ? (
          <div className={`${styles.allergyCard} ${allergyOpen ? styles.allergyCardOpen : ''}`}>
            <button
              type="button"
              className={styles.allergyBar}
              aria-expanded={allergyOpen}
              onClick={() => setAllergyOpen((v) => !v)}
            >
              <span className={styles.allergyLeft}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Allergy Configuration
              </span>
              <span className={styles.allergyRight}>
                <span className={styles.allergySummaryItem}>
                  Allergy Categories: <strong title={allergyCategoriesSummary}>{allergyCategoriesSummary}</strong>
                </span>
                <span className={styles.allergySep}>|</span>
                <span className={styles.allergySummaryItem}>
                  Severity Levels: <strong>{allergySeveritySummary}</strong>
                </span>
                <svg
                  className={`${styles.allergyChevron} ${allergyOpen ? styles.allergyChevronOpen : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden
                >
                  <path d="M3 5.5 7 9.5 11 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </button>

            {allergyOpen ? (
              <div className={styles.allergyPanel}>
                <div className={styles.allergyGrid}>
                  <div className={styles.allergyCol}>
                    <label className={styles.allergyColLabel} htmlFor="allergy-category-input">
                      Allergy Categories
                    </label>
                    <div className={styles.allergyAddRow}>
                      <input
                        id="allergy-category-input"
                        className={`ui-input ${styles.allergyInput}`}
                        placeholder="Add Value"
                        value={categoryDraft}
                        onChange={(e) => setCategoryDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAllergyCategory();
                          }
                        }}
                      />
                      <button type="button" className={`ui-btn ui-btn-primary ${styles.allergyAddBtn}`} onClick={addAllergyCategory}>
                        Add
                      </button>
                    </div>
                    <div className={styles.allergyChips}>
                      {allergyConfig.categories.map((c) => (
                        <span key={c.id} className={styles.allergyChip}>
                          {c.name}
                          <button
                            type="button"
                            className={styles.allergyChipRemove}
                            aria-label={`Remove ${c.name}`}
                            onClick={() => removeAllergyCategory(c.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.allergyCol}>
                    <label className={styles.allergyColLabel} htmlFor="allergy-severity-input">
                      Severity Levels
                    </label>
                    <div className={styles.allergyAddRow}>
                      <input
                        id="allergy-severity-input"
                        className={`ui-input ${styles.allergyInput}`}
                        placeholder="Enter severity level name"
                        value={severityDraft}
                        onChange={(e) => setSeverityDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAllergySeverity();
                          }
                        }}
                      />
                      <button type="button" className={`ui-btn ui-btn-primary ${styles.allergyAddBtn}`} onClick={addAllergySeverity}>
                        Add
                      </button>
                    </div>
                    <div className={styles.allergySeverityList}>
                      {allergyConfig.severities.map((s) => (
                        <div key={s.id} className={styles.allergySeverityItem}>
                          <span className={styles.allergySeveritySwatch} style={{ background: s.color }} aria-hidden />
                          <span className={styles.allergySeverityName}>{s.name}</span>
                          <button
                            type="button"
                            className={styles.allergyChipRemove}
                            aria-label={`Remove ${s.name}`}
                            onClick={() => removeAllergySeverity(s.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {profileTab === 'student' ? (
          <h2 className={styles.profileSectionTitle}>Student Additional Fields</h2>
        ) : null}

        <div
          className={`${styles.profileGrid} ${
            profileTab === 'parent' ? styles.profileGridSingle : styles.profileGridTwo
          }`}
        >
          {renderFieldsCard(
            profileTabData.unsectioned,
            'unsectioned',
            'Additional Fields',
            'These fields appear without a section header',
            profileTab === 'parent' || profileTabData.unsectioned.length > 0,
          )}

          {showAddSection ? (
            <button
              type="button"
              className={`${styles.addSectionCard} ${addSectionTone}`}
              onClick={() => {
                setSectionName('');
                setSectionModalOpen(true);
              }}
            >
              <span className={styles.addSectionIcon} aria-hidden>
                +
              </span>
              <span className={styles.addSectionTitle}>{addSectionLabel}</span>
              <span className={styles.addSectionHint}>{addSectionHint}</span>
            </button>
          ) : null}
        </div>

        {profileTabData.sections.length > 0 ? (
          <div className={styles.profileSections}>
            {profileTabData.sections.map((section) =>
              renderFieldsCard(
                section.fields,
                section.id,
                section.name,
                'Fields in this profile section',
                true,
              ),
            )}
          </div>
        ) : null}

        <Modal
          open={sectionModalOpen}
          title={addSectionLabel}
          onClose={() => setSectionModalOpen(false)}
          footer={
            <>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => setSectionModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={submitSection}>
                Add
              </button>
            </>
          }
        >
          <div className="ui-field">
            <label className="ui-label" htmlFor="profile-section-name">
              <span className={styles.req}>*</span> Section Name
            </label>
            <input
              id="profile-section-name"
              className="ui-input"
              placeholder="Section Name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
          </div>
        </Modal>

        {profileFieldModal}
        {fieldModal}
        {toastEl}
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div className={styles.root}>
        <div className={styles.detailHead}>
          <div className={styles.detailTitleRow}>
            <button type="button" className={styles.goBack} onClick={() => setActiveId(null)}>
              ← Go Back
            </button>
            <span className={styles.titleSep} aria-hidden>
              |
            </span>
            <h1 className={styles.detailTitle}>{activeCategory.detailTitle}</h1>
          </div>
          <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
            + Add Form Item
          </button>
        </div>

        <section className={styles.detailBody}>
          {activeFields.length === 0 ? (
            <div className={styles.emptyHint} aria-hidden />
          ) : (
            <div className={styles.fieldList}>
              {activeFields.map((field) => (
                <div key={field.id} className={styles.fieldRow}>
                  <div className={styles.fieldMeta}>
                    <div className={styles.fieldName}>{field.name}</div>
                    <div className={styles.fieldSub}>
                      {field.type}
                      {field.mandatory ? ' · Mandatory' : ''}
                      {field.type === 'Dropdown' && field.values ? ` · ${field.values}` : ''}
                    </div>
                  </div>
                  <div className={styles.fieldActions}>
                    <button type="button" className="ui-btn ui-btn-outline" onClick={() => openEdit(field)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`ui-btn ui-btn-outline ${styles.deleteBtn}`}
                      onClick={() => deleteField(field.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {fieldModal}
        {toastEl}
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Forms"
      description="Configure check-in, check-out, profile, and parent–teacher form fields."
      icon={<ClipboardList />}
    >
    <div className={styles.root}>
      <div className={styles.hubIntro}>
        <p>Pick a form surface to manage the fields staff and parents fill in every day.</p>
      </div>
      <div className={styles.grid}>
        {CATEGORIES.map((cat, index) => {
          const meta = CATEGORY_META[cat.id];
          const count = fieldsByCategory[cat.id]?.length ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.card} ${styles[`tone_${meta.tone}` as keyof typeof styles] ?? ''}`}
              style={{ animationDelay: `${index * 45}ms` }}
              onClick={() => {
                setActiveId(cat.id);
                if (cat.id === 'profile-fields') setProfileTab('student');
              }}
            >
              <span className={styles.cardIcon}>
                <CategoryIcon id={cat.id} />
              </span>
              <span className={styles.cardCopy}>
                <span className={styles.cardLabel}>{cat.label}</span>
                <span className={styles.cardBlurb}>{meta.blurb}</span>
                <span className={styles.cardMeta}>
                  {count} field{count === 1 ? '' : 's'} configured
                </span>
              </span>
              <span className={styles.cardChevron} aria-hidden>
                ›
              </span>
            </button>
          );
        })}
      </div>
    </div>
    </SettingsSectionShell>
  );
}

