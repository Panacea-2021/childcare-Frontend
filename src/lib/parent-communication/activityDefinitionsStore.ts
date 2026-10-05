'use client';

import { ACTIVITY_TYPES } from '@/lib/mock/mockActivityTypes';
import type {
  ActivityCustomField,
  ActivityDefinition,
  ActivityEnableFlags,
  ActivityGeneralSettings,
} from '@/types/activityDefinition';
import { defaultEnableFlags } from '@/types/activityDefinition';

const STORAGE_KEY = 'panacea.activities.definitions.v1';
const GENERAL_KEY = 'panacea.activities.general.v1';
const VERSION_KEY = 'panacea.activities.definitions.version';
const CURRENT_VERSION = '1';

type StoredBundle = {
  activities: ActivityDefinition[];
};

/** Per-activity field & flag overlays on top of the communication catalog. */
const FIELD_SEED: Record<
  string,
  {
    enable?: Partial<ActivityEnableFlags>;
    fields?: ActivityCustomField[];
    notifyParents?: boolean;
    staffOnly?: boolean;
    tags?: string[];
    deletable?: boolean;
  }
> = {
  bottle: {
    enable: { noApproval: true },
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
  'todays-mood': {
    enable: { fileUpload: true, mediaUpload: true, comments: true },
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
  photo: {
    enable: { fileUpload: true, mediaUpload: true, comments: true },
  },
  video: {
    enable: { mediaUpload: true, comments: true },
  },
  diary: {
    enable: { fileUpload: true, comments: true },
  },
  announcement: {
    enable: { comments: true },
    notifyParents: true,
  },
  'name-to-face': {
    enable: { fileUpload: true, mediaUpload: true, draftMode: true },
    notifyParents: false,
    staffOnly: true,
    tags: ['Here', 'Outdoor', 'Nap Check', 'Diaper Check'],
  },
  stem: {
    enable: { fileUpload: true, mediaUpload: true },
  },
  food: {
    enable: { mediaUpload: true },
    fields: [
      {
        id: 'meal-type',
        name: 'Meal Type',
        type: 'Dropdown',
        mandatory: true,
        enableAi: false,
        values: 'Breakfast, Lunch, Afternoon Snack, Late Snack',
      },
      {
        id: 'meal-amount',
        name: 'Amount eaten',
        type: 'Dropdown',
        mandatory: false,
        enableAi: false,
        values: 'All, Most, Some, None',
      },
    ],
  },
  nap: {
    enable: { draftMode: true },
    fields: [
      {
        id: 'nap-start',
        name: 'Nap start',
        type: 'Time',
        mandatory: true,
        enableAi: false,
      },
      {
        id: 'nap-end',
        name: 'Nap end',
        type: 'Time',
        mandatory: false,
        enableAi: false,
      },
    ],
  },
  dancing: {
    enable: { fileUpload: true, mediaUpload: true },
    fields: [
      {
        id: 'dance-q',
        name: 'Which dance you love',
        type: 'Text',
        mandatory: false,
        enableAi: false,
      },
    ],
    deletable: true,
  },
  playing: {
    enable: { fileUpload: true, mediaUpload: true },
  },
};

const DEFAULT_GENERAL: ActivityGeneralSettings = {
  checkedInOnly: false,
  disablePhotoDownload: true,
  disableVideoDownload: false,
  allCheckedInIgnoreRoom: false,
  ccEmail: '',
};

function seedDefinitions(): ActivityDefinition[] {
  return ACTIVITY_TYPES.map((t) => {
    const overlay = FIELD_SEED[t.id] ?? {};
    return {
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      bgColor: t.bgColor,
      category: t.category,
      description: t.description,
      deletable: overlay.deletable ?? false,
      active: true,
      notifyParents: overlay.notifyParents ?? true,
      staffOnly: overlay.staffOnly ?? false,
      enable: defaultEnableFlags(overlay.enable),
      tags: overlay.tags,
      fields: overlay.fields ? structuredClone(overlay.fields) : [],
      custom: false,
    };
  });
}

function cloneList(list: ActivityDefinition[]): ActivityDefinition[] {
  return structuredClone(list);
}

let cache: ActivityDefinition[] | null = null;
let generalCache: ActivityGeneralSettings | null = null;

export function loadActivityDefinitions(): ActivityDefinition[] {
  if (cache) return cloneList(cache);
  if (typeof window === 'undefined') {
    cache = seedDefinitions();
    return cloneList(cache);
  }
  try {
    const ver = localStorage.getItem(VERSION_KEY);
    if (ver !== CURRENT_VERSION) {
      cache = seedDefinitions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: cache }));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return cloneList(cache);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = seedDefinitions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: cache }));
      return cloneList(cache);
    }
    const parsed = JSON.parse(raw) as StoredBundle;
    if (!Array.isArray(parsed.activities) || parsed.activities.length === 0) {
      cache = seedDefinitions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: cache }));
      return cloneList(cache);
    }
    cache = parsed.activities;
    return cloneList(cache);
  } catch {
    cache = seedDefinitions();
    return cloneList(cache);
  }
}

export function saveActivityDefinitions(list: ActivityDefinition[]) {
  cache = cloneList(list);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: cache }));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  } catch {
    /* ignore */
  }
}

export function loadActivityGeneralSettings(): ActivityGeneralSettings {
  if (generalCache) return { ...generalCache };
  if (typeof window === 'undefined') {
    generalCache = { ...DEFAULT_GENERAL };
    return { ...generalCache };
  }
  try {
    const raw = localStorage.getItem(GENERAL_KEY);
    if (!raw) {
      generalCache = { ...DEFAULT_GENERAL };
      return { ...generalCache };
    }
    generalCache = { ...DEFAULT_GENERAL, ...(JSON.parse(raw) as ActivityGeneralSettings) };
    return { ...generalCache };
  } catch {
    generalCache = { ...DEFAULT_GENERAL };
    return { ...generalCache };
  }
}

export function saveActivityGeneralSettings(next: ActivityGeneralSettings) {
  generalCache = { ...next };
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GENERAL_KEY, JSON.stringify(generalCache));
  } catch {
    /* ignore */
  }
}

export function getActivityDefinitionById(id: string): ActivityDefinition | undefined {
  return loadActivityDefinitions().find((a) => a.id === id);
}

export function listPostableActivities(): ActivityDefinition[] {
  return loadActivityDefinitions().filter((a) => a.active);
}

export function upsertActivityDefinition(activity: ActivityDefinition) {
  const list = loadActivityDefinitions();
  const idx = list.findIndex((a) => a.id === activity.id);
  if (idx >= 0) list[idx] = activity;
  else list.push(activity);
  saveActivityDefinitions(list);
  return list;
}

export function deleteActivityDefinition(id: string) {
  const list = loadActivityDefinitions();
  const target = list.find((a) => a.id === id);
  if (!target?.deletable) return list;
  const next = list.filter((a) => a.id !== id);
  saveActivityDefinitions(next);
  return next;
}

export function createCustomActivity(input: {
  name: string;
  color: string;
  bgColor: string;
  icon?: string;
  imageUrl?: string;
  category?: ActivityDefinition['category'];
}): ActivityDefinition {
  const activity: ActivityDefinition = {
    id: `custom-${Date.now()}`,
    name: input.name.trim(),
    icon: input.icon || 'Sparkles',
    color: input.color,
    bgColor: input.bgColor,
    category: input.category || 'Communication',
    description: 'Custom activity',
    deletable: true,
    active: true,
    notifyParents: true,
    staffOnly: false,
    enable: defaultEnableFlags({ fileUpload: true, mediaUpload: true, comments: true }),
    fields: [],
    custom: true,
    imageUrl: input.imageUrl,
  };
  upsertActivityDefinition(activity);
  return activity;
}

export function resetActivityDefinitions() {
  cache = seedDefinitions();
  generalCache = { ...DEFAULT_GENERAL };
  if (typeof window === 'undefined') return cloneList(cache);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: cache }));
  localStorage.setItem(GENERAL_KEY, JSON.stringify(generalCache));
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  return cloneList(cache);
}
